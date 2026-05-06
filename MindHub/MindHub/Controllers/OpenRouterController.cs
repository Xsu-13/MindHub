using Microsoft.AspNetCore.Mvc;
using MindHub.Common;
using MindHub.Services.OpenRouter;

namespace MindHub.API.Controllers
{
    [Route("~/api/openrouter")]
    public class OpenRouterController : BaseAPIController
    {
        private readonly IOpenRouterService _openRouterService;
        private readonly LocalLLMAdapter _localLLMAdapter;

        public OpenRouterController(
            IUserContextProvider userContextProvider,
            IOpenRouterService openRouterService,
            LocalLLMAdapter localLLMAdapter)
            : base(userContextProvider)
        {
            _openRouterService = openRouterService ?? throw new ArgumentNullException(nameof(openRouterService));
            _localLLMAdapter = localLLMAdapter ?? throw new ArgumentNullException(nameof(localLLMAdapter));
        }

        [HttpPost("query")]
        public async Task<ActionResult<QueryResponseDto>> Query(
            [FromBody] QueryRequestDto request,
            CancellationToken cancellationToken = default)
        {
            if (request == null)
            {
                return BadRequest(new QueryResponseDto
                {
                    Success = false,
                    ErrorMessage = "Запрос не может быть пустым"
                });
            }

            if (string.IsNullOrWhiteSpace(request.Query))
            {
                return BadRequest(new QueryResponseDto
                {
                    Success = false,
                    ErrorMessage = "Текст запроса не может быть пустым"
                });
            }

            try
            {
                IOpenRouterService service;


                if (request.Model != null &&
                    (request.Model.Equals("local", StringComparison.OrdinalIgnoreCase)))
                {
                    service = _localLLMAdapter;
                }
                else
                { 
                    service = _openRouterService;
                }

                var response = await service.SendQueryAsync(request, cancellationToken);

                if (!response.Success)
                {
                    return BadRequest(response);
                }

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new QueryResponseDto
                {
                    Success = false,
                    ErrorMessage = $"Внутренняя ошибка сервера: {ex.Message}"
                });
            }
        }
    }
}

