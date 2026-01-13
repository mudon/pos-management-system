using PosSystem.Application.DTOs.Inventory;

namespace PosSystem.Application.Interfaces;

public interface IInventoryService
{
    Task<IEnumerable<InventoryDto>> GetAllInventoryAsync();
    Task<InventoryDto?> GetInventoryByProductIdAsync(int productId);
    Task<InventoryDto?> GetInventoryByBarcodeAsync(string barcode);
    Task<bool> UpdateStockAsync(int productId, UpdateStockDto dto);
    Task<bool> AdjustStockAsync(int productId, AdjustStockDto dto);
    Task<bool> CheckStockAvailableAsync(int productId, int requiredQuantity);
    Task<IEnumerable<StockLevelDto>> GetLowStockItemsAsync();
    Task<IEnumerable<InventoryDto>> SearchInventoryAsync(string? productName, string? barcode, bool? lowStockOnly);
}