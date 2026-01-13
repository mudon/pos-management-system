using PosSystem.Domain.Entities;

namespace PosSystem.Application.Interfaces;

public interface IInventoryRepository
{
    Task<Inventory?> GetByProductIdAsync(int productId);

    // 🔴 MISSING — add these
    Task<Inventory?> GetByProductIdWithDetailsAsync(int productId);
    Task<IEnumerable<Inventory>> GetAllWithProductsAsync();

    Task<Inventory> AddAsync(Inventory inventory);
    Task UpdateAsync(Inventory inventory);
    Task<bool> UpdateStockAsync(int productId, int quantityChange);
    Task<int> GetStockQuantityAsync(int productId);
}