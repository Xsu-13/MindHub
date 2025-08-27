namespace MindHub.Services.OpenRouter
{
    /// <summary>
    /// Интерфейс для работы с OpenRouter API
    /// </summary>
    public interface IOpenRouterService
    {
        Task<QueryResponseDto> SendQueryAsync(QueryRequestDto request, CancellationToken cancellationToken = default);
    }
}

