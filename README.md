# MindHub

Веб-приложение для совместной работы с интеллект-картами: фронтенд на **React + Vite**, бэкенд на **ASP.NET Core 8**, база данных **PostgreSQL**, real-time через **SignalR**.

## Структура репозитория

| Путь | Описание |
|------|----------|
| `Frontend/MindHub/` | Клиентское SPA (React 18, Vite) |
| `MindHub/` | Решение .NET: API, DAL, сервисы, тесты |
| `MindHub/docker-compose.yml` | Запуск API, фронтенда и PostgreSQL в Docker |

## Необходимое ПО

### Обязательно

| Компонент | Версия | Назначение |
|-----------|--------|------------|
| [.NET SDK](https://dotnet.microsoft.com/download) | 8.0 | Сборка и запуск API |
| [Node.js](https://nodejs.org/) | 18+ (LTS) | Фронтенд, `npm` |
| [PostgreSQL](https://www.postgresql.org/download/) | 13+ | Хранение данных |

Для миграций базы данных установите глобальный инструмент EF Core:

```bash
dotnet tool install --global dotnet-ef
```

Проверка установки:

```bash
dotnet --version
node --version
npm --version
dotnet ef --version
```

### Опционально

| Компонент | Назначение |
|-----------|------------|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Запуск всего стека одной командой |
| [Ollama](https://ollama.com/) | Локальные LLM (модель по умолчанию: `qwen2.5-coder:7b`) |
| Аккаунт [OpenRouter](https://openrouter.ai/) | Облачные LLM, если локальная модель недоступна |

---

## Конфигурация

### База данных

Строка подключения задаётся в:

- `MindHub/MindHub/appsettings.json` — для API;
- `MindHub/MindHub.DAL/migrationSettings.json` — для команд `dotnet ef`.

**Локальная разработка** (PostgreSQL на машине, не в Docker):

```text
Host=localhost;Port=5432;Database=mindhub;Username=postgres;Password=<ваш_пароль>
```

**Docker Compose** (хост `postgres` уже прописан в `appsettings.json`):

```text
Host=postgres;Port=5432;Database=mindhub;Username=postgres;Password=123
```

Создайте базу `mindhub` (если PostgreSQL установлен локально):

```sql
CREATE DATABASE mindhub;
```

### Секреты и ИИ

В `MindHub/MindHub/appsettings.json` настраиваются:

- `JwtOptions:SecretKey` — ключ для JWT (для продакшена используйте длинный случайный секрет);
- `OpenRouterSettings:ApiKey` — ключ OpenRouter;
- `LocalLLM` — URL Ollama (по умолчанию `http://localhost:11434` при локальном запуске);
- `LLMProvider` / `AI` — выбор локальной или облачной модели.

Рекомендуется не коммитить реальные ключи. Для разработки можно использовать [User Secrets](https://learn.microsoft.com/aspnet/core/security/app-secrets):

```bash
cd MindHub/MindHub
dotnet user-secrets init
dotnet user-secrets set "OpenRouterSettings:ApiKey" "ваш-ключ"
```

### Фронтенд

URL API задаётся переменной окружения **`VITE_API_URL`** (см. `Frontend/MindHub/src/services/urls.js`).

| Сценарий | Значение `VITE_API_URL` |
|----------|-------------------------|
| API через `dotnet run` (HTTPS) | `https://localhost:7226` |
| API через `dotnet run` (HTTP) | `http://localhost:5234` |
| API в Docker (HTTP) | `http://localhost:5000` |
| API в Docker (HTTPS) | `https://localhost:5001` |

Создайте файл `Frontend/MindHub/.env.local` (не коммитится, если добавлен в `.gitignore`):

```env
VITE_API_URL=https://localhost:7226
```

CORS на API разрешён для `http://localhost:5173` (стандартный порт Vite).

---

## Запуск

### Вариант 1: Docker Compose (всё сразу)

Из каталога `MindHub/` (где лежит `docker-compose.yml`):

```bash
docker compose up --build
```

После сборки:

| Сервис | URL |
|--------|-----|
| Фронтенд | http://localhost:3000 |
| API (HTTP) | http://localhost:5000 |
| API (HTTPS) | https://localhost:5001 |
| PostgreSQL | `localhost:5432` (логин `postgres`, пароль `123`, БД `mindhub`) |

Примените миграции к контейнеру PostgreSQL (см. раздел «Миграции»), если база пустая.

Остановка:

```bash
docker compose down
```

### Вариант 2: Локальная разработка

#### 1. PostgreSQL

Запустите сервер PostgreSQL и убедитесь, что строки подключения в `appsettings.json` и `migrationSettings.json` указывают на `localhost`.

#### 2. Миграции

```bash
cd MindHub/MindHub.DAL
dotnet ef database update --context MindHubContext --project .\MindHub.DAL.csproj --startup-project .\MindHub.DAL.csproj
```

Перед командой при необходимости обновите `migrationSettings.json` (хост, пароль).

#### 3. Бэкенд

```bash
cd MindHub/MindHub
dotnet restore
dotnet run
```

По умолчанию (профиль `https` в `Properties/launchSettings.json`):

- HTTP: http://localhost:5234  
- HTTPS: https://localhost:7226  
- Swagger: `/swagger` (только в среде Development)

#### 4. Фронтенд

В отдельном терминале:

```bash
cd Frontend/MindHub
npm install
npm run dev
```

Приложение откроется на http://localhost:5173. Убедитесь, что `VITE_API_URL` совпадает с адресом запущенного API.

#### 5. Ollama (опционально)

Если нужны локальные подсказки ИИ:

```bash
ollama pull qwen2.5-coder:7b
ollama serve
```

В `appsettings.json` для локального API укажите `LocalLLM:BaseUrl`: `http://localhost:11434`.

---

## Полезные команды

### Фронтенд

```bash
cd Frontend/MindHub
npm run build    # production-сборка
npm run preview  # просмотр production-сборки
npm run lint     # ESLint
```

### Бэкенд

```bash
cd MindHub
dotnet build MindHub.sln
dotnet test MindHub.Tests/MindHub.Tests.csproj
```

### Новая миграция EF Core

```bash
cd MindHub/MindHub.DAL
dotnet ef migrations add <ИмяМиграции> --context MindHubContext --project .\MindHub.DAL.csproj --startup-project .\MindHub.DAL.csproj
dotnet ef database update --context MindHubContext --project .\MindHub.DAL.csproj --startup-project .\MindHub.DAL.csproj
```

Подробнее см. `MindHub/MindHub.DAL/migrationsInstraction.txt`.

---

## Устранение неполадок

- **CORS / сеть:** фронтенд должен ходить на тот же хост и порт, что указаны в `VITE_API_URL`; порт Vite — `5173`.
- **База недоступна:** проверьте `Host` в строке подключения (`localhost` локально, `postgres` в Docker).
- **ИИ не отвечает:** проверьте, запущен ли Ollama, или задайте валидный ключ OpenRouter в конфигурации.
- **HTTPS и сертификаты:** при ошибках доверия к dev-сертификату выполните `dotnet dev-certs https --trust`.

---

## Дополнительно

- Интеграция OpenRouter: `MindHub/MindHub.Services/OpenRouter/README.md`
- SignalR hub: `/liveHub`
