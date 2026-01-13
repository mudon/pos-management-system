using PosSystem.Application.DTOs.Payments;

namespace PosSystem.Application.DTOs.Sales;

public class SaleDto
{
    public int Id { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int ItemCount { get; set; }
}

public class CreateSaleDto
{
    public Guid UserId { get; set; }
    public decimal TotalAmount { get; set; }
    public string PaymentMethod { get; set; } = "Cash";
}

public class UpdateSaleDto
{
    public decimal? TotalAmount { get; set; }
    public string? PaymentMethod { get; set; }
}

public class SaleSearchDto
{
    public Guid? UserId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? PaymentMethod { get; set; }
    public decimal? MinAmount { get; set; }
    public decimal? MaxAmount { get; set; }
}

public class DailySalesSummaryDto
{
    public DateTime Date { get; set; }
    public int SaleCount { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal AverageSale { get; set; }
}

public class CreateSaleWithPaymentDto
{
    public Guid UserId { get; set; }
    public string PaymentMethod { get; set; } = "Cash";
    public decimal PaymentAmount { get; set; }
    public string? TransactionId { get; set; }
    public string? Notes { get; set; }
    public List<CreateSaleItemDto> Items { get; set; } = new();
}

// Add this DTO
public class CreateSaleWithItemsDto
{
    public Guid UserId { get; set; }
    public string PaymentMethod { get; set; } = "Cash";
    public List<CreateSaleItemDto> Items { get; set; } = new();
}

public class SaleWithPaymentDto
{
    public int SaleId { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public PaymentDto Payment { get; set; } = null!;
    public List<SaleItemDto> Items { get; set; } = new();
}