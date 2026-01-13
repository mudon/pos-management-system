using System;

namespace PosSystem.Domain.Entities;

public class Payment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public int SaleId { get; set; }
    public decimal Amount { get; set; }
    public string Method { get; set; } = string.Empty;
    public DateTime PaidAt { get; set; } = DateTime.UtcNow;
    public string? TransactionId { get; set; }
    public string? Notes { get; set; }
    
    // Navigation property
    public Sale Sale { get; set; } = null!;
}