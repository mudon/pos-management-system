using System.ComponentModel.DataAnnotations;

namespace PosSystem.Application.DTOs.Auth;

public class RegisterRequestDto
{
    [Required]
    [MinLength(3)]
    public string Username { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;
    
    [Required]
    [Compare("Password")]
    public string ConfirmPassword { get; set; } = string.Empty;
    
    [Required]
    public string Role { get; set; } = "Cashier";
}