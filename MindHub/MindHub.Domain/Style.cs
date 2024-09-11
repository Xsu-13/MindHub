using MindHub.Common.Enums;
using MindHub.Domain.Interfaces;

namespace MindHub.DAL
{
    public class Style : IEntityBase
    {
        public int Id { get; set; }
        public string BackgroundColor { get; set; } = "#FFFFFF";
        public string TextColor { get; set; } = "#000000";
        public string BorderColor { get; set; } = "#000000";
        public int FontSize { get; set; } = 14;
        public string FontFamily { get; set; } = "Arial";
        public ICollection<Node> Nodes { get; set; }
        public RecordStatus RecordStatus { get; set; }
        public DateTime RecordCreateDate { get; set; } = DateTime.UtcNow;
        public DateTime? RecordUpdateDate { get; set; }
    }
}
