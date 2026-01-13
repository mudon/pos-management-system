using PosSystem.Application.DTOs.Products;
using PosSystem.Application.Interfaces;
using PosSystem.Domain.Entities;

namespace PosSystem.Application.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _productRepository;
    private readonly IInventoryRepository _inventoryRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly ISupplierRepository _supplierRepository;

    public ProductService(
        IProductRepository productRepository,
        IInventoryRepository inventoryRepository,
        ICategoryRepository categoryRepository,
        ISupplierRepository supplierRepository)
    {
        _productRepository = productRepository;
        _inventoryRepository = inventoryRepository;
        _categoryRepository = categoryRepository;
        _supplierRepository = supplierRepository;
    }

    public async Task<IEnumerable<ProductDto>> GetAllProductsAsync()
    {
        var products = await _productRepository.GetAllWithDetailsAsync();
        
        return await MapToProductDtoList(products);
    }

    public async Task<ProductDto?> GetProductByIdAsync(int id)
    {
        var product = await _productRepository.GetByIdAsync(id);
        if (product == null)
            return null;

        var stock = await _inventoryRepository.GetStockQuantityAsync(id);
        
        return MapToProductDto(product, stock);
    }

    public async Task<ProductDto?> GetProductByBarcodeAsync(string barcode)
    {
        var product = await _productRepository.GetByBarcodeWithDetailsAsync(barcode);
        if (product == null)
            return null;

        var stock = await _inventoryRepository.GetStockQuantityAsync(product.Id);
        
        return MapToProductDto(product, stock);
    }

    public async Task<ProductDto> CreateProductAsync(CreateProductDto dto)
    {
        // Check if barcode already exists
        if (await _productRepository.BarcodeExistsAsync(dto.Barcode))
            throw new InvalidOperationException($"Product with barcode '{dto.Barcode}' already exists.");

        // Validate category exists
        if (dto.CategoryId.HasValue)
        {
            var category = await _categoryRepository.GetByIdAsync(dto.CategoryId.Value);
            if (category == null)
                throw new InvalidOperationException($"Category with ID {dto.CategoryId} not found.");
        }

        // Validate supplier exists
        if (dto.SupplierId.HasValue)
        {
            var supplier = await _supplierRepository.GetByIdAsync(dto.SupplierId.Value);
            if (supplier == null)
                throw new InvalidOperationException($"Supplier with ID {dto.SupplierId} not found.");
        }

        // Create product
        var product = new Product
        {
            Barcode = dto.Barcode,
            Name = dto.Name,
            CategoryId = dto.CategoryId,
            SupplierId = dto.SupplierId,
            Price = dto.Price,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        var createdProduct = await _productRepository.AddAsync(product);

        // Create inventory record
        var inventory = new Inventory
        {
            ProductId = createdProduct.Id,
            Quantity = dto.InitialStock,
            UpdatedAt = DateTime.UtcNow
        };

        await _inventoryRepository.AddAsync(inventory);
        
        return MapToProductDto(createdProduct, dto.InitialStock);
    }

    public async Task<ProductDto?> UpdateProductAsync(int id, UpdateProductDto dto)
    {
        var product = await _productRepository.GetByIdAsync(id);
        if (product == null)
            return null;

        // Validate category exists
        if (dto.CategoryId.HasValue)
        {
            var category = await _categoryRepository.GetByIdAsync(dto.CategoryId.Value);
            if (category == null)
                throw new InvalidOperationException($"Category with ID {dto.CategoryId} not found.");
        }

        // Validate supplier exists
        if (dto.SupplierId.HasValue)
        {
            var supplier = await _supplierRepository.GetByIdAsync(dto.SupplierId.Value);
            if (supplier == null)
                throw new InvalidOperationException($"Supplier with ID {dto.SupplierId} not found.");
        }

        // Update product
        product.Name = dto.Name;
        product.CategoryId = dto.CategoryId;
        product.SupplierId = dto.SupplierId;
        product.Price = dto.Price;
        product.IsActive = dto.IsActive;

        await _productRepository.UpdateAsync(product);

        var stock = await _inventoryRepository.GetStockQuantityAsync(id);
        return MapToProductDto(product, stock);
    }

    public async Task<bool> ProductExistsAsync(string barcode)
    {
        return await _productRepository.BarcodeExistsAsync(barcode);
    }

    public async Task<bool> ProductExistsAsync(int id)
    {
        var product = await _productRepository.GetByIdAsync(id);
        return product != null;
    }

    public async Task<IEnumerable<ProductDto>> SearchProductsAsync(ProductSearchDto search)
    {
        var products = await _productRepository.SearchAsync(
            search.Barcode,
            search.Name,
            search.CategoryId,
            search.IsActive,
            search.InStock
        );

        return await MapToProductDtoList(products);
    }

    public async Task<ProductDto?> ScanBarcodeAsync(string barcode)
    {
        return await GetProductByBarcodeAsync(barcode);
    }

    public async Task<bool> ToggleProductStatusAsync(int id, bool isActive)
    {
        var product = await _productRepository.GetByIdAsync(id);
        if (product == null)
            return false;

        product.IsActive = isActive;
        await _productRepository.UpdateAsync(product);
        return true;
    }

    public async Task<bool> UpdateStockAsync(int productId, int quantity)
    {
        return await _inventoryRepository.UpdateStockAsync(productId, quantity);
    }

    public async Task<bool> DeleteProductAsync(int id)
    {
        var product = await _productRepository.GetByIdAsync(id);
        if (product == null)
            return false;

        // Check if product has inventory > 0
        var inventory = await _inventoryRepository.GetByProductIdAsync(id);
        if (inventory != null && inventory.Quantity > 0)
            throw new InvalidOperationException($"Cannot delete product with ID {id}. Inventory quantity is {inventory.Quantity}. Please clear inventory first.");

        await _productRepository.DeleteAsync(product);
        return true;
    }

    public async Task<bool> CanDeleteProductAsync(int id)
    {
        var inventory = await _inventoryRepository.GetByProductIdAsync(id);
        return inventory == null || inventory.Quantity == 0;
    }

    private async Task<IEnumerable<ProductDto>> MapToProductDtoList(IEnumerable<Product> products)
    {
        var result = new List<ProductDto>();
        
        foreach (var product in products)
        {
            var stock = await _inventoryRepository.GetStockQuantityAsync(product.Id);
            result.Add(MapToProductDto(product, stock));
        }
        
        return result;
    }

    private ProductDto MapToProductDto(Product product, int stockQuantity)
    {
        return new ProductDto
        {
            Id = product.Id,
            Barcode = product.Barcode,
            Name = product.Name,
            CategoryId = product.CategoryId,
            CategoryName = product.Category?.Name,
            SupplierId = product.SupplierId,
            SupplierName = product.Supplier?.Name,
            Price = product.Price,
            IsActive = product.IsActive,
            CreatedAt = product.CreatedAt,
            StockQuantity = stockQuantity
        };
    }
}