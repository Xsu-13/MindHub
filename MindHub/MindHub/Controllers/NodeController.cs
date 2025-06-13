using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MindHub.Common;
using MindHub.Common.Attributes;
using MindHub.Services.Maps;
using MindHub.Services.Nodes;
using Newtonsoft.Json.Linq;

namespace MindHub.API.Controllers
{
    [Route("~/api/nodes")]
    public class NodeController : BaseAPIController
    {
        private readonly INodeService _nodeService;

        public NodeController(
            IUserContextProvider userContextProvider,
            INodeService nodeService)
            : base(userContextProvider)
        {
            _nodeService = nodeService;
        }

        [HttpGet]
        public async Task<ActionResult<List<NodeDto>>> List()
        {
            var fields = await _nodeService.GetListAsync();
            return Ok(fields);
        }

        [HttpGet("map/{mapId}")]
        public async Task<ActionResult<List<NodeDto>>> GetByMapId([FromRoute] int mapId)
        {
            var fields = await _nodeService.GetByMapId(mapId);
            return Ok(fields);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<NodeDto>> Get(int id)
        {
            var field = await _nodeService.FetchAsync(id);

            return Ok(field);
        }

        [HttpPost]
        public async Task<ActionResult<NodeDto>> Create([FromBody] NodeDto entity, [FromRoute] int userId)
        {
            var nodeDto = await _nodeService.CreateNodeAsync(entity, userId);
            return Ok(nodeDto);
        }

        [HttpPatch("{id}")]
        [RequestModel(typeof(NodeDto))]
        public async Task<ActionResult> PatchNode([FromRoute] int id, [FromBody] JObject field, [FromRoute] int userId)
        {
            await _nodeService.PatchNodeAsync(id, field, userId);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task Delete([FromRoute] int id, [FromRoute] int userId)
        {
            await _nodeService.DeleteNodeAsync(id, userId);
        }
    }
}
