using Microsoft.EntityFrameworkCore;
using PosSystem.Application.Interfaces;
using PosSystem.Domain.Entities;
using PosSystem.Infrastructure.Data;

namespace PosSystem.Infrastructure.Repositories;

public class PaymentRepository : IPaymentRepository
{
    private readonly AppDbContext _context;

    public PaymentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Payment?> GetByIdAsync(Guid id)
    {
        return await _context.Payments
            .Include(p => p.Sale)
            .ThenInclude(s => s.User)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Payment?> GetBySaleIdAsync(int saleId)
    {
        return await _context.Payments
            .Include(p => p.Sale)
            .ThenInclude(s => s.User)
            .FirstOrDefaultAsync(p => p.SaleId == saleId);
    }

    public async Task<IEnumerable<Payment>> GetAllAsync()
    {
        return await _context.Payments.ToListAsync();
    }

    public async Task<IEnumerable<Payment>> GetAllWithDetailsAsync()
    {
        return await _context.Payments
            .Include(p => p.Sale)
            .ThenInclude(s => s.User)
            .OrderByDescending(p => p.PaidAt)
            .ToListAsync();
    }

    public async Task<Payment> AddAsync(Payment payment)
    {
        await _context.Payments.AddAsync(payment);
        await _context.SaveChangesAsync();
        return payment;
    }

    public async Task UpdateAsync(Payment payment)
    {
        _context.Payments.Update(payment);
        await _context.SaveChangesAsync();
    }

    // NO DeleteAsync method - Payments cannot be deleted!

    public async Task<bool> SaleHasPaymentAsync(int saleId)
    {
        return await _context.Payments.AnyAsync(p => p.SaleId == saleId);
    }

    public async Task<IEnumerable<Payment>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        return await _context.Payments
            .Include(p => p.Sale)
            .ThenInclude(s => s.User)
            .Where(p => p.PaidAt >= startDate && p.PaidAt <= endDate)
            .OrderByDescending(p => p.PaidAt)
            .ToListAsync();
    }

    public async Task<decimal> GetTotalAmountAsync(DateTime? startDate = null, DateTime? endDate = null)
    {
        var query = _context.Payments.AsQueryable();

        if (startDate.HasValue)
            query = query.Where(p => p.PaidAt >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(p => p.PaidAt <= endDate.Value);

        return await query.SumAsync(p => p.Amount);
    }
}