using MindHub.Common.Enums;
using MindHub.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MindHub.DAL
{
    public class Node : IEntityBase
    {
        public int Id { get; set; }
        public int MapId { get; set; }
        public int? ParentNodeId { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public float X { get; set; }
        public float Y { get; set; }
        public float Width { get; set; } = 180;
        public float Height { get; set; } = 70;
        public bool IsCodeBlockOpen { get; set; } = false;
        public bool IsCollapsed { get; set; } = false;
        public int? StyleId { get; set; }
        public Map Map { get; set; }
        public Node ParentNode { get; set; }
        public Style Style { get; set; }
        public RecordStatus RecordStatus { get; set; }
        public DateTime RecordCreateDate { get; set; } = DateTime.UtcNow;
        public DateTime? RecordUpdateDate { get; set; }
    }
}
