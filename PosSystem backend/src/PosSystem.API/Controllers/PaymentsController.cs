using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PosSystem.Application.DTOs.Payments;
using PosSystem.Application.Interfaces;

namespace PosSystem.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var payments = await _paymentService.GetAllPaymentsAsync();
            return Ok(payments);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching payments.", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var payment = await _paymentService.GetPaymentByIdAsync(id);
            
            if (payment == null)
                return NotFound(new { message = $"Payment with ID {id} not found." });

            return Ok(payment);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"An error occurred while fetching payment {id}.", error = ex.Message });
        }
    }

    [HttpGet("sale/{saleId}")]
    public async Task<IActionResult> GetBySaleId(int saleId)
    {
        try
        {
            var payment = await _paymentService.GetPaymentBySaleIdAsync(saleId);
            
            if (payment == null)
                return NotFound(new { message = $"Payment for sale {saleId} not found." });

            return Ok(payment);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"An error occurred while fetching payment for sale {saleId}.", error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePaymentDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var payment = await _paymentService.CreatePaymentAsync(dto);
            
            return CreatedAtAction(nameof(GetById), new { id = payment.Id }, payment);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating payment.", error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePaymentDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var payment = await _paymentService.UpdatePaymentAsync(id, dto);
            
            if (payment == null)
                return NotFound(new { message = $"Payment with ID {id} not found." });

            return Ok(payment);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"An error occurred while updating payment {id}.", error = ex.Message });
        }
    }

    // NO DELETE ENDPOINT - Payments cannot be deleted!

    [HttpGet("sale/{saleId}/exists")]
    public async Task<IActionResult> CheckSaleHasPayment(int saleId)
    {
        try
        {
            var hasPayment = await _paymentService.SaleHasPaymentAsync(saleId);
            return Ok(new { saleId, hasPayment });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"An error occurred while checking payment for sale {saleId}.", error = ex.Message });
        }
    }

    [HttpGet("{id}/receipt")]
    public async Task<IActionResult> GetReceipt(Guid id)
    {
        try
        {
            var receipt = await _paymentService.GetPaymentReceiptAsync(id);
            return Ok(receipt);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"An error occurred while generating receipt for payment {id}.", error = ex.Message });
        }
    }

    [HttpGet("date-range")]
    public async Task<IActionResult> GetByDateRange([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        try
        {
            var payments = await _paymentService.GetPaymentsByDateRangeAsync(startDate, endDate);
            return Ok(payments);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching payments by date range.", error = ex.Message });
        }
    }

    [HttpGet("summary/total-amount")]
    public async Task<IActionResult> GetTotalAmount([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var totalAmount = await _paymentService.GetTotalPaymentsAmountAsync(startDate, endDate);
            return Ok(new { totalAmount });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while calculating total payments amount.", error = ex.Message });
        }
    }
}