using PosSystem.Application.DTOs.Products;

namespace PosSystem.Application.Interfaces;

public interface IProductService
{
    Task<IEnumerable<ProductDto>> GetAllProductsAsync();
    Task<ProductDto?> GetProductByIdAsync(int id);
    Task<ProductDto?> GetProductByBarcodeAsync(string barcode);
    Task<ProductDto> CreateProductAsync(CreateProductDto dto);
    Task<ProductDto?> UpdateProductAsync(int id, UpdateProductDto dto);
    Task<bool> DeleteProductAsync(int id);
    Task<bool> ProductExistsAsync(string barcode);
    Task<bool> ProductExistsAsync(int id);
    Task<IEnumerable<ProductDto>> SearchProductsAsync(ProductSearchDto search);
    Task<ProductDto?> ScanBarcodeAsync(string barcode);
    Task<bool> ToggleProductStatusAsync(int id, bool isActive);
    Task<bool> UpdateStockAsync(int productId, int quantity);
    Task<bool> CanDeleteProductAsync(int id); // Check if product can be deleted
}