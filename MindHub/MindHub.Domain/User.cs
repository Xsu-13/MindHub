using MindHub.Common.Enums;
using MindHub.Domain.Interfaces;

namespace MindHub.DAL
{
    public class User : IEntityBase
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string? Token { get; set; }
        public ICollection<Map> Maps { get; set; }
        public RecordStatus RecordStatus { get; set; }
        public DateTime RecordCreateDate { get; set; } = DateTime.UtcNow;
        public DateTime? RecordUpdateDate { get; set; }
    }
}
