using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PosSystem.Application.DTOs.Suppliers;
using PosSystem.Application.Interfaces;

namespace PosSystem.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SuppliersController : ControllerBase
{
    private readonly ISupplierService _supplierService;

    public SuppliersController(ISupplierService supplierService)
    {
        _supplierService = supplierService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var suppliers = await _supplierService.GetAllSuppliersAsync();
            return Ok(suppliers);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching suppliers.", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var supplier = await _supplierService.GetSupplierByIdAsync(id);
            
            if (supplier == null)
                return NotFound(new { message = $"Supplier with ID {id} not found." });

            return Ok(supplier);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"An error occurred while fetching supplier {id}.", error = ex.Message });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSupplierDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var supplier = await _supplierService.CreateSupplierAsync(dto);
            
            return CreatedAtAction(nameof(GetById), new { id = supplier.Id }, supplier);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating supplier.", error = ex.Message });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSupplierDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var supplier = await _supplierService.UpdateSupplierAsync(id, dto);
            
            if (supplier == null)
                return NotFound(new { message = $"Supplier with ID {id} not found." });

            return Ok(supplier);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"An error occurred while updating supplier {id}.", error = ex.Message });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var result = await _supplierService.DeleteSupplierAsync(id);
            
            if (!result)
                return NotFound(new { message = $"Supplier with ID {id} not found." });

            return Ok(new { message = $"Supplier {id} deleted successfully." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"An error occurred while deleting supplier {id}.", error = ex.Message });
        }
    }

    [HttpGet("exists/{name}")]
    public async Task<IActionResult> CheckExists(string name)
    {
        try
        {
            var exists = await _supplierService.SupplierExistsAsync(name);
            return Ok(new { exists });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while checking supplier existence.", error = ex.Message });
        }
    }
}