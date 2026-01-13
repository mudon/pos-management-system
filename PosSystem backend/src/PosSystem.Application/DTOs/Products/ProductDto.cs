namespace PosSystem.Application.DTOs.Products;

public class ProductDto
{
    public int Id { get; set; }
    public string Barcode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public Guid? SupplierId { get; set; }
    public string? SupplierName { get; set; }
    public decimal Price { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public int StockQuantity { get; set; }
}

public class CreateProductDto
{
    public string Barcode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int? CategoryId { get; set; }
    public Guid? SupplierId { get; set; }
    public decimal Price { get; set; }
    public int InitialStock { get; set; } = 0;
    public bool IsActive { get; set; } = true;
}

public class UpdateProductDto
{
    public string Name { get; set; } = string.Empty;
    public int? CategoryId { get; set; }
    public Guid? SupplierId { get; set; }
    public decimal Price { get; set; }
    public bool IsActive { get; set; }
}

public class ProductSearchDto
{
    public string? Barcode { get; set; }
    public string? Name { get; set; }
    public int? CategoryId { get; set; }
    public bool? IsActive { get; set; }
    public bool? InStock { get; set; }
}

public class ScanBarcodeDto
{
    public string Barcode { get; set; } = string.Empty;
}