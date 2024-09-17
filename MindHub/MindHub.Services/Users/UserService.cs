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
        private readonly IPasswordHasher _passwordHasher;
        private readonly IJwtProvider _jwtProvider;
        public UserService(
            IRepository<User> repository,
            IPasswordHasher passwordHasher,
            IJwtProvider jwtProvider,
            IMapper mapper
            ) : base(repository, mapper)
        {
            _passwordHasher = passwordHasher;
            _jwtProvider = jwtProvider;
        }

        public async Task SingUp(string username, string email, string password)
        {
            var hashedPassword = _passwordHasher.Generate(password);
            var user = new UserDto()
            { 
                Email = email,
                Username = username,
                PasswordHash = hashedPassword
            };

            await CreateAsync(user);
        }

        public async Task<string> Login(string email, string password)
        {
            var user = _repository.GetQuery()
                .Where(u => u.Email == email)
                .FirstOrDefault();

            if(user == null)
            {
                throw new Exception("Incorrect password or login, check it out");
            }

            var result = _passwordHasher.Verify(password, user.PasswordHash);

            if (user != null && !result)
            {
                throw new Exception("Incorrect password or login, check it out");
            }

            var token = _jwtProvider.GenerateToken(user!);

            return token;
        }
    }
}
