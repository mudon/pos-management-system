using System.ComponentModel.DataAnnotations;

namespace PosSystem.Application.DTOs.Auth;

public class ForgotPasswordRequestDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}