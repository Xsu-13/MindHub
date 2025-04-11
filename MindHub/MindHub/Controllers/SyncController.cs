using Microsoft.AspNetCore.Mvc;
using MindHub.Common;
using MindHub.Services.Nodes;
using MindHub.Services.Styles;
using MindHub.Services.Sync;

namespace MindHub.API.Controllers
{
    [Route("~/api/sync")]
    public class SyncController : BaseAPIController
    {
        private readonly INodeService _nodeService;
        private readonly ILogger<NodeService> _logger;
        public SyncController(IUserContextProvider userContextProvider,
            INodeService nodeService,
            ILogger<NodeService> logger) : base(userContextProvider)
        {
            _nodeService = nodeService;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> ProcessSync([FromBody] SyncRequest request)
        {
            var response = new
            {
                ProcessedActions = new List<string>(),
                FailedActions = new Dictionary<string, string>()
            };

            foreach (var action in request.Actions)
            {
                try
                {
                    var result = await ProcessSingleAction(action);
                    if (result.Success)
                    {
                        response.ProcessedActions.Add(action.ActionId);
                    }
                    else
                    {
                        response.FailedActions[action.ActionId] = result.Error;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error processing action {action.ActionId}");
                    response.FailedActions[action.ActionId] = ex.Message;
                }
            }

            return Ok(response);
        }

        private async Task<ActionProcessResult> ProcessSingleAction(SyncAction action)
        {
            try
            {
                switch (action.Type)
                {
                    case "UPDATE_NODE":
                        var updateDto = action.Payload.ToObject<NodeDto>();
                        //await _conflictResolver.ResolveUpdateConflict(updateDto);
                        await _nodeService.UpdateAsync(updateDto);
                        break;

                    case "CREATE_NODE":
                        var createDto = action.Payload.ToObject<NodeDto>();
                        var createdNode = await _nodeService.CreateAsync(createDto);
                        return new ActionProcessResult
                        {
                            Success = true,
                            CreatedId = createdNode.Id.ToString()
                        };

                    case "DELETE_NODE":
                        var nodeId = action.Payload["nodeId"].ToString();
                        await _nodeService.DeleteAsync(int.Parse(nodeId));
                        break;

                    default:
                        throw new NotSupportedException($"Action type {action.Type} is not supported");
                }

                return new ActionProcessResult{ Success = true };
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, $"Conflict detected in action {action.ActionId}");
                return new ActionProcessResult
                {
                    Success = false,
                    Error = "CONFLICT",
                    ConflictDetails = ex.Message
                };
            }
        }

    }

    public class SyncResponse
    {
        public bool Success => !FailedActions.Any();
        public List<string> ProcessedActions { get; set; }
        public Dictionary<string, string> FailedActions { get; set; }
        public Dictionary<string, object> Conflicts { get; set; } = new();
    }

    public class ActionProcessResult
    {
        public bool Success { get; set; }
        public string Error { get; set; }
        public object ConflictDetails { get; set; }
        public string CreatedId { get; set; }
    }
}
