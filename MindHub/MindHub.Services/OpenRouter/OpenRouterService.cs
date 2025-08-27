using Microsoft.Extensions.Options;
using OpenRouterClient;
using Microsoft.Extensions.Logging;

namespace MindHub.Services.OpenRouter
{
    public class OpenRouterService : IOpenRouterService
    {
        private readonly OrClient _client;
        private readonly OpenRouterSettings _settings;
        private readonly ILogger<OpenRouterService> _logger;

        public OpenRouterService(
            IOptions<OpenRouterSettings> settings,
            ILogger<OpenRouterService> logger)
        {
            _settings = settings.Value ?? throw new ArgumentNullException(nameof(settings));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));

            if (string.IsNullOrWhiteSpace(_settings.ApiKey))
            {
                throw new InvalidOperationException("OpenRouter API Key не настроен в конфигурации");
            }

            _client = new OrClient(
                apiUrl: _settings.BaseUrl + "/chat/completions",
                apiToken: _settings.ApiKey
            );
        }

        public async Task<QueryResponseDto> SendQueryAsync(QueryRequestDto request, CancellationToken cancellationToken = default)
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.Query))
                {
                    return new QueryResponseDto
                    {
                        Success = false,
                        ErrorMessage = "Запрос не может быть пустым"
                    };
                }

                var model = request.Model ?? _settings.DefaultModel;
                var temperature = request.Temperature ?? 0.7;
                var maxTokens = request.MaxTokens ?? 2000;

                _logger.LogInformation("Отправка расширенного запроса к OpenRouter API. Модель: {Model}, Temperature: {Temperature}, MaxTokens: {MaxTokens}", 
                    model, temperature, maxTokens);

                var chatBuilder = _client.Chat
                    .WithModel(model)
                    .AddUserMessage(request.Query);

                var response = await chatBuilder.SendAsync();

                if (response?.Choices == null || !response.Choices.Any())
                {
                    return new QueryResponseDto
                    {
                        Success = false,
                        ErrorMessage = "API не вернул ответ"
                    };
                }

                var firstChoice = response.Choices.First();
                var assistantMessage = firstChoice.Message?.Content ?? "Ответ не получен";

                return new QueryResponseDto
                {
                    Success = true,
                    Response = assistantMessage
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при обработке расширенного запроса к OpenRouter API");
                return new QueryResponseDto
                {
                    Success = false,
                    ErrorMessage = $"Ошибка: {ex.Message}"
                };
            }
        }
    }
}

