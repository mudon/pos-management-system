using Microsoft.EntityFrameworkCore;
using PosSystem.Application.Interfaces;
using PosSystem.Domain.Entities;
using PosSystem.Infrastructure.Data;

namespace PosSystem.Infrastructure.Repositories;

public class InventoryRepository : IInventoryRepository
{
    private readonly AppDbContext _context;

    public InventoryRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Inventory?> GetByProductIdAsync(int productId)
    {
        return await _context.Inventory.FindAsync(productId);
    }

    public async Task<Inventory?> GetByProductIdWithDetailsAsync(int productId)
    {
        return await _context.Inventory
            .Include(i => i.Product)
            .ThenInclude(p => p.Category)
            .Include(i => i.Product)
            .ThenInclude(p => p.Supplier)
            .FirstOrDefaultAsync(i => i.ProductId == productId);
    }

    public async Task<IEnumerable<Inventory>> GetAllWithProductsAsync()
    {
        return await _context.Inventory
            .Include(i => i.Product)
            .ThenInclude(p => p.Category)
            .Include(i => i.Product)
            .ThenInclude(p => p.Supplier)
            .OrderBy(i => i.Product.Name)
            .ToListAsync();
    }

    public async Task<Inventory> AddAsync(Inventory inventory)
    {
        await _context.Inventory.AddAsync(inventory);
        await _context.SaveChangesAsync();
        return inventory;
    }

    public async Task UpdateAsync(Inventory inventory)
    {
        _context.Inventory.Update(inventory);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Inventory inventory)
    {
        _context.Inventory.Remove(inventory);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> UpdateStockAsync(int productId, int quantityChange)
    {
        var inventory = await GetByProductIdAsync(productId);
        if (inventory == null)
            return false;

        // Prevent negative stock
        if (inventory.Quantity + quantityChange < 0)
            return false;

        inventory.Quantity += quantityChange;
        inventory.UpdatedAt = DateTime.UtcNow;

        await UpdateAsync(inventory);
        return true;
    }

    public async Task<int> GetStockQuantityAsync(int productId)
    {
        var inventory = await GetByProductIdAsync(productId);
        return inventory?.Quantity ?? 0;
    }
}