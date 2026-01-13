namespace PosSystem.Application.DTOs.Sales;

public class SaleItemDto
{
    public int Id { get; set; }
    public int SaleId { get; set; }
    public int ProductId { get; set; }
    public string Barcode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal PriceAtSale { get; set; }
    public decimal Subtotal => Quantity * PriceAtSale;
}

public class CreateSaleItemDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal PriceAtSale { get; set; }
}

public class UpdateSaleItemDto
{
    public int Quantity { get; set; }
    public decimal PriceAtSale { get; set; }
}

public class AddItemsToSaleDto
{
    public List<CreateSaleItemDto> Items { get; set; } = new();
}

public class SaleWithItemsDto
{
    public int Id { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public List<SaleItemDto> Items { get; set; } = new();
}