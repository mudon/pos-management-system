using PosSystem.Application.DTOs.Payments;
using PosSystem.Application.Interfaces;
using PosSystem.Domain.Entities;

namespace PosSystem.Application.Services;

public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly ISaleRepository _saleRepository;
    private readonly IUserRepository _userRepository;

    public PaymentService(
        IPaymentRepository paymentRepository,
        ISaleRepository saleRepository,
        IUserRepository userRepository)
    {
        _paymentRepository = paymentRepository;
        _saleRepository = saleRepository;
        _userRepository = userRepository;
    }

    public async Task<IEnumerable<PaymentDto>> GetAllPaymentsAsync()
    {
        var payments = await _paymentRepository.GetAllWithDetailsAsync();
        
        return payments.Select(p => MapToPaymentDto(p));
    }

    public async Task<PaymentDto?> GetPaymentByIdAsync(Guid id)
    {
        var payment = await _paymentRepository.GetByIdAsync(id);
        if (payment == null)
            return null;

        return MapToPaymentDto(payment);
    }

    public async Task<PaymentDto?> GetPaymentBySaleIdAsync(int saleId)
    {
        var payment = await _paymentRepository.GetBySaleIdAsync(saleId);
        if (payment == null)
            return null;

        return MapToPaymentDto(payment);
    }

    public async Task<PaymentDto> CreatePaymentAsync(CreatePaymentDto dto)
    {
        // Validate sale exists
        var sale = await _saleRepository.GetByIdAsync(dto.SaleId);
        if (sale == null)
            throw new InvalidOperationException($"Sale with ID {dto.SaleId} not found.");

        // Check if sale already has a payment
        if (await _paymentRepository.SaleHasPaymentAsync(dto.SaleId))
            throw new InvalidOperationException($"Sale {dto.SaleId} already has a payment. Cannot add another payment.");

        // Validate payment amount matches sale total
        if (dto.Amount != sale.TotalAmount)
            throw new InvalidOperationException($"Payment amount ({dto.Amount}) does not match sale total ({sale.TotalAmount}).");

        // Validate amount
        if (dto.Amount <= 0)
            throw new InvalidOperationException("Payment amount must be greater than 0.");

        // Create payment
        var payment = new Payment
        {
            SaleId = dto.SaleId,
            Amount = dto.Amount,
            Method = dto.Method,
            TransactionId = dto.TransactionId,
            Notes = dto.Notes,
            PaidAt = DateTime.UtcNow
        };

        var createdPayment = await _paymentRepository.AddAsync(payment);
        
        return MapToPaymentDto(createdPayment);
    }

    public async Task<PaymentDto?> UpdatePaymentAsync(Guid id, UpdatePaymentDto dto)
    {
        var payment = await _paymentRepository.GetByIdAsync(id);
        if (payment == null)
            return null;

        // Only allow updating TransactionId and Notes
        // Amount, Method, SaleId, and PaidAt cannot be changed
        
        payment.TransactionId = dto.TransactionId ?? payment.TransactionId;
        payment.Notes = dto.Notes ?? payment.Notes;

        await _paymentRepository.UpdateAsync(payment);
        
        return MapToPaymentDto(payment);
    }

    // NO DeletePaymentAsync method - Payments cannot be deleted!

    public async Task<bool> SaleHasPaymentAsync(int saleId)
    {
        return await _paymentRepository.SaleHasPaymentAsync(saleId);
    }

    public async Task<PaymentReceiptDto> GetPaymentReceiptAsync(Guid paymentId)
    {
        var payment = await _paymentRepository.GetByIdAsync(paymentId);
        if (payment == null)
            throw new InvalidOperationException($"Payment with ID {paymentId} not found.");

        var sale = await _saleRepository.GetByIdWithDetailsAsync(payment.SaleId);
        if (sale == null)
            throw new InvalidOperationException($"Sale with ID {payment.SaleId} not found.");

        var user = await _userRepository.GetByIdAsync(sale.UserId);
        
        // Calculate tax (assuming tax is included in item prices)
        var subtotal = sale.SaleItems.Sum(item => item.Quantity * item.PriceAtSale);
        var tax = sale.TotalAmount - subtotal;
        
        return new PaymentReceiptDto
        {
            PaymentId = payment.Id,
            PaidAt = payment.PaidAt,
            Amount = payment.Amount,
            Method = payment.Method,
            TransactionId = payment.TransactionId,
            SaleId = sale.Id,
            UserName = user?.Username ?? "Unknown",
            Items = sale.SaleItems.Select(item => new ReceiptItemDto
            {
                ProductName = item.ProductName,
                Quantity = item.Quantity,
                UnitPrice = item.PriceAtSale
            }).ToList(),
            Subtotal = subtotal,
            Tax = tax,
            Total = sale.TotalAmount
        };
    }

    public async Task<IEnumerable<PaymentDto>> GetPaymentsByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        var payments = await _paymentRepository.GetByDateRangeAsync(startDate, endDate);
        return payments.Select(p => MapToPaymentDto(p));
    }

    public async Task<decimal> GetTotalPaymentsAmountAsync(DateTime? startDate = null, DateTime? endDate = null)
    {
        return await _paymentRepository.GetTotalAmountAsync(startDate, endDate);
    }

    private PaymentDto MapToPaymentDto(Payment payment)
    {
        return new PaymentDto
        {
            Id = payment.Id,
            SaleId = payment.SaleId,
            Amount = payment.Amount,
            Method = payment.Method,
            PaidAt = payment.PaidAt,
            TransactionId = payment.TransactionId,
            Notes = payment.Notes,
            SaleReference = $"SALE-{payment.SaleId.ToString().PadLeft(6, '0')}"
        };
    }
}