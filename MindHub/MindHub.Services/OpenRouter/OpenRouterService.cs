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
                    "1) НЕ используй реальные id.\n" +
                    "2) Используй только tempId (строка, уникальная внутри ответа).\n" +
                    "3) parentNodeId ссылается на tempId родителя.\n" +
                    "4) Названия узлов на русском.\n" +
                    "5) content — только код или псевдокод.\n" +
                    "6) Ответ строго JSON:\n" +
                    "{\n" +
                    "  \"type\": \"nodes\",\n" +
                    "  \"nodes\": [\n" +
                    "    {\n" +
                    "      \"tempId\": \"node-1\",\n" +
                    "      \"parentNodeId\": null,\n" +
                    "      \"title\": \"...\",\n" +
                    "      \"content\": \"...\",\n" +
                    "      \"x\": 0,\n" +
                    "      \"y\": 0\n" +
                    "    }\n" +
                    "  ]\n" +
                    "}";

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

                try
                {
                    return ParseAssistantResponse(assistantMessage, model, null);
                }
                catch (JsonException ex)
                {
                    _logger.LogWarning(ex, "JSON parsing failed, trying auto-repair. Error: {ErrorMessage}", ex.Message);
                    return await AttemptJsonRepair(assistantMessage, model, ex, maxTokens);
                }
                catch (Exception ex)
                {
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

        private async Task<QueryResponseDto> AttemptJsonRepair(string originalMessage, string model, JsonException initialException, int maxTokens, int retryCount = 0, int maxRetries = 3)
        {
            if (retryCount >= maxRetries)
            {
                _logger.LogError("Max JSON repair attempts ({MaxRetries}) exceeded", maxRetries);
                return new QueryResponseDto
                {
                    Success = false,
                    ErrorMessage = $"Ответ AI не в правильном JSON формате после {maxRetries} попыток автоисправления. Последняя ошибка: {initialException.Message}"
                };
            }

            try
            {
                var repairPrompt =
                    $"Попытка исправления #{retryCount + 1}/{maxRetries}\n" +
                    "Исправь JSON-ответ. Верни ТОЛЬКО строго валидный JSON формата из инструкции, без markdown, комментариев и текста.\n" +
                    $"Ошибка парсинга: {initialException.Message}\n" +
                    "Невалидный ответ:\n" + originalMessage + "\n\n" +
                    "Убедись что:\n" +
                    "1) JSON скобки и кавычки сбалансированы\n" +
                    "2) Нет запятых после последних элементов в массивах\n" +
                    "3) Все строки заключены в двойные кавычки\n" +
                    "4) Нет управляющих символов вне JSON\n" +
                    "5) Ответ начинается с { и заканчивается }";

                _logger.LogInformation("Отправка запроса на исправление JSON (попытка {Attempt}/{MaxAttempts})", retryCount + 1, maxRetries);

                var repairResponse = await _client.Chat
                    .WithModel(model)
                    .WithTemperature(0.1f)
                    .WithMaxTokens(Math.Min(maxTokens, 2000))
                    .AddUserMessage(repairPrompt)
                    .SendAsync();

                var repairedMessage = repairResponse?.Choices?.FirstOrDefault()?.Message?.Content ?? "";

                if (string.IsNullOrWhiteSpace(repairedMessage))
                {
                    _logger.LogWarning("Repair response was empty, retrying...");
                    return await AttemptJsonRepair(originalMessage, model, initialException, maxTokens, retryCount + 1, maxRetries);
                }

                _logger.LogInformation("Received repaired response (attempt {Attempt}): {Response}", retryCount + 1, repairedMessage);

                try
                {
                    var parsed = ParseAssistantResponse(repairedMessage, model,
                        $"AI вернул невалидный JSON на исходный запрос, успешно исправлено с попытки {retryCount + 1}/{maxRetries}.");
                    return parsed;
                }
                catch (JsonException innerEx)
                {
                    _logger.LogWarning(innerEx, "Repair attempt {Attempt} failed, retrying... Error: {ErrorMessage}", retryCount + 1, innerEx.Message);
                    return await AttemptJsonRepair(repairedMessage, model, innerEx, maxTokens, retryCount + 1, maxRetries);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during JSON repair attempt {Attempt}", retryCount + 1);
                return await AttemptJsonRepair(originalMessage, model, initialException, maxTokens, retryCount + 1, maxRetries);
            }
        }

        private QueryResponseDto ParseAssistantResponse(string assistantMessage, string model, string? recoveryMessage)
        {
            // Улучшенная очистка JSON от markdown и комментариев
            var cleanedResponse = assistantMessage
                .Replace("```json", "")
                .Replace("```", "")
                .Trim();

            // Удаляем текст до { и после }
            var jsonStartIndex = cleanedResponse.IndexOf('{');
            var jsonEndIndex = cleanedResponse.LastIndexOf('}');

            if (jsonStartIndex < 0 || jsonEndIndex < 0 || jsonStartIndex > jsonEndIndex)
            {
                throw new JsonException("JSON структура не найдена в ответе. Ответ должен начинаться с '{' и заканчиваться '}'");
            }

            cleanedResponse = cleanedResponse.Substring(jsonStartIndex, jsonEndIndex - jsonStartIndex + 1).Trim();

            JToken token;
            try
            {
                token = JToken.Parse(cleanedResponse);
            }
            catch (JsonException ex)
            {
                cleanedResponse = CleanUpJson(cleanedResponse);
                token = JToken.Parse(cleanedResponse);
            }

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
                        : clarificationQuestion,
                    RecoveryMessage = recoveryMessage
                };
            }

            var nodesArray = token.Type == JTokenType.Array
                ? (JArray)token
                : token["nodes"] as JArray;

            if (nodesArray == null)
            {
                throw new Exception("Не удалось найти массив узлов в ответе AI. Ответ должен содержать поле 'nodes' с массивом узлов");
            }

            var nodes = new List<NodeDto>();
            foreach (var nodeJson in nodesArray)
            {
                var node = new NodeDto
                {
                    Id = nodeJson["id"]?.Value<int>() ?? 0,
                    MapId = nodeJson["mapId"]?.Value<int>() ?? 0,
                    Title = nodeJson["title"]?.Value<string>() ?? "",
                    Content = nodeJson["content"]?.Value<string>() ?? "",
                    X = nodeJson["x"]?.Value<float>() ?? 0,
                    Y = nodeJson["y"]?.Value<float>() ?? 0,

                    TempId = nodeJson["tempId"]?.Value<string>() ?? nodeJson["TempId"]?.Value<string>(),
                    ParentTempId = nodeJson["parentNodeId"]?.Value<string>() ?? nodeJson["ParentNodeId"]?.Value<string>()
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
                ClarificationQuestion = null,
                RecoveryMessage = recoveryMessage
            };
        }

        private string CleanUpJson(string jsonString)
        {
            // Попытка исправления общих ошибок JSON
            var result = jsonString;

            // Удаляем управляющие символы которые не должны быть в JSON
            result = System.Text.RegularExpressions.Regex.Replace(result, @"[\x00-\x08\x0B\x0C\x0E-\x1F]", "");

            // Пытаемся исправить незакрытые строки в конце
            var openQuoteCount = result.Count(c => c == '"') - (result.Count(c => c == '\\') / 2);
            if (openQuoteCount % 2 != 0)
            {
                result = result.TrimEnd(',', ' ', '\n', '\r') + "\"";
            }

            return result;
        }
    }
}

