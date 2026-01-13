using PosSystem.Domain.Entities;

namespace PosSystem.Application.Interfaces;

public interface ISupplierRepository
{
    Task<Supplier?> GetByIdAsync(Guid id);
    Task<Supplier?> GetByNameAsync(string name);
    Task<IEnumerable<Supplier>> GetAllAsync();
    Task<Supplier> AddAsync(Supplier supplier);
    Task UpdateAsync(Supplier supplier);
    Task DeleteAsync(Supplier supplier);
}