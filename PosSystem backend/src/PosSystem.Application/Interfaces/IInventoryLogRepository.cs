using PosSystem.Domain.Entities;

namespace PosSystem.Application.Interfaces;

public interface IInventoryLogRepository
{
    Task<InventoryLog> AddAsync(InventoryLog log);
    Task<IEnumerable<InventoryLog>> GetByProductIdAsync(int productId);
    Task<IEnumerable<InventoryLog>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
}