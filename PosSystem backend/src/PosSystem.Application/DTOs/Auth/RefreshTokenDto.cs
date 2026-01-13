using System.ComponentModel.DataAnnotations;

namespace PosSystem.Application.DTOs.Auth;

public class RefreshTokenDto
{
    [Required]
    public string RefreshToken { get; set; } = string.Empty;
}