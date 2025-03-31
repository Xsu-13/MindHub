using MindHub.Common.Enums;
using MindHub.DAL;
using MindHub.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MindHub.Domain
{
    public class Invite : IEntityBase
    {
        public int Id { get; set; }
        public RecordStatus RecordStatus { get; set; }
        public DateTime RecordCreateDate { get; set; } = DateTime.UtcNow;
        public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddDays(7);
        public DateTime? RecordUpdateDate { get; set; }
        public int MapId { get; set; }
        public int InviterId { get; set; }
        public string Token { get; set; }
        public Map Map { get; set; }
        public User User { get; set; }
    }
}
