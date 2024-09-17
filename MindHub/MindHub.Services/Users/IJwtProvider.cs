using MindHub.DAL;

namespace MindHub.Services.Users
{
    public interface IJwtProvider
    {
        string GenerateToken(User user);
    }
}