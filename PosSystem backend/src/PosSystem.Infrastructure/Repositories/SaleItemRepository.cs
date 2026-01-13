using Microsoft.EntityFrameworkCore;
using PosSystem.Application.Interfaces;
using PosSystem.Domain.Entities;
using PosSystem.Infrastructure.Data;

namespace PosSystem.Infrastructure.Repositories;

public class SaleItemRepository : ISaleItemRepository
{
    private readonly AppDbContext _context;

    public SaleItemRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<SaleItem?> GetByIdAsync(int id)
    {
        return await _context.SaleItems
            .Include(si => si.Product)
            .Include(si => si.Sale)
            .FirstOrDefaultAsync(si => si.Id == id);
    }

    public async Task<IEnumerable<SaleItem>> GetBySaleIdAsync(int saleId)
    {
        return await _context.SaleItems
            .Include(si => si.Product)
            .Where(si => si.SaleId == saleId)
            .OrderBy(si => si.Id)
            .ToListAsync();
    }

    public async Task<IEnumerable<SaleItem>> GetByProductIdAsync(int productId)
    {
        return await _context.SaleItems
            .Include(si => si.Sale)
            .Where(si => si.ProductId == productId)
            .OrderByDescending(si => si.Sale.CreatedAt)
            .ToListAsync();
    }

    public async Task<SaleItem> AddAsync(SaleItem saleItem)
    {
        await _context.SaleItems.AddAsync(saleItem);
        await _context.SaveChangesAsync();
        return saleItem;
    }

    public async Task AddRangeAsync(IEnumerable<SaleItem> saleItems)
    {
        await _context.SaleItems.AddRangeAsync(saleItems);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(SaleItem saleItem)
    {
        _context.SaleItems.Update(saleItem);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(SaleItem saleItem)
    {
        _context.SaleItems.Remove(saleItem);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteRangeAsync(IEnumerable<SaleItem> saleItems)
    {
        _context.SaleItems.RemoveRange(saleItems);
        await _context.SaveChangesAsync();
    }

    public async Task<decimal> GetSaleTotalAsync(int saleId)
    {
        return await _context.SaleItems
            .Where(si => si.SaleId == saleId)
            .SumAsync(si => si.Quantity * si.PriceAtSale);
    }

    public async Task<int> GetItemCountBySaleIdAsync(int saleId)
    {
        return await _context.SaleItems
            .Where(si => si.SaleId == saleId)
            .CountAsync();
    }
}