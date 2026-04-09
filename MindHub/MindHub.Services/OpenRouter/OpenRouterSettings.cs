using System;

namespace MindHub.Services.OpenRouter
{
    public class OpenRouterSettings
    {
        public string ApiKey { get; set; } = string.Empty;
        public string BaseUrl { get; set; } = "https://openrouter.ai";
        public string DefaultModel { get; set; } = "gpt-4o-mini";
    }
}
