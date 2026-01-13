namespace PosSystem.Application.DTOs.Payments;

public class PaymentDto
{
    public Guid Id { get; set; }
    public int SaleId { get; set; }
    public decimal Amount { get; set; }
    public string Method { get; set; } = string.Empty;
    public DateTime PaidAt { get; set; }
    public string? TransactionId { get; set; }
    public string? Notes { get; set; }
    public string SaleReference { get; set; } = string.Empty;
}

public class CreatePaymentDto
{
    public int SaleId { get; set; }
    public decimal Amount { get; set; }
    public string Method { get; set; } = "Cash";
    public string? TransactionId { get; set; }
    public string? Notes { get; set; }
}

public class UpdatePaymentDto
{
    public string? TransactionId { get; set; }
    public string? Notes { get; set; }
}

public class PaymentReceiptDto
{
    public Guid PaymentId { get; set; }
    public DateTime PaidAt { get; set; }
    public decimal Amount { get; set; }
    public string Method { get; set; } = string.Empty;
    public string? TransactionId { get; set; }
    public int SaleId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public List<ReceiptItemDto> Items { get; set; } = new();
    public decimal Subtotal { get; set; }
    public decimal Tax { get; set; }
    public decimal Total { get; set; }
    public string ReceiptNumber => $"REC-{SaleId.ToString().PadLeft(6, '0')}-{PaymentId.ToString().Substring(0, 8).ToUpper()}";
}

public class ReceiptItemDto
{
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Total => Quantity * UnitPrice;
}