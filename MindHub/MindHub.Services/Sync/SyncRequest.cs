using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MindHub.Services.Sync
{
    public class SyncRequest
    {
        public List<SyncAction> Actions { get; set; } = new List<SyncAction>();
        public string ClientId { get; set; }
        public DateTimeOffset Timestamp { get; set; }
    }
}
