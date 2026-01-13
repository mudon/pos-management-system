using PosSystem.Domain.Entities;

namespace PosSystem.Application.Interfaces;

public interface ISaleItemRepository
{
    Task<SaleItem?> GetByIdAsync(int id);
    Task<IEnumerable<SaleItem>> GetBySaleIdAsync(int saleId);
    Task<IEnumerable<SaleItem>> GetByProductIdAsync(int productId);
    Task<SaleItem> AddAsync(SaleItem saleItem);
    Task AddRangeAsync(IEnumerable<SaleItem> saleItems);
    Task UpdateAsync(SaleItem saleItem);
    Task DeleteAsync(SaleItem saleItem);
    Task DeleteRangeAsync(IEnumerable<SaleItem> saleItems);
    Task<decimal> GetSaleTotalAsync(int saleId);
    Task<int> GetItemCountBySaleIdAsync(int saleId);
}