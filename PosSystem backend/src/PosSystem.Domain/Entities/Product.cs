using System;

namespace PosSystem.Domain.Entities;
public class Product
{
    public int Id { get; set; }
    public string Barcode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int? CategoryId { get; set; }
    public Guid? SupplierId { get; set; }
    public decimal Price { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public Category? Category { get; set; }
    public Supplier? Supplier { get; set; }
    public Inventory? Inventory { get; set; } // Product has ONE inventory
}