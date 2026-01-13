using PosSystem.Domain.Entities;

namespace PosSystem.Application.Interfaces;

public interface ISaleRepository
{
    Task<Sale?> GetByIdAsync(int id);
    Task<Sale?> GetByIdWithDetailsAsync(int id);
    Task<IEnumerable<Sale>> GetAllAsync();
    Task<IEnumerable<Sale>> GetAllWithDetailsAsync();
    Task<Sale> AddAsync(Sale sale);
    Task UpdateAsync(Sale sale);
    Task DeleteAsync(Sale sale);
    Task<IEnumerable<Sale>> GetByUserIdAsync(Guid userId);
    Task<IEnumerable<Sale>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
    Task<IEnumerable<Sale>> SearchAsync(Guid? userId, DateTime? startDate, DateTime? endDate, string? paymentMethod, decimal? minAmount, decimal? maxAmount);
    Task<decimal> GetTotalSalesAmountAsync(DateTime? startDate = null, DateTime? endDate = null);
    Task<int> GetTotalSalesCountAsync(DateTime? startDate = null, DateTime? endDate = null);
}