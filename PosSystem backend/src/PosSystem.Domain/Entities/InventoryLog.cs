namespace PosSystem.Domain.Entities;

public class InventoryLog
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public int ChangeQty { get; set; } // Positive = added, Negative = removed
    public string Reason { get; set; } = string.Empty; // e.g., "Sale", "Restock", "Adjustment"
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public Product Product { get; set; } = null!;
}