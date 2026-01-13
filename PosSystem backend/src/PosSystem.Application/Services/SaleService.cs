using PosSystem.Application.DTOs.Sales;
using PosSystem.Application.Interfaces;
using PosSystem.Domain.Entities;
using PosSystem.Domain.Enums;
using PosSystem.Application.DTOs.Payments;

namespace PosSystem.Application.Services;

public class SaleService : ISaleService
{
    private readonly ICurrentUserService _currentUser;
    private readonly ISaleRepository _saleRepository;
    private readonly IUserRepository _userRepository;
    private readonly ISaleItemRepository _saleItemRepository;
    private readonly IProductRepository _productRepository;
    private readonly IInventoryRepository _inventoryRepository;
    private readonly IPaymentRepository _paymentRepository;

    public SaleService(
        ICurrentUserService currentUser,
        ISaleRepository saleRepository, 
        IUserRepository userRepository,
        ISaleItemRepository saleItemRepository,
        IProductRepository productRepository,
        IInventoryRepository inventoryRepository,
        IPaymentRepository paymentRepository)
    {
        _saleRepository = saleRepository;
        _userRepository = userRepository;
        _saleItemRepository = saleItemRepository;
        _productRepository = productRepository;
        _inventoryRepository = inventoryRepository;
        _paymentRepository = paymentRepository;
        _currentUser = currentUser;
    }

    public async Task<IEnumerable<SaleDto>> GetAllSalesAsync()
    {
        var sales = await _saleRepository.GetAllWithDetailsAsync();
        
        return sales.Select(s => MapToSaleDto(s));
    }

    public async Task<SaleDto?> GetSaleByIdAsync(int id)
    {
        var sale = await _saleRepository.GetByIdWithDetailsAsync(id);
        if (sale == null)
            return null;

        return MapToSaleDto(sale);
    }

    public async Task<SaleDto> CreateSaleAsync(CreateSaleDto dto)
    {
        var currentUserId = _currentUser.UserId;
        // Validate user exists
        var user = await _userRepository.GetByIdAsync(currentUserId);
        if (user == null || !user.IsActive)
            throw new InvalidOperationException($"User with ID {currentUserId} not found or inactive.");

        // Validate total amount
        if (dto.TotalAmount <= 0)
            throw new InvalidOperationException("Total amount must be greater than 0.");

        // Parse payment method
        if (!Enum.TryParse<PaymentMethod>(dto.PaymentMethod, true, out var paymentMethod))
            throw new InvalidOperationException($"Invalid payment method: {dto.PaymentMethod}");

        var sale = new Sale
        {
            UserId = user.Id,
            TotalAmount = dto.TotalAmount,
            PaymentMethod = paymentMethod,
            CreatedAt = DateTime.UtcNow
        };

        var createdSale = await _saleRepository.AddAsync(sale);
        
        return MapToSaleDto(createdSale);
    }

    public async Task<bool> DeleteSaleAsync(int id)
    {
        var sale = await _saleRepository.GetByIdAsync(id);
        if (sale == null)
            return false;

        await _saleRepository.DeleteAsync(sale);
        return true;
    }

    public async Task<IEnumerable<SaleDto>> SearchSalesAsync(SaleSearchDto search)
    {
        var sales = await _saleRepository.SearchAsync(
            search.UserId,
            search.StartDate,
            search.EndDate,
            search.PaymentMethod,
            search.MinAmount,
            search.MaxAmount
        );

        return sales.Select(s => MapToSaleDto(s));
    }

    public async Task<IEnumerable<SaleDto>> GetSalesByUserIdAsync(Guid userId)
    {
        var currentUserId = _currentUser.UserId;
        var sales = await _saleRepository.GetByUserIdAsync(currentUserId);
        return sales.Select(s => MapToSaleDto(s));
    }

    public async Task<IEnumerable<SaleDto>> GetSalesByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        Console.WriteLine($"Getting sales from {startDate} to {endDate}");
        var sales = await _saleRepository.GetByDateRangeAsync(startDate, endDate);
        return sales.Select(s => MapToSaleDto(s));
    }

    public async Task<IEnumerable<DailySalesSummaryDto>> GetDailySalesSummaryAsync(
    int days = 30,
    string timeZoneId = "Asia/Singapore")
    {
        // 1️⃣ Resolve timezone
        TimeZoneInfo tz;
        try
        {
            tz = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
        }
        catch
        {
            tz = TimeZoneInfo.Utc;
        }

        // 2️⃣ Get "today" in business timezone
        var todayLocal = TimeZoneInfo
            .ConvertTimeFromUtc(DateTime.UtcNow, tz)
            .Date;

        var startLocal = todayLocal.AddDays(-days + 1);
        var endLocal = todayLocal;

        // 3️⃣ Convert local boundaries to UTC for DB query
        var startUtc = TimeZoneInfo.ConvertTimeToUtc(startLocal, tz);
        var endUtc = TimeZoneInfo.ConvertTimeToUtc(endLocal.AddDays(1), tz);

        // 4️⃣ Query DB (UTC)
        var sales = await _saleRepository.GetByDateRangeAsync(startUtc, endUtc);

        var result = new List<DailySalesSummaryDto>();

        // 5️⃣ Aggregate by LOCAL day
        for (var date = startLocal; date <= endLocal; date = date.AddDays(1))
        {
            var dailySales = sales
                .Where(s =>
                    TimeZoneInfo.ConvertTimeFromUtc(s.CreatedAt, tz).Date == date)
                .ToList();

            result.Add(new DailySalesSummaryDto
            {
                Date = date, // ✅ local date
                SaleCount = dailySales.Count,
                TotalAmount = dailySales.Sum(s => s.TotalAmount),
                AverageSale = dailySales.Any()
                    ? dailySales.Average(s => s.TotalAmount)
                    : 0
            });
        }

        return result;
    }

    public async Task<decimal> GetTotalSalesAmountAsync(DateTime? startDate = null, DateTime? endDate = null)
    {
        return await _saleRepository.GetTotalSalesAmountAsync(startDate, endDate);
    }

    public async Task<int> GetTotalSalesCountAsync(DateTime? startDate = null, DateTime? endDate = null)
    {
        return await _saleRepository.GetTotalSalesCountAsync(startDate, endDate);
    }

    public async Task<SaleWithItemsDto> CreateSaleWithItemsAsync(CreateSaleWithItemsDto dto)
    {
        var currentUserId = _currentUser.UserId;
        // Validate user exists
        var user = await _userRepository.GetByIdAsync(currentUserId);
        if (user == null || !user.IsActive)
            throw new InvalidOperationException($"User with ID {currentUserId} not found or inactive.");

        // Parse payment method
        if (!Enum.TryParse<PaymentMethod>(dto.PaymentMethod, true, out var paymentMethod))
            throw new InvalidOperationException($"Invalid payment method: {dto.PaymentMethod}");

        // Create sale first
        var sale = new Sale
        {
            UserId = user.Id,
            TotalAmount = 0, // Will be calculated
            PaymentMethod = paymentMethod,
            CreatedAt = DateTime.UtcNow
        };

        var createdSale = await _saleRepository.AddAsync(sale);

        // Add items using SaleItemService
        var saleItemService = new SaleItemService(
            _saleItemRepository,
            _saleRepository,
            _productRepository,
            _inventoryRepository
        );

        var items = await saleItemService.AddMultipleItemsToSaleAsync(
            createdSale.Id, 
            new AddItemsToSaleDto { Items = dto.Items }
        );

        // Get updated sale with total
        var updatedSale = await _saleRepository.GetByIdWithDetailsAsync(createdSale.Id);
        
        return new SaleWithItemsDto
        {
            Id = updatedSale!.Id,
            UserId = updatedSale.UserId,
            UserName = updatedSale.User?.Username ?? "Unknown",
            TotalAmount = updatedSale.TotalAmount,
            PaymentMethod = updatedSale.PaymentMethod.ToString(),
            CreatedAt = updatedSale.CreatedAt,
            Items = items.ToList()
        };
    }

    public async Task<SaleWithPaymentDto> CreateSaleWithPaymentAsync(CreateSaleWithPaymentDto dto)
    {
        var currentUserId = _currentUser.UserId;

        // Validate user exists
        var user = await _userRepository.GetByIdAsync(currentUserId);
        if (user == null || !user.IsActive)
            throw new InvalidOperationException($"User with ID {currentUserId} not found or inactive.");

        // Parse payment method
        if (!Enum.TryParse<PaymentMethod>(dto.PaymentMethod, true, out var paymentMethod))
            throw new InvalidOperationException($"Invalid payment method: {dto.PaymentMethod}");

        // Calculate total from items
        var totalAmount = dto.Items.Sum(item => item.Quantity * item.PriceAtSale);
        if (totalAmount <= 0)
            throw new InvalidOperationException("Total amount must be greater than 0.");


        // Create sale
        var sale = new Sale
        {
            UserId = user.Id,
            TotalAmount = totalAmount,
            PaymentMethod = paymentMethod,
            CreatedAt = DateTime.UtcNow
        };

        var createdSale = await _saleRepository.AddAsync(sale);

        // Add items to sale
        var saleItemService = new SaleItemService(
            _saleItemRepository,
            _saleRepository,
            _productRepository,
            _inventoryRepository
        );

        await saleItemService.AddMultipleItemsToSaleAsync(
            createdSale.Id, 
            new AddItemsToSaleDto { Items = dto.Items }
        );

        // Create payment
        var paymentService = new PaymentService(
            _paymentRepository,
            _saleRepository,
            _userRepository
        );

        var payment = await paymentService.CreatePaymentAsync(new CreatePaymentDto
        {
            SaleId = createdSale.Id,
            Amount = dto.PaymentAmount,
            Method = dto.PaymentMethod,
            TransactionId = dto.TransactionId,
            Notes = dto.Notes
        });

        // Get updated sale with items
        var updatedSale = await _saleRepository.GetByIdWithDetailsAsync(createdSale.Id);

        return new SaleWithPaymentDto
        {
            SaleId = updatedSale!.Id,
            UserId = updatedSale.UserId,
            UserName = updatedSale.User?.Username ?? "Unknown",
            TotalAmount = updatedSale.TotalAmount,
            PaymentMethod = updatedSale.PaymentMethod.ToString(),
            CreatedAt = updatedSale.CreatedAt,
            Payment = payment,
            Items = updatedSale.SaleItems.Select(item => new SaleItemDto
            {
                Id = item.Id,
                SaleId = item.SaleId,
                ProductId = item.ProductId,
                Barcode = item.Barcode,
                ProductName = item.ProductName,
                Quantity = item.Quantity,
                PriceAtSale = item.PriceAtSale
            }).ToList()
        };
    }
    
    private SaleDto MapToSaleDto(Sale sale)
    {
        return new SaleDto
        {
            Id = sale.Id,
            UserId = sale.UserId,
            UserName = sale.User?.Username ?? "Unknown",
            TotalAmount = sale.TotalAmount,
            PaymentMethod = sale.PaymentMethod.ToString(),
            CreatedAt = sale.CreatedAt,
            ItemCount = sale.SaleItems?.Count ?? 0
        };
    }
}