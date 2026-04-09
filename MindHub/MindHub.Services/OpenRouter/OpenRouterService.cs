using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MindHub.Services.Nodes;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using OpenRouterClient;

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

                var systemPrompt =
                    "Ты — ИИ-ассистент ментальной карты.\n" +
                    "ОСНОВНЫЕ ПРАВИЛА:\n" +
                    "1) По возможности НЕ задавай уточняющих вопросов и строй результат по лучшему предположению.\n" +
                    "2) Названия узлов (title) всегда на русском языке.\n" +
                    "3) Поле content всегда содержит код или псевдокод (без объяснений вне кода).\n" +
                    "4) Отвечай строго JSON-объектом одного из форматов:\n" +
                    "   a) Для результата:\n" +
                    "   {\n" +
                    "     \"type\": \"nodes\",\n" +
                    "     \"clarificationQuestion\": null,\n" +
                    "     \"nodes\": [\n" +
                    "       {\n" +
                    "         \"id\": 0,\n" +
                    "         \"mapId\": 0,\n" +
                    "         \"parentNodeId\": 0,\n" +
                    "         \"title\": \"Название на русском\",\n" +
                    "         \"content\": \"код или псевдокод\",\n" +
                    "         \"x\": 0,\n" +
                    "         \"y\": 0\n" +
                    "       }\n" +
                    "     ]\n" +
                    "   }\n" +
                    "   b) Если без уточнения действительно нельзя:\n" +
                    "   {\n" +
                    "     \"type\": \"clarification\",\n" +
                    "     \"clarificationQuestion\": \"УТОЧНЕНИЕ: ...\",\n" +
                    "     \"nodes\": []\n" +
                    "   }\n" +
                    "5) Если задаешь вопрос, начинай его строго с префикса \"УТОЧНЕНИЕ:\".\n" +
                    "6) Никаких markdown-блоков и текста вне JSON.\n\n" +
                    "Учти текущий контекст узлов и пользовательский запрос.\n\n";

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
                    var cleanedResponse = assistantMessage.Replace("```json", "").Replace("```", "").Trim();
                    var nodes = new List<NodeDto>();

                    // Пробуем десериализовать как JToken
                    var token = JToken.Parse(cleanedResponse);

                    var responseType = token["type"]?.Value<string>()?.Trim().ToLowerInvariant();
                    var clarificationQuestion = token["clarificationQuestion"]?.Value<string>()?.Trim();
                    if (responseType == "clarification")
                    {
                        return new QueryResponseDto
                        {
                            Success = true,
                            Response = new List<NodeDto>(),
                            Model = model,
                            RequiresClarification = true,
                            ClarificationQuestion = string.IsNullOrWhiteSpace(clarificationQuestion)
                                ? "УТОЧНЕНИЕ: Уточните, пожалуйста, задачу."
                                : clarificationQuestion
                        };
                    }

                    // Получаем массив узлов (либо сам token - массив, либо token["nodes"])
                    var nodesArray = token.Type == JTokenType.Array
                        ? (JArray)token
                        : token["nodes"] as JArray;

                    if (nodesArray == null)
                    {
                        throw new Exception("Не удалось найти массив узлов в ответе AI");
                    }

                    foreach (var nodeJson in nodesArray)
                    {
                        var node = new NodeDto
                        {
                            Id = nodeJson["Id"]?.Value<int>() ?? nodeJson["id"]?.Value<int>() ?? 0,
                            MapId = nodeJson["MapId"]?.Value<int>() ?? nodeJson["mapId"]?.Value<int>() ?? 0,
                            ParentNodeId = nodeJson["ParentNodeId"]?.Value<int>() ?? nodeJson["parentNodeId"]?.Value<int>(),
                            Title = nodeJson["Title"]?.Value<string>() ?? nodeJson["title"]?.Value<string>() ?? "",
                            Content = nodeJson["Content"]?.Value<string>() ?? nodeJson["content"]?.Value<string>() ?? "",
                            X = nodeJson["X"]?.Value<float>() ?? nodeJson["x"]?.Value<float>() ?? 0,
                            Y = nodeJson["Y"]?.Value<float>() ?? nodeJson["y"]?.Value<float>() ?? 0,
                            Style = null
                        };

                        if (string.IsNullOrWhiteSpace(node.Title))
                        {
                            node.Title = "Новый узел";
                        }

                        if (string.IsNullOrWhiteSpace(node.Content))
                        {
                            node.Content = "// Добавьте код или описание алгоритма";
                        }
                        nodes.Add(node);
                    }

                    return new QueryResponseDto
                    {
                        Success = true,
                        Response = nodes,
                        Model = model,
                        RequiresClarification = false,
                        ClarificationQuestion = null
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

