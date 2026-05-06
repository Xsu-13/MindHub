using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MindHub.Services.LocalLLM
{
    public class LLMProviderSettings
    {
        public string? ForceProvider { get; set; } = null;

        public bool PreferLocal { get; set; } = true;

        public int LocalHealthCheckTimeoutMs { get; set; } = 2000;
    }
}
