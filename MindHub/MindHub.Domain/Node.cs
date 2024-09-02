using MindHub.Common.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MindHub.Domain
{
    public class Node
    {
        public int Id { get; set; }
        public RecordStatus RecordStatus { get; set; } = RecordStatus.Active;
        public DateTime RecordCreateDate { get; set; } = DateTime.UtcNow;
        public DateTime? RecordUpdateDate { get; set; }
        public string Title {  get; set; }
    }
}
