using MindHub.Services.Maps;

namespace MindHub.Services.Users
{
    public class UserDto
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string Token { get; set; }
        public List<MapDto> Maps { get; set; }
    }
}
