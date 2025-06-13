using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MindHub.Services.HistoryVersions.NodeVersions
{
    public class NodeVersionDto
    {
        public Guid Id { get; set; }
        public string MapId { get; set; }
        public string NodeId { get; set; }
        public string Data { get; set; }
        public string ChangedBy { get; set; }
        public DateTime ChangedAt { get; set; }
        public string Action { get; set; }
    }
}
