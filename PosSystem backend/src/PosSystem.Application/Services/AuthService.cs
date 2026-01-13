using System.Security.Cryptography;
using Microsoft.Extensions.Configuration;
using PosSystem.Application.DTOs.Auth;
using PosSystem.Application.Helpers;
using PosSystem.Application.Interfaces;
using PosSystem.Domain.Entities;
using PosSystem.Domain.Enums;

namespace PosSystem.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly JwtTokenGenerator _jwtTokenGenerator;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;

    public AuthService(
        IUserRepository userRepository,
        IRefreshTokenRepository refreshTokenRepository,
        JwtTokenGenerator jwtTokenGenerator,
        IEmailService emailService,
        IConfiguration configuration)
    {
        _userRepository = userRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _jwtTokenGenerator = jwtTokenGenerator;
        _emailService = emailService;
        _configuration = configuration;
    }

    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null || !user.IsActive)
            throw new UnauthorizedAccessException("Invalid credentials");

        if (!PasswordHasher.VerifyPassword(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid credentials");

        // Generate tokens
        var accessToken = _jwtTokenGenerator.GenerateAccessToken(user);
        var refreshToken = _jwtTokenGenerator.GenerateRefreshToken();
        var refreshTokenExpiry = _jwtTokenGenerator.GetRefreshTokenExpiry();

        // Save refresh token
        var refreshTokenEntity = new RefreshToken
        {
            UserId = user.Id,
            Token = refreshToken,
            ExpiresAt = refreshTokenExpiry
        };

        await _refreshTokenRepository.AddAsync(refreshTokenEntity);

        return new LoginResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            AccessTokenExpiry = DateTime.UtcNow.AddMinutes(Convert.ToDouble(_configuration["Jwt:AccessTokenExpiryMinutes"])),
            User = new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role.ToString(),
                IsActive = user.IsActive
            }
        };
    }

    public async Task<LoginResponseDto> RegisterAsync(RegisterRequestDto request)
    {
        // Check if user exists
        if (await _userRepository.UserExistsAsync(request.Email, request.Username))
            throw new InvalidOperationException("User with this email or username already exists");

        // Validate role
        if (!Enum.TryParse<UserRole>(request.Role, true, out var role))
            throw new ArgumentException("Invalid role");

        // Create user
        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            PasswordHash = PasswordHasher.HashPassword(request.Password),
            Role = role
        };

        await _userRepository.AddAsync(user);

        // Generate tokens for auto-login after registration
        return await LoginAsync(new LoginRequestDto
        {
            Email = request.Email,
            Password = request.Password
        });
    }

    public async Task<LoginResponseDto> RefreshTokenAsync(string refreshToken)
    {
        var tokenEntity = await _refreshTokenRepository.GetByTokenAsync(refreshToken);
        if (tokenEntity == null || tokenEntity.Revoked || tokenEntity.ExpiresAt < DateTime.UtcNow)
            throw new UnauthorizedAccessException("Invalid refresh token");

        var user = await _userRepository.GetByIdAsync(tokenEntity.UserId);
        if (user == null || !user.IsActive)
            throw new UnauthorizedAccessException("User not found or inactive");

        // Revoke old token
        tokenEntity.Revoked = true;
        await _refreshTokenRepository.UpdateAsync(tokenEntity);

        // Generate new tokens
        var newAccessToken = _jwtTokenGenerator.GenerateAccessToken(user);
        var newRefreshToken = _jwtTokenGenerator.GenerateRefreshToken();
        var newRefreshTokenExpiry = _jwtTokenGenerator.GetRefreshTokenExpiry();

        // Save new refresh token
        var newTokenEntity = new RefreshToken
        {
            UserId = user.Id,
            Token = newRefreshToken,
            ExpiresAt = newRefreshTokenExpiry
        };

        await _refreshTokenRepository.AddAsync(newTokenEntity);

        return new LoginResponseDto
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken,
            AccessTokenExpiry = DateTime.UtcNow.AddMinutes(Convert.ToDouble(_configuration["Jwt:AccessTokenExpiryMinutes"])),
            User = new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role.ToString(),
                IsActive = user.IsActive
            }
        };
    }

    public async Task<bool> RevokeTokenAsync(string refreshToken)
    {
        var tokenEntity = await _refreshTokenRepository.GetByTokenAsync(refreshToken);
        if (tokenEntity == null)
            return false;

        tokenEntity.Revoked = true;
        await _refreshTokenRepository.UpdateAsync(tokenEntity);
        return true;
    }

    public async Task<bool> ForgotPasswordAsync(ForgotPasswordRequestDto request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null || !user.IsActive)
            return true; // Return true anyway for security (don't reveal if user exists)

        // Generate reset token
        var resetToken = GenerateResetToken();
        var expiry = DateTime.UtcNow.AddHours(2); // Token valid for 2 hours

        // Store reset token (you might want to create a PasswordResetToken table)
        // For simplicity, we'll just log it. In production, store it in database.
        Console.WriteLine($"Reset token for {user.Email}: {resetToken} (valid until {expiry})");

        // Send email (simulated for now)
        await _emailService.SendPasswordResetEmailAsync(user.Email, resetToken);

        return true;
    }

    public async Task<bool> ResetPasswordAsync(ResetPasswordRequestDto request)
    {
        // In production: Validate token from database
        // For now, we'll simulate token validation
        Console.WriteLine($"Validating reset token: {request.Token} for {request.Email}");

        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null || !user.IsActive)
            throw new UnauthorizedAccessException("Invalid token or user");

        // Update password
        user.PasswordHash = PasswordHasher.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);

        // In production: Mark reset token as used
        return true;
    }

    public async Task<bool> LogoutAsync(string refreshToken)
    {
        return await RevokeTokenAsync(refreshToken);
    }

    private string GenerateResetToken()
    {
        var randomNumber = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber)
            .Replace("/", "")
            .Replace("+", "")
            .Replace("=", "")
            .Substring(0, 32);
    }
}

public interface IEmailService
{
    Task SendPasswordResetEmailAsync(string email, string resetToken);
}

public class EmailService : IEmailService
{
    public async Task SendPasswordResetEmailAsync(string email, string resetToken)
    {
        // Simulate email sending
        Console.WriteLine($"Sending password reset email to {email} with token {resetToken}");
        await Task.CompletedTask;
    }
}