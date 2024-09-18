using MindHub.Services.BaseServices;

namespace MindHub.Services.Users
{
    public interface IUserService : IService<UserDto>
    {
        Task SingUp(string username, string email, string password);
        Task<string> Login(string email, string password);
    }
}
