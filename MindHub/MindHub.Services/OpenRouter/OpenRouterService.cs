using Microsoft.Extensions.Options;
using OpenRouterClient;
using Microsoft.Extensions.Logging;
using MindHub.Services.Nodes;
using Newtonsoft.Json;

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

                // Формируем промпт для структурирования мыслей
                var systemPrompt = "Ты — помощник по структурированию мыслей. Ты помогаешь пользователям расширять и углублять их ментальные карты.\n" +
                                   "Твои ответы должны быть краткими, четкими и готовыми для использования в качестве названий узлов карты.\n" +
                                   "Отвечай ТОЛЬКО в формате JSON, как указано ниже строго с теми же полями, все поля должны быть заполнены (координаты в том числе).\n\n" +
                                   "Учти контекст.\n\n";

                // Формируем контекст из узлов
                var contextJson = "";
                if (request.context != null && request.context.Any())
                {
                    contextJson = JsonConvert.SerializeObject(new { nodes = request.context }, Formatting.Indented);
                }

                var fullPrompt = systemPrompt + 
                                "КОНТЕКСТ:\n" + contextJson + "\n\n" +
                                "ПОЛЬЗОВАТЕЛЬСКИЙ ЗАПРОС: " + request.Query;

                _logger.LogInformation("Отправка запроса к OpenRouter API. Модель: {Model}, Temperature: {Temperature}, MaxTokens: {MaxTokens}", 
                    model, temperature, maxTokens);

                var chatBuilder = _client.Chat
                    .WithModel(model)
                    .WithTemperature((float)temperature)
                    .WithMaxTokens(maxTokens)
                    .AddUserMessage(fullPrompt);

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

                _logger.LogInformation("Получен ответ от OpenRouter API: {Response}", assistantMessage);

                // Парсим JSON ответ
                try
                {
                    var jsonResponse = JsonConvert.DeserializeObject<dynamic>(assistantMessage.Replace("```json", "").Replace("```", ""));
                    var nodes = new List<NodeDto>();

                    if (jsonResponse?.nodes != null)
                    {
                        foreach (var nodeJson in jsonResponse.nodes)
                        {
                            var node = new NodeDto
                            {
                                // Поддерживаем как заглавные, так и строчные буквы в названиях полей
                                Id = nodeJson.Id ?? nodeJson.id ?? 0,
                                MapId = nodeJson.MapId ?? nodeJson.mapId ?? 0,
                                ParentNodeId = nodeJson.ParentNodeId ?? nodeJson.parentNodeId,
                                Title = nodeJson.Title ?? nodeJson.title ?? "",
                                Content = nodeJson.Content ?? nodeJson.content ?? "",
                                X = nodeJson.X ?? nodeJson.x ?? 0,
                                Y = nodeJson.Y ?? nodeJson.y ?? 0,
                                Style = null
                            };
                            nodes.Add(node);
                        }
                    }

                    return new QueryResponseDto
                    {
                        Success = true,
                        Response = nodes,
                        Model = model
                    };
                }
                catch (JsonException ex)
                {
                    // Если не удалось распарсить JSON, возвращаем ошибку
                    _logger.LogError(ex, "Ошибка при парсинге JSON ответа от AI: {Response}", assistantMessage);
                    return new QueryResponseDto
                    {
                        Success = false,
                        ErrorMessage = $"Ответ AI не в правильном JSON формате. Ошибка: {ex.Message}. Ответ: {assistantMessage}"
                    };
                }
                catch (Exception ex)
                {
                    // Обрабатываем другие возможные ошибки при парсинге
                    _logger.LogError(ex, "Неожиданная ошибка при обработке ответа AI: {Response}", assistantMessage);
                    return new QueryResponseDto
                    {
                        Success = false,
                        ErrorMessage = $"Неожиданная ошибка при обработке ответа AI: {ex.Message}"
                    };
                }
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

