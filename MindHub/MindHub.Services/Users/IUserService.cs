using MindHub.Services.BaseServices;

namespace MindHub.Services.Users
{
    public interface IUserService : IService<UserDto>
    {
        Task<UserDto> SingUp(string username, string email, string password);
        Task<UserDto> Login(string email, string password);
    }
}
