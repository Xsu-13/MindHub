using MindHub.Common.Enums;
using MindHub.DAL;
using MindHub.Services.Maps;
using MindHub.Services.Users;

namespace MindHub.Services.Invites
{
    public class InviteDto
    {
        public int Id { get; set; }
        public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddDays(7);
        public int MapId { get; set; }
        public int InviterId { get; set; }
        public string Token { get; set; }
        public MapDto? Map { get; set; }
        public UserDto? User { get; set; }
    }
}
