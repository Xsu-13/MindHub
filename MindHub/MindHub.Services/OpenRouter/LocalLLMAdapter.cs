using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MindHub.Services.LocalLLM;
using MindHub.Services.Nodes;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace MindHub.Services.OpenRouter
{
    public class LocalLLMAdapter : IOpenRouterService
    {
        private readonly ILocalLLMService _localLLM;
        private readonly ILogger<LocalLLMAdapter> _logger;
        private readonly LocalLLMSettings _settings;

        public LocalLLMAdapter(
            ILocalLLMService localLLM,
            IOptions<LocalLLMSettings> settings,
            ILogger<LocalLLMAdapter> logger)
        {
            _localLLM = localLLM;
            _logger = logger;
            _settings = settings.Value;
        }

        public async Task<QueryResponseDto> SendQueryAsync(QueryRequestDto request, CancellationToken cancellationToken = default)
        {
            try
            {
                // Формируем промпт (адаптируем ваш существующий промпт)
                var systemPrompt = BuildSystemPrompt();
                var contextJson = request.context?.Any() == true
                    ? JsonConvert.SerializeObject(new { nodes = request.context }, Formatting.Indented)
                    : string.Empty;

                var fullPrompt = $@"{systemPrompt}

                                    КОНТЕКСТ:
                                    {contextJson}

                                    ПОЛЬЗОВАТЕЛЬСКИЙ ЗАПРОС: {request.Query}

                                    Ответь ТОЛЬКО JSON формата:
                                    {{
                                      ""type"": ""nodes"",
                                      ""nodes"": [
                                        {{
                                          ""tempId"": ""node-1"",
                                          ""parentNodeId"": null,
                                          ""title"": ""Название на русском"",
                                          ""content"": ""// код или псевдокод"",
                                          ""x"": 0,
                                          ""y"": 0
                                        }}
                                      ]
                                    }}";

                _logger.LogInformation("Отправка запроса к локальной LLM. Модель: {Model}", _settings.DefaultModel);

                var responseText = await _localLLM.GenerateResponseAsync(fullPrompt, cancellationToken);

                _logger.LogInformation("Получен ответ от локальной LLM: {Response}", responseText);

                // Используем существующий парсер
                return ParseAssistantResponse(responseText, _settings.DefaultModel ?? "local", null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при работе с локальной LLM");
                return new QueryResponseDto
                {
                    Success = false,
                    ErrorMessage = $"Ошибка локальной LLM: {ex.Message}"
                };
            }
        }

        private string BuildSystemPrompt()
        {
            return @"Ты — ИИ-ассистент ментальной карты.
                    ОСНОВНЫЕ ПРАВИЛА:
                    1) НЕ используй реальные id.
                    2) Используй только tempId (строка, уникальная внутри ответа).
                    3) parentNodeId ссылается на tempId родителя.
                    4) Названия узлов на русском.
                    5) content — только код или псевдокод.
                    6) Ответ строго JSON без markdown.";
        }

        private QueryResponseDto ParseAssistantResponse(string assistantMessage, string model, string? recoveryMessage)
        {
            try
            {
                var cleanedResponse = assistantMessage
                    .Replace("```json", "")
                    .Replace("```", "")
                    .Trim();

                var jsonStartIndex = cleanedResponse.IndexOf('{');
                var jsonEndIndex = cleanedResponse.LastIndexOf('}');

                if (jsonStartIndex < 0 || jsonEndIndex < 0)
                {
                    throw new JsonException("JSON не найден");
                }

                cleanedResponse = cleanedResponse.Substring(jsonStartIndex, jsonEndIndex - jsonStartIndex + 1);
                var token = JToken.Parse(cleanedResponse);

                var nodesArray = token["nodes"] as JArray;
                if (nodesArray == null)
                {
                    throw new Exception("Массив nodes не найден");
                }

                var nodes = new List<NodeDto>();
                foreach (var nodeJson in nodesArray)
                {
                    nodes.Add(new NodeDto
                    {
                        TempId = nodeJson["tempId"]?.Value<string>(),
                        ParentTempId = nodeJson["parentNodeId"]?.Value<string>(),
                        Title = nodeJson["title"]?.Value<string>() ?? "Новый узел",
                        Content = nodeJson["content"]?.Value<string>() ?? "// Код",
                        X = nodeJson["x"]?.Value<float>() ?? 0,
                        Y = nodeJson["y"]?.Value<float>() ?? 0
                    });
                }

                return new QueryResponseDto
                {
                    Success = true,
                    Response = nodes,
                    Model = model,
                    RequiresClarification = false
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка парсинга JSON от локальной LLM");
                return new QueryResponseDto
                {
                    Success = false,
                    ErrorMessage = $"Не удалось распарсить ответ локальной LLM: {ex.Message}"
                };
            }
        }
    }
}