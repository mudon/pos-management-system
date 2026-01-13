using PosSystem.Application.DTOs.Suppliers;

namespace PosSystem.Application.Interfaces;

public interface ISupplierService
{
    Task<IEnumerable<SupplierDto>> GetAllSuppliersAsync();
    Task<SupplierDto?> GetSupplierByIdAsync(Guid id);
    Task<SupplierDto> CreateSupplierAsync(CreateSupplierDto dto);
    Task<SupplierDto?> UpdateSupplierAsync(Guid id, UpdateSupplierDto dto);
    Task<bool> DeleteSupplierAsync(Guid id);
    Task<bool> SupplierExistsAsync(string name);
    Task<bool> SupplierExistsAsync(Guid id);
}