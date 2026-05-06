using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MindHub.Services.LocalLLM
{
    public class LocalLLMSettings
    {

        public string BaseUrl { get; set; } = "http://localhost:11434";

        public string DefaultModel { get; set; } = "phi3:mini";

        public double Temperature { get; set; } = 0.4;

        public int MaxTokens { get; set; } = 2000;
    }
}
