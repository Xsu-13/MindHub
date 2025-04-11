using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MindHub.Services.Sync
{
    public class SyncAction
    {
        public string Type { get; set; }
        public JObject Payload { get; set; }
        public string ActionId { get; set; }
        public DateTimeOffset ClientTimestamp { get; set; } 
    }
}
