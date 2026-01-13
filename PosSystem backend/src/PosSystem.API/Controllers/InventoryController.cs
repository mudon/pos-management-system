using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PosSystem.Application.DTOs.Inventory;
using PosSystem.Application.Interfaces;

namespace PosSystem.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class InventoryController : ControllerBase
{
    private readonly IInventoryService _inventoryService;

    public InventoryController(IInventoryService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var inventory = await _inventoryService.GetAllInventoryAsync();
            return Ok(inventory);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching inventory.", error = ex.Message });
        }
    }

    [HttpGet("product/{productId}")]
    public async Task<IActionResult> GetByProductId(int productId)
    {
        try
        {
            var inventory = await _inventoryService.GetInventoryByProductIdAsync(productId);
            
            if (inventory == null)
                return NotFound(new { message = $"Inventory for product ID {productId} not found." });

            return Ok(inventory);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"An error occurred while fetching inventory for product {productId}.", error = ex.Message });
        }
    }

    [HttpGet("barcode/{barcode}")]
    public async Task<IActionResult> GetByBarcode(string barcode)
    {
        try
        {
            var inventory = await _inventoryService.GetInventoryByBarcodeAsync(barcode);
            
            if (inventory == null)
                return NotFound(new { message = $"Inventory for barcode '{barcode}' not found." });

            return Ok(inventory);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"An error occurred while fetching inventory for barcode '{barcode}'.", error = ex.Message });
        }
    }

    [HttpGet("low-stock")]
    public async Task<IActionResult> GetLowStockItems()
    {
        try
        {
            var lowStockItems = await _inventoryService.GetLowStockItemsAsync();
            return Ok(lowStockItems);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching low stock items.", error = ex.Message });
        }
    }

    [HttpPost("search")]
    public async Task<IActionResult> Search([FromBody] InventorySearchDto search)
    {
        try
        {
            var inventory = await _inventoryService.SearchInventoryAsync(
                search.ProductName, 
                search.Barcode, 
                search.LowStockOnly
            );
            return Ok(inventory);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while searching inventory.", error = ex.Message });
        }
    }

    [HttpPut("product/{productId}/stock")]
    public async Task<IActionResult> UpdateStock(int productId, [FromBody] UpdateStockDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _inventoryService.UpdateStockAsync(productId, dto);
            
            if (!result)
                return NotFound(new { message = $"Inventory for product ID {productId} not found." });

            return Ok(new { message = $"Stock updated successfully for product {productId}." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"An error occurred while updating stock for product {productId}.", error = ex.Message });
        }
    }

    [HttpPatch("product/{productId}/adjust")]
    public async Task<IActionResult> AdjustStock(int productId, [FromBody] AdjustStockDto dto)
    {
        try
        {
            Console.WriteLine($"=============================222222222222222222222222222222222222222222222222====================================Adjusting stock for product {productId} by {dto.Change}");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            Console.WriteLine($"====q1111111111111111111111111111111111111111111111111111111======================================================Adjusting stock for product {productId} by {dto.Change}");
            

            var result = await _inventoryService.AdjustStockAsync(productId, dto);
            
            if (!result)
                return NotFound(new { message = $"Inventory for product ID {productId} not found." });

            return Ok(new { message = $"Stock adjusted successfully for product {productId}." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"An error occurred while adjusting stock for product {productId}.", error = ex.Message });
        }
    }

    [HttpGet("product/{productId}/check-stock/{requiredQuantity}")]
    public async Task<IActionResult> CheckStockAvailable(int productId, int requiredQuantity)
    {
        try
        {
            var available = await _inventoryService.CheckStockAvailableAsync(productId, requiredQuantity);
            return Ok(new { 
                productId, 
                requiredQuantity, 
                available,
                message = available ? "Stock is available" : "Insufficient stock"
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"An error occurred while checking stock for product {productId}.", error = ex.Message });
        }
    }
}

public class InventorySearchDto
{
    public string? ProductName { get; set; }
    public string? Barcode { get; set; }
    public bool? LowStockOnly { get; set; }
}