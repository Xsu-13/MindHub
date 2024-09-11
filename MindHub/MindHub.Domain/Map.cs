using MindHub.Common.Enums;
using MindHub.Domain.Interfaces;

namespace MindHub.DAL
{
    public class Map : IEntityBase
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Title { get; set; }
        public User User { get; set; }
        public ICollection<Node> Nodes { get; set; }
        public RecordStatus RecordStatus { get; set; }
        public DateTime RecordCreateDate { get; set; } = DateTime.UtcNow;
        public DateTime? RecordUpdateDate { get; set; }
    }
}
