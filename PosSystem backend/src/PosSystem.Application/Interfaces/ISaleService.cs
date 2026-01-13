using PosSystem.Application.DTOs.Sales;

namespace PosSystem.Application.Interfaces;

public interface ISaleService
{
    Task<IEnumerable<SaleDto>> GetAllSalesAsync();
    Task<SaleDto?> GetSaleByIdAsync(int id);
    Task<SaleDto> CreateSaleAsync(CreateSaleDto dto);
    Task<bool> DeleteSaleAsync(int id);
    Task<IEnumerable<SaleDto>> SearchSalesAsync(SaleSearchDto search);
    Task<IEnumerable<SaleDto>> GetSalesByUserIdAsync(Guid userId);
    Task<IEnumerable<SaleDto>> GetSalesByDateRangeAsync(DateTime startDate, DateTime endDate);
    Task<IEnumerable<DailySalesSummaryDto>> GetDailySalesSummaryAsync(int days = 30, string timeZoneId = "Asia/Singapore");
    Task<decimal> GetTotalSalesAmountAsync(DateTime? startDate = null, DateTime? endDate = null);
    Task<int> GetTotalSalesCountAsync(DateTime? startDate = null, DateTime? endDate = null);
    Task<SaleWithItemsDto> CreateSaleWithItemsAsync(CreateSaleWithItemsDto dto);
    Task<SaleWithPaymentDto> CreateSaleWithPaymentAsync(CreateSaleWithPaymentDto dto);
}
