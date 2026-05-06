using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MindHub.Services.LocalLLM;

namespace MindHub.Services.OpenRouter
{
    public interface ILLMProviderFactory
    {
        Task<IOpenRouterService> GetProviderAsync();
    }

    public class LLMProviderFactory : ILLMProviderFactory
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly LLMProviderSettings _settings;
        private readonly ILogger<LLMProviderFactory> _logger;

        public LLMProviderFactory(
            IServiceProvider serviceProvider,
            IOptions<LLMProviderSettings> settings,
            ILogger<LLMProviderFactory> logger)
        {
            _serviceProvider = serviceProvider;
            _settings = settings.Value;
            _logger = logger;
        }

        public async Task<IOpenRouterService> GetProviderAsync()
        {
            // Если принудительно указан провайдер в настройках
            if (_settings.ForceProvider != null)
            {
                _logger.LogInformation("Принудительно используем провайдер: {Provider}", _settings.ForceProvider);
                return GetProviderByName(_settings.ForceProvider);
            }

            // Пытаемся использовать локальную LLM если она доступна
            if (_settings.PreferLocal.HasValue && _settings.PreferLocal.Value)
            {
                var localProvider = GetProviderByName("local");
                if (localProvider is LocalLLMAdapter adapter)
                {
                        return localProvider;
                }
            }

            // По умолчанию OpenRouter
            _logger.LogInformation("Используем OpenRouter");
            return GetProviderByName("openrouter");
        }

        private IOpenRouterService GetProviderByName(string name)
        {
            return name.ToLower() switch
            {
                "local" => _serviceProvider.GetRequiredService<LocalLLMAdapter>(),
                "openrouter" => _serviceProvider.GetRequiredService<OpenRouterService>(),
                _ => throw new ArgumentException($"Неизвестный провайдер: {name}")
            };
        }
    }

    public class LLMProviderSettings
    {
        public string? ForceProvider { get; set; } // "local" или "openrouter"
        public bool? PreferLocal { get; set; } = true;
        public int LocalHealthCheckTimeoutMs { get; set; } = 2000;
    }
}
