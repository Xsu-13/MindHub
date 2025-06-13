using MindHub.Common.Enums;
using MindHub.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MindHub.Domain
{
    public class NodeVersion : IEntityBase
    {
        public int Id { get; set; }
        public string MapId { get; set; }
        public string NodeId { get; set; }
        public string Data { get; set; }
        public string ChangedBy { get; set; }
        public DateTime ChangedAt { get; set; }
        public string Action { get; set; }
        public RecordStatus RecordStatus { get; set; }
        public DateTime RecordCreateDate { get; set; }
        public DateTime? RecordUpdateDate { get; set; }
    }
}
