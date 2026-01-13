using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PosSystem.Application.DTOs.Sales;
using PosSystem.Application.Interfaces;

namespace PosSystem.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SalesController : ControllerBase
{
    private readonly ISaleService _saleService;

    public SalesController(ISaleService saleService)
    {
        _saleService = saleService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var sales = await _saleService.GetAllSalesAsync();
            return Ok(sales);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching sales.", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var sale = await _saleService.GetSaleByIdAsync(id);
            
            if (sale == null)
                return NotFound(new { message = $"Sale with ID {id} not found." });

            return Ok(sale);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"An error occurred while fetching sale {id}.", error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSaleDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var sale = await _saleService.CreateSaleAsync(dto);
            
            return CreatedAtAction(nameof(GetById), new { id = sale.Id }, sale);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating sale.", error = ex.Message });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var result = await _saleService.DeleteSaleAsync(id);
            
            if (!result)
                return NotFound(new { message = $"Sale with ID {id} not found." });

            return Ok(new { message = $"Sale {id} deleted successfully." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"An error occurred while deleting sale {id}.", error = ex.Message });
        }
    }

    [HttpPost("search")]
    public async Task<IActionResult> Search([FromBody] SaleSearchDto search)
    {
        try
        {
            var sales = await _saleService.SearchSalesAsync(search);
            return Ok(sales);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while searching sales.", error = ex.Message });
        }
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetByUser(Guid userId)
    {
        try
        {
            var sales = await _saleService.GetSalesByUserIdAsync(userId);
            return Ok(sales);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"An error occurred while fetching sales for user {userId}.", error = ex.Message });
        }
    }

    [HttpGet("date-range")]
    public async Task<IActionResult> GetByDateRange([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        try
        {
            Console.WriteLine($"StartDate1111111: {startDate}, EndDate: {endDate}");
            var sales = await _saleService.GetSalesByDateRangeAsync(startDate, endDate);
            return Ok(sales);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching sales by date range.", error = ex.Message });
        }
    }

    [HttpGet("summary/daily")]
    public async Task<IActionResult> GetDailySummary([FromQuery] int days = 30)
    {
        try
        {
            var summary = await _saleService.GetDailySalesSummaryAsync(days);
            return Ok(summary);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching daily sales summary.", error = ex.Message });
        }
    }

    [HttpGet("summary/total-amount")]
    public async Task<IActionResult> GetTotalAmount([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var totalAmount = await _saleService.GetTotalSalesAmountAsync(startDate, endDate);
            return Ok(new { totalAmount });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while calculating total sales amount.", error = ex.Message });
        }
    }

    [HttpGet("summary/total-count")]
    public async Task<IActionResult> GetTotalCount([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var totalCount = await _saleService.GetTotalSalesCountAsync(startDate, endDate);
            return Ok(new { totalCount });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while calculating total sales count.", error = ex.Message });
        }
    }

    // Add endpoint to SalesController for creating sale with payment
    [HttpPost("with-payment")]
    public async Task<IActionResult> CreateSaleWithPayment([FromBody] CreateSaleWithPaymentDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);


            var saleWithPayment = await _saleService.CreateSaleWithPaymentAsync(dto);
            
            return CreatedAtAction(nameof(GetById), new { id = saleWithPayment.SaleId }, saleWithPayment);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating sale with payment.", error = ex.Message });
        }
    }

    [HttpPost("with-items")]
    public async Task<IActionResult> CreateSaleWithItems([FromBody] CreateSaleWithItemsDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var saleWithItems = await _saleService.CreateSaleWithItemsAsync(dto);
            
            return CreatedAtAction(nameof(GetById), new { id = saleWithItems.Id }, saleWithItems);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating sale with items.", error = ex.Message });
        }
    }
}