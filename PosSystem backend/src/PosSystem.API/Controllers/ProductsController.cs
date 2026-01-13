using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PosSystem.Application.DTOs.Products;
using PosSystem.Application.Interfaces;
using PosSystem.Application.Helpers;

namespace PosSystem.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var products = await _productService.GetAllProductsAsync();
            return Ok(products);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching products.", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var product = await _productService.GetProductByIdAsync(id);
            
            if (product == null)
                return NotFound(new { message = $"Product with ID {id} not found." });

            return Ok(product);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"An error occurred while fetching product {id}.", error = ex.Message });
        }
    }

    [HttpGet("barcode/{barcode}")]
    public async Task<IActionResult> GetByBarcode(string barcode)
    {
        try
        {
            var product = await _productService.GetProductByBarcodeAsync(barcode);
            
            if (product == null)
                return NotFound(new { message = $"Product with barcode '{barcode}' not found." });

            return Ok(product);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"An error occurred while fetching product with barcode '{barcode}'.", error = ex.Message });
        }
    }

    [HttpPost("search")]
    public async Task<IActionResult> Search([FromBody] ProductSearchDto search)
    {
        try
        {
            var products = await _productService.SearchProductsAsync(search);
            return Ok(products);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while searching products.", error = ex.Message });
        }
    }

    [HttpPost("scan")]
    public async Task<IActionResult> ScanBarcode([FromBody] ScanBarcodeDto dto)
    {
        try
        {
            var product = await _productService.ScanBarcodeAsync(dto.Barcode);
            
            if (product == null)
                return NotFound(new { message = $"Product with barcode '{dto.Barcode}' not found." });

            return Ok(product);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"An error occurred while scanning barcode '{dto.Barcode}'.", error = ex.Message });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProductDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Validate barcode
            if (!BarcodeHelper.IsValidBarcode(dto.Barcode))
                return BadRequest(new { message = "Invalid barcode format. Barcode must be 8-32 characters." });

            var product = await _productService.CreateProductAsync(dto);
            
            return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating product.", error = ex.Message });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateProductDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var product = await _productService.UpdateProductAsync(id, dto);
            
            if (product == null)
                return NotFound(new { message = $"Product with ID {id} not found." });

            return Ok(product);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"An error occurred while updating product {id}.", error = ex.Message });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var result = await _productService.DeleteProductAsync(id);
            
            if (!result)
                return NotFound(new { message = $"Product with ID {id} not found." });

            return Ok(new { message = $"Product {id} deleted successfully." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"An error occurred while deleting product {id}.", error = ex.Message });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPatch("{id}/toggle-status")]
    public async Task<IActionResult> ToggleStatus(int id, [FromBody] bool isActive)
    {
        try
        {
            var result = await _productService.ToggleProductStatusAsync(id, isActive);
            
            if (!result)
                return NotFound(new { message = $"Product with ID {id} not found." });

            return Ok(new { message = $"Product status updated to {(isActive ? "Active" : "Inactive")}." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"An error occurred while updating product status {id}.", error = ex.Message });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPatch("{id}/stock")]
    public async Task<IActionResult> UpdateStock(int id, [FromBody] int quantity)
    {
        try
        {
            var result = await _productService.UpdateStockAsync(id, quantity);
            
            if (!result)
                return BadRequest(new { message = $"Failed to update stock for product {id}." });

            return Ok(new { message = $"Stock updated successfully for product {id}." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"An error occurred while updating stock for product {id}.", error = ex.Message });
        }
    }

    [HttpGet("exists/barcode/{barcode}")]
    public async Task<IActionResult> CheckBarcodeExists(string barcode)
    {
        try
        {
            var exists = await _productService.ProductExistsAsync(barcode);
            return Ok(new { exists });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while checking barcode existence.", error = ex.Message });
        }
    }
}