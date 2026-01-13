using PosSystem.Domain.Entities;

namespace PosSystem.Application.Interfaces;

public interface IRefreshTokenRepository
{
    Task<RefreshToken?> GetByTokenAsync(string token);
    Task<RefreshToken> AddAsync(RefreshToken refreshToken);
    Task UpdateAsync(RefreshToken refreshToken);
    Task<IEnumerable<RefreshToken>> GetExpiredTokensAsync();
}