using Microsoft.EntityFrameworkCore;
using PosSystem.Application.Interfaces;
using PosSystem.Domain.Entities;
using PosSystem.Domain.Enums;
using PosSystem.Infrastructure.Data;

namespace PosSystem.Infrastructure.Repositories;

public class SaleRepository : ISaleRepository
{
    private readonly AppDbContext _context;

    public SaleRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Sale?> GetByIdAsync(int id)
    {
        return await _context.Sales.FindAsync(id);
    }

    public async Task<Sale?> GetByIdWithDetailsAsync(int id)
    {
        return await _context.Sales
            .Include(s => s.User)
            .Include(s => s.SaleItems)
            .ThenInclude(si => si.Product)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<IEnumerable<Sale>> GetAllAsync()
    {
        return await _context.Sales.ToListAsync();
    }

    public async Task<IEnumerable<Sale>> GetAllWithDetailsAsync()
    {
        return await _context.Sales
            .Include(s => s.User)
            .Include(s => s.SaleItems)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();
    }

    public async Task<Sale> AddAsync(Sale sale)
    {
        await _context.Sales.AddAsync(sale);
        await _context.SaveChangesAsync();
        return sale;
    }

    public async Task UpdateAsync(Sale sale)
    {
        _context.Sales.Update(sale);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Sale sale)
    {
        _context.Sales.Remove(sale);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<Sale>> GetByUserIdAsync(Guid userId)
    {
        return await _context.Sales
            .Include(s => s.User)
            .Include(s => s.SaleItems)
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Sale>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        return await _context.Sales
            .Include(s => s.User)
            .Include(s => s.SaleItems)
            .Where(s => s.CreatedAt >= startDate && s.CreatedAt <= endDate)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Sale>> SearchAsync(Guid? userId, DateTime? startDate, DateTime? endDate, string? paymentMethod, decimal? minAmount, decimal? maxAmount)
    {
        var query = _context.Sales
            .Include(s => s.User)
            .Include(s => s.SaleItems)
            .AsQueryable();

        if (userId.HasValue)
            query = query.Where(s => s.UserId == userId.Value);

        if (startDate.HasValue)
            query = query.Where(s => s.CreatedAt >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(s => s.CreatedAt <= endDate.Value);

        if (!string.IsNullOrEmpty(paymentMethod))
        {
            if (Enum.TryParse<PaymentMethod>(paymentMethod, true, out var method))
                query = query.Where(s => s.PaymentMethod == method);
        }

        if (minAmount.HasValue)
            query = query.Where(s => s.TotalAmount >= minAmount.Value);

        if (maxAmount.HasValue)
            query = query.Where(s => s.TotalAmount <= maxAmount.Value);

        return await query.OrderByDescending(s => s.CreatedAt).ToListAsync();
    }

    public async Task<decimal> GetTotalSalesAmountAsync(DateTime? startDate = null, DateTime? endDate = null)
    {
        var query = _context.Sales.AsQueryable();

        if (startDate.HasValue)
            query = query.Where(s => s.CreatedAt >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(s => s.CreatedAt <= endDate.Value);

        return await query.SumAsync(s => s.TotalAmount);
    }

    public async Task<int> GetTotalSalesCountAsync(DateTime? startDate = null, DateTime? endDate = null)
    {
        var query = _context.Sales.AsQueryable();

        if (startDate.HasValue)
            query = query.Where(s => s.CreatedAt >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(s => s.CreatedAt <= endDate.Value);

        return await query.CountAsync();
    }
}