using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using System;
using PosSystem.Application.Interfaces;

namespace PosSystem.Application.Services
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        private ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;

        public bool IsAuthenticated => User?.Identity?.IsAuthenticated ?? false;

        public Guid UserId
        {
            get
            {
                var id = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(id))
                    throw new UnauthorizedAccessException("UserId claim is missing or user is not authenticated.");
                
                return Guid.Parse(id);
            }
        }

        public string Username
        {
            get
            {
                var username = User?.FindFirst(ClaimTypes.Name)?.Value;
                if (string.IsNullOrEmpty(username))
                    throw new UnauthorizedAccessException("Username claim is missing or user is not authenticated.");
                
                return username;
            }
        }

        public string Role
        {
            get
            {
                var role = User?.FindFirst(ClaimTypes.Role)?.Value;
                if (string.IsNullOrEmpty(role))
                    throw new UnauthorizedAccessException("Role claim is missing or user is not authenticated.");
                
                return role;
            }
        }
    }
}
