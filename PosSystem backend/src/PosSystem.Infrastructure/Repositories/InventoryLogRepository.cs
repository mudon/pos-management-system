using Microsoft.EntityFrameworkCore;
using PosSystem.Application.Interfaces;
using PosSystem.Domain.Entities;
using PosSystem.Infrastructure.Data;

namespace PosSystem.Infrastructure.Repositories;

public class InventoryLogRepository : IInventoryLogRepository
{
    private readonly AppDbContext _context;

    public InventoryLogRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<InventoryLog> AddAsync(InventoryLog log)
    {
        await _context.InventoryLogs.AddAsync(log);
        await _context.SaveChangesAsync();
        return log;
    }

    public async Task<IEnumerable<InventoryLog>> GetByProductIdAsync(int productId)
    {
        return await _context.InventoryLogs
            .Include(l => l.Product)
            .Where(l => l.ProductId == productId)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<InventoryLog>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        return await _context.InventoryLogs
            .Include(l => l.Product)
            .Where(l => l.CreatedAt >= startDate && l.CreatedAt <= endDate)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();
    }
}