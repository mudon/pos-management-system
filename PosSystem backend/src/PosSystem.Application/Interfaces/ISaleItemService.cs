using PosSystem.Application.DTOs.Sales;

namespace PosSystem.Application.Interfaces;

public interface ISaleItemService
{
    Task<IEnumerable<SaleItemDto>> GetItemsBySaleIdAsync(int saleId);
    Task<SaleItemDto?> GetSaleItemByIdAsync(int id);
    Task<SaleItemDto> AddItemToSaleAsync(int saleId, CreateSaleItemDto dto);
    Task<IEnumerable<SaleItemDto>> AddMultipleItemsToSaleAsync(int saleId, AddItemsToSaleDto dto);
    Task<SaleItemDto?> UpdateSaleItemAsync(int id, UpdateSaleItemDto dto);
    Task<bool> RemoveItemFromSaleAsync(int id);
    Task<bool> RemoveAllItemsFromSaleAsync(int saleId);
    Task<decimal> CalculateSaleTotalAsync(int saleId);
    Task<SaleWithItemsDto> GetSaleWithItemsAsync(int saleId);
}