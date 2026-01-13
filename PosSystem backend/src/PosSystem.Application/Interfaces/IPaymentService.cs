using PosSystem.Application.DTOs.Payments;

namespace PosSystem.Application.Interfaces;

public interface IPaymentService
{
    Task<IEnumerable<PaymentDto>> GetAllPaymentsAsync();
    Task<PaymentDto?> GetPaymentByIdAsync(Guid id);
    Task<PaymentDto?> GetPaymentBySaleIdAsync(int saleId);
    Task<PaymentDto> CreatePaymentAsync(CreatePaymentDto dto);
    Task<PaymentDto?> UpdatePaymentAsync(Guid id, UpdatePaymentDto dto);
    // NO DELETE METHOD - Payments cannot be deleted
    Task<bool> SaleHasPaymentAsync(int saleId);
    Task<PaymentReceiptDto> GetPaymentReceiptAsync(Guid paymentId);
    Task<IEnumerable<PaymentDto>> GetPaymentsByDateRangeAsync(DateTime startDate, DateTime endDate);
    Task<decimal> GetTotalPaymentsAmountAsync(DateTime? startDate = null, DateTime? endDate = null);
}