using MindHub.Services.Maps;
using MindHub.Services.Styles;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MindHub.Services.Nodes
{
    public class NodeDto
    {
        public int Id { get; set; }
        public int MapId { get; set; }
        public int? ParentNodeId { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public float X { get; set; }
        public float Y { get; set; }
        public int? StyleId { get; set; }
        public StyleDto Style { get; set; }
    }
}
