using PosSystem.Application.DTOs.Sales;
using PosSystem.Application.Interfaces;
using PosSystem.Domain.Entities;

namespace PosSystem.Application.Services;

public class SaleItemService : ISaleItemService
{
    private readonly ISaleItemRepository _saleItemRepository;
    private readonly ISaleRepository _saleRepository;
    private readonly IProductRepository _productRepository;
    private readonly IInventoryRepository _inventoryRepository;

    public SaleItemService(
        ISaleItemRepository saleItemRepository,
        ISaleRepository saleRepository,
        IProductRepository productRepository,
        IInventoryRepository inventoryRepository)
    {
        _saleItemRepository = saleItemRepository;
        _saleRepository = saleRepository;
        _productRepository = productRepository;
        _inventoryRepository = inventoryRepository;
    }

    public async Task<IEnumerable<SaleItemDto>> GetItemsBySaleIdAsync(int saleId)
    {
        var items = await _saleItemRepository.GetBySaleIdAsync(saleId);
        
        return items.Select(item => MapToSaleItemDto(item));
    }

    public async Task<SaleItemDto?> GetSaleItemByIdAsync(int id)
    {
        var item = await _saleItemRepository.GetByIdAsync(id);
        if (item == null)
            return null;

        return MapToSaleItemDto(item);
    }

    public async Task<SaleItemDto> AddItemToSaleAsync(int saleId, CreateSaleItemDto dto)
    {
        // Validate sale exists
        var sale = await _saleRepository.GetByIdAsync(saleId);
        if (sale == null)
            throw new InvalidOperationException($"Sale with ID {saleId} not found.");

        // Validate product exists
        var product = await _productRepository.GetByIdAsync(dto.ProductId);
        if (product == null || !product.IsActive)
            throw new InvalidOperationException($"Product with ID {dto.ProductId} not found or inactive.");

        // Validate quantity
        if (dto.Quantity <= 0)
            throw new InvalidOperationException("Quantity must be greater than 0.");

        // Check stock availability
        var currentStock = await _inventoryRepository.GetStockQuantityAsync(dto.ProductId);
        if (currentStock < dto.Quantity)
            throw new InvalidOperationException($"Insufficient stock. Available: {currentStock}, Requested: {dto.Quantity}");

        // Validate price
        if (dto.PriceAtSale <= 0)
            throw new InvalidOperationException("Price must be greater than 0.");

        // Create sale item
        var saleItem = new SaleItem
        {
            SaleId = saleId,
            ProductId = dto.ProductId,
            Barcode = product.Barcode,
            ProductName = product.Name,
            Quantity = dto.Quantity,
            PriceAtSale = dto.PriceAtSale
        };

        var createdItem = await _saleItemRepository.AddAsync(saleItem);

        // Update sale total
        await UpdateSaleTotalAsync(saleId);

        // Update inventory (reduce stock)
        await _inventoryRepository.UpdateStockAsync(dto.ProductId, -dto.Quantity);

        return MapToSaleItemDto(createdItem);
    }

    public async Task<IEnumerable<SaleItemDto>> AddMultipleItemsToSaleAsync(int saleId, AddItemsToSaleDto dto)
    {
        // Validate sale exists
        var sale = await _saleRepository.GetByIdAsync(saleId);
        if (sale == null)
            throw new InvalidOperationException($"Sale with ID {saleId} not found.");

        var saleItems = new List<SaleItem>();
        var itemsToAdd = new List<SaleItemDto>();

        // Process each item
        foreach (var itemDto in dto.Items)
        {
            // Validate product exists
            var product = await _productRepository.GetByIdAsync(itemDto.ProductId);
            if (product == null || !product.IsActive)
                throw new InvalidOperationException($"Product with ID {itemDto.ProductId} not found or inactive.");

            // Validate quantity
            if (itemDto.Quantity <= 0)
                throw new InvalidOperationException($"Quantity must be greater than 0 for product {itemDto.ProductId}.");

            // Check stock availability
            var currentStock = await _inventoryRepository.GetStockQuantityAsync(itemDto.ProductId);
            if (currentStock < itemDto.Quantity)
                throw new InvalidOperationException($"Insufficient stock for product {product.Name}. Available: {currentStock}, Requested: {itemDto.Quantity}");

            // Validate price
            if (itemDto.PriceAtSale <= 0)
                throw new InvalidOperationException($"Price must be greater than 0 for product {itemDto.ProductId}.");

            var saleItem = new SaleItem
            {
                SaleId = saleId,
                ProductId = itemDto.ProductId,
                Barcode = product.Barcode,
                ProductName = product.Name,
                Quantity = itemDto.Quantity,
                PriceAtSale = itemDto.PriceAtSale
            };

            saleItems.Add(saleItem);
        }

        // Add all items at once
        await _saleItemRepository.AddRangeAsync(saleItems);

        // Update sale total
        await UpdateSaleTotalAsync(saleId);

        // Update inventory for each item
        foreach (var item in saleItems)
        {
            await _inventoryRepository.UpdateStockAsync(item.ProductId, -item.Quantity);
            itemsToAdd.Add(MapToSaleItemDto(item));
        }

        return itemsToAdd;
    }

    public async Task<SaleItemDto?> UpdateSaleItemAsync(int id, UpdateSaleItemDto dto)
    {
        var saleItem = await _saleItemRepository.GetByIdAsync(id);
        if (saleItem == null)
            return null;

        // Get product for validation
        var product = await _productRepository.GetByIdAsync(saleItem.ProductId);
        if (product == null || !product.IsActive)
            throw new InvalidOperationException($"Product not found or inactive.");

        // Validate quantity
        if (dto.Quantity <= 0)
            throw new InvalidOperationException("Quantity must be greater than 0.");

        // Calculate quantity difference
        var quantityDifference = dto.Quantity - saleItem.Quantity;

        // Check stock availability if increasing quantity
        if (quantityDifference > 0)
        {
            var currentStock = await _inventoryRepository.GetStockQuantityAsync(saleItem.ProductId);
            if (currentStock < quantityDifference)
                throw new InvalidOperationException($"Insufficient stock. Available: {currentStock}, Additional needed: {quantityDifference}");
        }

        // Validate price
        if (dto.PriceAtSale <= 0)
            throw new InvalidOperationException("Price must be greater than 0.");

        // Update inventory if quantity changed
        if (quantityDifference != 0)
        {
            await _inventoryRepository.UpdateStockAsync(saleItem.ProductId, -quantityDifference);
        }

        // Update sale item
        saleItem.Quantity = dto.Quantity;
        saleItem.PriceAtSale = dto.PriceAtSale;

        await _saleItemRepository.UpdateAsync(saleItem);

        // Update sale total
        await UpdateSaleTotalAsync(saleItem.SaleId);

        return MapToSaleItemDto(saleItem);
    }

    public async Task<bool> RemoveItemFromSaleAsync(int id)
    {
        var saleItem = await _saleItemRepository.GetByIdAsync(id);
        if (saleItem == null)
            return false;

        // Restore inventory
        await _inventoryRepository.UpdateStockAsync(saleItem.ProductId, saleItem.Quantity);

        // Remove item
        await _saleItemRepository.DeleteAsync(saleItem);

        // Update sale total
        await UpdateSaleTotalAsync(saleItem.SaleId);

        return true;
    }

    public async Task<bool> RemoveAllItemsFromSaleAsync(int saleId)
    {
        var items = await _saleItemRepository.GetBySaleIdAsync(saleId);
        if (!items.Any())
            return false;

        // Restore inventory for all items
        foreach (var item in items)
        {
            await _inventoryRepository.UpdateStockAsync(item.ProductId, item.Quantity);
        }

        // Remove all items
        await _saleItemRepository.DeleteRangeAsync(items);

        // Update sale total to 0
        await UpdateSaleTotalAsync(saleId);

        return true;
    }

    public async Task<decimal> CalculateSaleTotalAsync(int saleId)
    {
        return await _saleItemRepository.GetSaleTotalAsync(saleId);
    }

    public async Task<SaleWithItemsDto> GetSaleWithItemsAsync(int saleId)
    {
        var sale = await _saleRepository.GetByIdWithDetailsAsync(saleId);
        if (sale == null)
            throw new InvalidOperationException($"Sale with ID {saleId} not found.");

        var items = await _saleItemRepository.GetBySaleIdAsync(saleId);

        return new SaleWithItemsDto
        {
            Id = sale.Id,
            UserId = sale.UserId,
            UserName = sale.User?.Username ?? "Unknown",
            TotalAmount = sale.TotalAmount,
            PaymentMethod = sale.PaymentMethod.ToString(),
            CreatedAt = sale.CreatedAt,
            Items = items.Select(item => MapToSaleItemDto(item)).ToList()
        };
    }

    private async Task UpdateSaleTotalAsync(int saleId)
    {
        var total = await _saleItemRepository.GetSaleTotalAsync(saleId);
        var sale = await _saleRepository.GetByIdAsync(saleId);
        
        if (sale != null && sale.TotalAmount != total)
        {
            sale.TotalAmount = total;
            await _saleRepository.UpdateAsync(sale);
        }
    }

    private SaleItemDto MapToSaleItemDto(SaleItem saleItem)
    {
        return new SaleItemDto
        {
            Id = saleItem.Id,
            SaleId = saleItem.SaleId,
            ProductId = saleItem.ProductId,
            Barcode = saleItem.Barcode,
            ProductName = saleItem.ProductName,
            Quantity = saleItem.Quantity,
            PriceAtSale = saleItem.PriceAtSale
        };
    }
}