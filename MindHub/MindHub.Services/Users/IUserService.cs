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
        Task<bool> SingUp(string email, string password);
        Task<bool> Login(string email, string password);
    }
}
