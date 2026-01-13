using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PosSystem.Application.DTOs.Sales;
using PosSystem.Application.Interfaces;
using PosSystem.API.Controllers;

namespace PosSystem.API.Controllers;

[Authorize]
[ApiController]
[Route("api/sales/{saleId}/[controller]")]
public class SaleItemsController : ControllerBase
{
    private readonly ISaleItemService _saleItemService;

    public SaleItemsController(ISaleItemService saleItemService)
    {
        _saleItemService = saleItemService;
    }

    [HttpGet]
    public async Task<IActionResult> GetBySaleId(int saleId)
    {
        try
        {
            var items = await _saleItemService.GetItemsBySaleIdAsync(saleId);
            return Ok(items);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"An error occurred while fetching items for sale {saleId}.", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int saleId, int id)
    {
        try
        {
            var item = await _saleItemService.GetSaleItemByIdAsync(id);
            
            if (item == null || item.SaleId != saleId)
                return NotFound(new { message = $"Sale item with ID {id} not found in sale {saleId}." });

            return Ok(item);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"An error occurred while fetching sale item {id}.", error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> AddItem(int saleId, [FromBody] CreateSaleItemDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var item = await _saleItemService.AddItemToSaleAsync(saleId, dto);
            
            return CreatedAtAction(nameof(GetById), new { saleId, id = item.Id }, item);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"An error occurred while adding item to sale {saleId}.", error = ex.Message });
        }
    }

    [HttpPost("multiple")]
    public async Task<IActionResult> AddMultipleItems(int saleId, [FromBody] AddItemsToSaleDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var items = await _saleItemService.AddMultipleItemsToSaleAsync(saleId, dto);
            
            return Ok(new { 
                message = $"{items.Count()} items added to sale {saleId}.",
                items 
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"An error occurred while adding items to sale {saleId}.", error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateItem(int saleId, int id, [FromBody] UpdateSaleItemDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var item = await _saleItemService.UpdateSaleItemAsync(id, dto);
            
            if (item == null || item.SaleId != saleId)
                return NotFound(new { message = $"Sale item with ID {id} not found in sale {saleId}." });

            return Ok(item);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"An error occurred while updating sale item {id}.", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> RemoveItem(int saleId, int id)
    {
        try
        {
            var result = await _saleItemService.RemoveItemFromSaleAsync(id);
            
            if (!result)
                return NotFound(new { message = $"Sale item with ID {id} not found in sale {saleId}." });

            return Ok(new { message = $"Item {id} removed from sale {saleId}." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"An error occurred while removing item {id} from sale {saleId}.", error = ex.Message });
        }
    }

    [HttpDelete]
    public async Task<IActionResult> RemoveAllItems(int saleId)
    {
        try
        {
            var result = await _saleItemService.RemoveAllItemsFromSaleAsync(saleId);
            
            if (!result)
                return NotFound(new { message = $"No items found in sale {saleId}." });

            return Ok(new { message = $"All items removed from sale {saleId}." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"An error occurred while removing items from sale {saleId}.", error = ex.Message });
        }
    }

    [HttpGet("total")]
    public async Task<IActionResult> CalculateTotal(int saleId)
    {
        try
        {
            var total = await _saleItemService.CalculateSaleTotalAsync(saleId);
            return Ok(new { saleId, total });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"An error occurred while calculating total for sale {saleId}.", error = ex.Message });
        }
    }

    [HttpGet("sale-with-items")]
    public async Task<IActionResult> GetSaleWithItems(int saleId)
    {
        try
        {
            var saleWithItems = await _saleItemService.GetSaleWithItemsAsync(saleId);
            return Ok(saleWithItems);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"An error occurred while fetching sale {saleId} with items.", error = ex.Message });
        }
    }
}