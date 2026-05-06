using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;

namespace MindHub.Services.LocalLLM
{
    public class OllamaService : ILocalLLMService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<OllamaService> _logger;
        private readonly LocalLLMSettings _settings;

        public OllamaService(
            HttpClient httpClient,
            IOptions<LocalLLMSettings> settings,
            ILogger<OllamaService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
            _settings = settings.Value;

            _httpClient.BaseAddress = new Uri(_settings.BaseUrl);
            _httpClient.DefaultRequestHeaders.Add("Accept", "application/json");
        }

        public async Task<string> GenerateResponseAsync(string prompt, CancellationToken cancellationToken = default)
        {
            try
            {
                var request = new
                {
                    model = _settings.DefaultModel,
                    prompt = prompt,
                    stream = false,
                    options = new
                    {
                        temperature = _settings.Temperature,
                        num_predict = _settings.MaxTokens
                    }
                };

                var json = JsonSerializer.Serialize(request, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                var content = new StringContent(json, Encoding.UTF8, "application/json");

                _logger.LogInformation("Sending request to Ollama: {Url}/api/generate", _settings.BaseUrl);

                var response = await _httpClient.PostAsync("/api/generate", content, cancellationToken);
                var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("Ollama error: {StatusCode} - {Body}", response.StatusCode, responseBody);
                    throw new Exception($"Ollama API error: {response.StatusCode}");
                }

                _logger.LogDebug("Ollama raw response: {Response}", responseBody);

                // Парсим корневой JSON
                using var doc = JsonDocument.Parse(responseBody);
                var root = doc.RootElement;

                // Извлекаем поле "response"
                if (!root.TryGetProperty("response", out JsonElement responseElement))
                {
                    throw new Exception("Ollama response missing 'response' field");
                }

                var responseText = responseElement.GetString() ?? string.Empty;

                if (string.IsNullOrWhiteSpace(responseText))
                {
                    throw new Exception("Ollama returned empty response");
                }

                _logger.LogInformation("Ollama extracted response length: {Length}", responseText.Length);
                _logger.LogDebug("Extracted response: {Response}", responseText);

                return responseText;
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Failed to parse Ollama response");
                throw new Exception("Invalid JSON response from Ollama", ex);
            }
        }

        public async Task<List<string>> GetAvailableModelsAsync()
        {
            try
            {
                var response = await _httpClient.GetFromJsonAsync<OllamaTagsResponse>("/api/tags");
                return response?.Models?.Select(m => m.Name).ToList() ?? new List<string>();
            }
            catch
            {
                return new List<string>();
            }
        }

        private class OllamaTagsResponse
        {
            public List<OllamaModel> Models { get; set; } = new();
        }

        private class OllamaModel
        {
            public string Name { get; set; } = string.Empty;
        }
    }
}