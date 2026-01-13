namespace PosSystem.Application.DTOs.Inventory;

public class InventoryDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductBarcode { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public DateTime LastUpdated { get; set; }
}

public class UpdateStockDto
{
    public int Quantity { get; set; }
    public string? Reason { get; set; } // For audit log
}

public class AdjustStockDto
{
    public int Change { get; set; } // Positive = add, Negative = remove
    public string? Reason { get; set; }
}

public class StockLevelDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string Barcode { get; set; } = string.Empty;
    public int CurrentStock { get; set; }
    public int MinimumStock { get; set; } = 10; // You can make this configurable
    public bool IsLowStock => CurrentStock <= MinimumStock;
}