using MindHub.Services.BaseServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MindHub.Services.Users
{
    public interface IUserService : IService<UserDto>
    {
        Task SingUp(string username, string email, string password);
        Task<string> Login(string email, string password);
    }
}
