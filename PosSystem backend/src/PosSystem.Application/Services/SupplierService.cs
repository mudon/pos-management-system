using PosSystem.Application.DTOs.Suppliers;
using PosSystem.Application.Interfaces;
using PosSystem.Domain.Entities;

namespace PosSystem.Application.Services;

public class SupplierService : ISupplierService
{
    private readonly ISupplierRepository _supplierRepository;

    public SupplierService(ISupplierRepository supplierRepository)
    {
        _supplierRepository = supplierRepository;
    }

    public async Task<IEnumerable<SupplierDto>> GetAllSuppliersAsync()
    {
        var suppliers = await _supplierRepository.GetAllAsync();
        
        return suppliers.Select(s => new SupplierDto
        {
            Id = s.Id,
            Name = s.Name,
            ContactInfo = s.ContactInfo,
            CreatedAt = s.CreatedAt
        });
    }

    public async Task<SupplierDto?> GetSupplierByIdAsync(Guid id)
    {
        var supplier = await _supplierRepository.GetByIdAsync(id);
        
        if (supplier == null)
            return null;

        return new SupplierDto
        {
            Id = supplier.Id,
            Name = supplier.Name,
            ContactInfo = supplier.ContactInfo,
            CreatedAt = supplier.CreatedAt
        };
    }

    public async Task<SupplierDto> CreateSupplierAsync(CreateSupplierDto dto)
    {
        // Check if supplier already exists
        var existingSupplier = await _supplierRepository.GetByNameAsync(dto.Name);
        if (existingSupplier != null)
            throw new InvalidOperationException($"Supplier with name '{dto.Name}' already exists.");

        var supplier = new Supplier
        {
            Name = dto.Name,
            ContactInfo = dto.ContactInfo,
            CreatedAt = DateTime.UtcNow
        };

        var createdSupplier = await _supplierRepository.AddAsync(supplier);
        
        return new SupplierDto
        {
            Id = createdSupplier.Id,
            Name = createdSupplier.Name,
            ContactInfo = createdSupplier.ContactInfo,
            CreatedAt = createdSupplier.CreatedAt
        };
    }

    public async Task<SupplierDto?> UpdateSupplierAsync(Guid id, UpdateSupplierDto dto)
    {
        var supplier = await _supplierRepository.GetByIdAsync(id);
        if (supplier == null)
            return null;

        // Check if new name already exists (excluding current supplier)
        var existingSupplier = await _supplierRepository.GetByNameAsync(dto.Name);
        if (existingSupplier != null && existingSupplier.Id != id)
            throw new InvalidOperationException($"Supplier with name '{dto.Name}' already exists.");

        supplier.Name = dto.Name;
        supplier.ContactInfo = dto.ContactInfo;
        supplier.UpdatedAt = DateTime.UtcNow;
        
        await _supplierRepository.UpdateAsync(supplier);
        
        return new SupplierDto
        {
            Id = supplier.Id,
            Name = supplier.Name,
            ContactInfo = supplier.ContactInfo,
            CreatedAt = supplier.CreatedAt
        };
    }

    public async Task<bool> DeleteSupplierAsync(Guid id)
    {
        var supplier = await _supplierRepository.GetByIdAsync(id);
        if (supplier == null)
            return false;

        await _supplierRepository.DeleteAsync(supplier);
        return true;
    }

    public async Task<bool> SupplierExistsAsync(string name)
    {
        var supplier = await _supplierRepository.GetByNameAsync(name);
        return supplier != null;
    }

    public async Task<bool> SupplierExistsAsync(Guid id)
    {
        var supplier = await _supplierRepository.GetByIdAsync(id);
        return supplier != null;
    }
}