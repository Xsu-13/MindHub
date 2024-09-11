using AutoMapper;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using MindHub.DAL;
using MindHub.DAL.Repositories;
using MindHub.Services.BaseServices;
using MindHub.Services.Nodes;
using MindHub.Services.Styles;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MindHub.Services.Users
{
    public class UserService : ServiceBase<User, UserDto>, IUserService
    {
        public UserService(
            IRepository<User> repository,
            IMapper mapper
            ) : base(repository, mapper)
        {
        }

        public async Task<bool> SingUp(string email, string password)
        {
            return true;
        }

        public async Task<bool> Login(string email, string password)
        {
            return true;
        }
    }
}
