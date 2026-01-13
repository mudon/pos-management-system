using PosSystem.Domain.Entities;

namespace PosSystem.Application.Interfaces;

public interface IPaymentRepository
{
    Task<Payment?> GetByIdAsync(Guid id);
    Task<Payment?> GetBySaleIdAsync(int saleId);
    Task<IEnumerable<Payment>> GetAllAsync();
    Task<IEnumerable<Payment>> GetAllWithDetailsAsync();
    Task<Payment> AddAsync(Payment payment);
    Task UpdateAsync(Payment payment);
    // NO DELETE METHOD - Payments cannot be deleted
    Task<bool> SaleHasPaymentAsync(int saleId);
    Task<IEnumerable<Payment>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
    Task<decimal> GetTotalAmountAsync(DateTime? startDate = null, DateTime? endDate = null);
}