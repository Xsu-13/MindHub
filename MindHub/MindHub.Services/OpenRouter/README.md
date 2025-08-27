# OpenRouter API Integration

Этот модуль обеспечивает интеграцию с OpenRouter API для работы с ИИ ассистентом с использованием библиотеки **OpenRouterClient** версии 1.0.2.

## Настройка

### 1. Установка зависимостей

Пакет `OpenRouterClient` версии 1.0.2 уже установлен в проект.

### 2. Конфигурация в appsettings.json

```json
{
  "OpenRouterSettings": {
    "ApiKey": "YOUR_OPENROUTER_API_KEY_HERE",
    "BaseUrl": "https://openrouter.ai/api/v1",
    "DefaultModel": "deepseek/deepseek-r1:free",
    "AppName": "MindHub",
    "AppUrl": "https://mindhub.app"
  }
}
```

### 3. Получение API ключа

1. Зарегистрируйтесь на [OpenRouter](https://openrouter.ai)
2. Создайте API ключ в разделе "API Keys"
3. Замените `YOUR_OPENROUTER_API_KEY_HERE` на ваш ключ

## API Endpoints

### POST /api/openrouter/query

Отправляет расширенный запрос к ИИ ассистенту с дополнительными параметрами.

**Request Body:**
```json
{
  "query": "Что такое искусственный интеллект?",
  "model": "google/gemini-2.5-pro-exp-03-25:free",
  "temperature": 0.7,
  "maxTokens": 2000
}
```

**Response:**
```json
{
  "success": true,
  "response": "Искусственный интеллект - это...",
  "model": "google/gemini-2.5-pro-exp-03-25:free",
  "usage": {
    "promptTokens": 10,
    "completionTokens": 50,
    "totalTokens": 60,
    "cost": 0.001
  },
  "errorMessage": null
}
```

### POST /api/openrouter/ask

Альтернативный метод для отправки простого запроса строкой.

**Request Body:**
```json
"Что такое искусственный интеллект?"
```

**Response:** Аналогично `/query`

## Использование в коде

### Простой запрос

```csharp
public class MyController : BaseAPIController
{
    private readonly IOpenRouterService _openRouterService;

    public MyController(
        IUserContextProvider userContextProvider,
        IOpenRouterService openRouterService)
        : base(userContextProvider)
    {
        _openRouterService = openRouterService;
    }

    public async Task<string> GetAIResponse(string userQuestion)
    {
        var response = await _openRouterService.SendQueryAsync(userQuestion);
        return response.Success ? response.Response : response.ErrorMessage;
    }
}
```

### Расширенный запрос с параметрами

```csharp
public async Task<QueryResponseDto> GetAdvancedResponse()
{
    var request = new QueryRequestDto
    {
        Query = "Объясни квантовую физику простыми словами",
        Model = "google/gemini-2.5-pro-exp-03-25:free",
        Temperature = 0.8,
        MaxTokens = 1500
    };

    return await _openRouterService.SendQueryAsync(request);
}
```

### Использование напрямую через OrClient (как в примере)

```csharp
OrClient client = new OrClient(
    apiUrl: "https://openrouter.ai/api/v1/chat/completions",
    apiToken: "sk-or-v1-xxxxx"
);

var response = await client.Chat
    .WithModel("google/gemini-2.5-pro-exp-03-25:free")
    .AddUserMessage("How would you build the tallest building ever?")
    .SendAsync();

Console.WriteLine(response?.Choices[0].Message);
```

## Поддерживаемые модели

По умолчанию используется модель `deepseek/deepseek-r1:free`, но вы можете указать любую другую в запросе:

**Бесплатные модели:**
- `deepseek/deepseek-r1:free`
- `google/gemini-2.5-pro-exp-03-25:free`
- `google/gemma-7b-it:free`
- `microsoft/phi-3-medium-128k-instruct:free`

**Платные модели:**
- `openai/gpt-4o`
- `anthropic/claude-3.5-sonnet`
- `google/gemini-pro-1.5`
- И многие другие...

## Новые возможности

### Логирование

Сервис включает подробное логирование:
- Информация о отправляемых запросах
- Детали использования токенов
- Ошибки и предупреждения

### Контроль стоимости

Ответы включают информацию о стоимости запроса:
```json
{
  "usage": {
    "promptTokens": 15,
    "completionTokens": 150,
    "totalTokens": 165,
    "cost": 0.00025
  }
}
```

### Настраиваемые параметры

Можно настроить:
- `temperature` - креативность ответа (0-1)
- `maxTokens` - максимальная длина ответа
- `model` - конкретная модель для запроса

## Обработка ошибок

Сервис автоматически обрабатывает:
- Сетевые ошибки
- Отмену операций (CancellationToken)
- Ошибки API
- Проблемы конфигурации
- Валидация входных данных

Все ошибки логируются и возвращаются в структурированном виде.

