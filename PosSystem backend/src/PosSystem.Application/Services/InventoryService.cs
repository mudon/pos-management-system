using PosSystem.Application.DTOs.Inventory;
using PosSystem.Application.Interfaces;
using PosSystem.Domain.Entities;

namespace PosSystem.Application.Services;

public class InventoryService : IInventoryService
{
    private readonly IInventoryRepository _inventoryRepository;
    private readonly IProductRepository _productRepository;
    private readonly IInventoryLogRepository _inventoryLogRepository;

    public InventoryService(
        IInventoryRepository inventoryRepository,
        IProductRepository productRepository,
        IInventoryLogRepository inventoryLogRepository)
    {
        _inventoryRepository = inventoryRepository;
        _productRepository = productRepository;
        _inventoryLogRepository = inventoryLogRepository;
    }

    public async Task<IEnumerable<InventoryDto>> GetAllInventoryAsync()
    {
        var inventoryItems = await _inventoryRepository.GetAllWithProductsAsync();
        
        return inventoryItems.Select(i => new InventoryDto
        {
            ProductId = i.ProductId,
            ProductName = i.Product.Name,
            ProductBarcode = i.Product.Barcode,
            Quantity = i.Quantity,
            LastUpdated = i.UpdatedAt
        });
    }

    public async Task<InventoryDto?> GetInventoryByProductIdAsync(int productId)
    {
        var inventory = await _inventoryRepository.GetByProductIdWithDetailsAsync(productId);
        if (inventory == null)
            return null;

        return new InventoryDto
        {
            ProductId = inventory.ProductId,
            ProductName = inventory.Product.Name,
            ProductBarcode = inventory.Product.Barcode,
            Quantity = inventory.Quantity,
            LastUpdated = inventory.UpdatedAt
        };
    }

    public async Task<InventoryDto?> GetInventoryByBarcodeAsync(string barcode)
    {
        var product = await _productRepository.GetByBarcodeAsync(barcode);
        if (product == null)
            return null;

        return await GetInventoryByProductIdAsync(product.Id);
    }

    public async Task<bool> UpdateStockAsync(int productId, UpdateStockDto dto)
    {
        var inventory = await _inventoryRepository.GetByProductIdAsync(productId);
        if (inventory == null)
            return false;

        // Prevent negative stock
        if (dto.Quantity < 0)
            throw new InvalidOperationException("Stock quantity cannot be negative.");

        var oldQuantity = inventory.Quantity;
        inventory.Quantity = dto.Quantity;
        inventory.UpdatedAt = DateTime.UtcNow;

        await _inventoryRepository.UpdateAsync(inventory);

        // Log the change
        await LogInventoryChange(productId, dto.Quantity - oldQuantity, dto.Reason ?? "Manual stock update");
        
        return true;
    }

    public async Task<bool> AdjustStockAsync(int productId, AdjustStockDto dto)
    {
        var inventory = await _inventoryRepository.GetByProductIdAsync(productId);
        if (inventory == null)
            return false;

        // Check if resulting stock would be negative
        if (inventory.Quantity + dto.Change < 0)
            throw new InvalidOperationException($"Cannot adjust stock. Current: {inventory.Quantity}, Change: {dto.Change}. Result would be negative.");

        Console.WriteLine($"qweqweqwe");


        var oldQuantity = inventory.Quantity;
        inventory.Quantity += dto.Change;
        inventory.UpdatedAt = DateTime.UtcNow;

        await _inventoryRepository.UpdateAsync(inventory);
        Console.WriteLine($"zxczxc");

        // Log the change
        await LogInventoryChange(productId, dto.Change, dto.Reason ?? "Manual stock adjustment");
        
        return true;
    }

    public async Task<bool> CheckStockAvailableAsync(int productId, int requiredQuantity)
    {
        var inventory = await _inventoryRepository.GetByProductIdAsync(productId);
        if (inventory == null)
            return false;

        return inventory.Quantity >= requiredQuantity;
    }

    public async Task<IEnumerable<StockLevelDto>> GetLowStockItemsAsync()
    {
        var inventoryItems = await _inventoryRepository.GetAllWithProductsAsync();
        const int minimumStock = 10; // You can make this configurable
        
        return inventoryItems
            .Where(i => i.Quantity <= minimumStock)
            .Select(i => new StockLevelDto
            {
                ProductId = i.ProductId,
                ProductName = i.Product.Name,
                Barcode = i.Product.Barcode,
                CurrentStock = i.Quantity,
                MinimumStock = minimumStock
            });
    }

    public async Task<IEnumerable<InventoryDto>> SearchInventoryAsync(string? productName, string? barcode, bool? lowStockOnly)
    {
        var inventoryItems = await _inventoryRepository.GetAllWithProductsAsync();
        
        var query = inventoryItems.AsQueryable();

        if (!string.IsNullOrEmpty(productName))
            query = query.Where(i => i.Product.Name.Contains(productName, StringComparison.OrdinalIgnoreCase));

        if (!string.IsNullOrEmpty(barcode))
            query = query.Where(i => i.Product.Barcode.Contains(barcode, StringComparison.OrdinalIgnoreCase));

        if (lowStockOnly == true)
            query = query.Where(i => i.Quantity <= 10); // Low stock threshold

        return query.Select(i => new InventoryDto
        {
            ProductId = i.ProductId,
            ProductName = i.Product.Name,
            ProductBarcode = i.Product.Barcode,
            Quantity = i.Quantity,
            LastUpdated = i.UpdatedAt
        });
    }

    private async Task LogInventoryChange(int productId, int changeQty, string reason)
    {
        var log = new InventoryLog
        {
            ProductId = productId,
            ChangeQty = changeQty,
            Reason = reason,
            CreatedAt = DateTime.UtcNow
        };

        await _inventoryLogRepository.AddAsync(log);
    }
}