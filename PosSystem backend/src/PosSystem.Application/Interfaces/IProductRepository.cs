using PosSystem.Domain.Entities;

namespace PosSystem.Application.Interfaces;

public interface IProductRepository
{
    Task<Product?> GetByIdAsync(int id);
    Task<Product?> GetByBarcodeAsync(string barcode);
    Task<Product?> GetByBarcodeWithDetailsAsync(string barcode);
    Task<IEnumerable<Product>> GetAllAsync();
    Task<IEnumerable<Product>> GetAllWithDetailsAsync();
    Task<Product> AddAsync(Product product);
    Task UpdateAsync(Product product);
    Task DeleteAsync(Product product);
    Task<IEnumerable<Product>> SearchAsync(string? barcode, string? name, int? categoryId, bool? isActive, bool? inStock);
    Task<bool> BarcodeExistsAsync(string barcode);
}