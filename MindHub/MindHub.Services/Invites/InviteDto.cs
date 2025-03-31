using MindHub.Common.Enums;
using MindHub.DAL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MindHub.Services.Invites
{
    public class InviteDto
    {
        public int Id { get; set; }
        public DateTime ExpiresAt { get; set; }
        public int MapId { get; set; }
        public int InviterId { get; set; }
        public string Token { get; set; }
        public Map Map { get; set; }
        public User User { get; set; }
    }
}
