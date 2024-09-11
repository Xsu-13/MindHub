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
        public async Task<ActionResult<NodeDto>> Create([FromBody] NodeDto entity)
        {
            var nodeDto = await _nodeService.CreateAsync(entity);
            return Ok(nodeDto);
        }

        [HttpPatch("{id}")]
        [RequestModel(typeof(NodeDto))]
        public async Task<ActionResult> PatchQuestion([FromRoute] int id, [FromBody] JObject field)
        {
            await _nodeService.PatchAsync(id, field);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task Delete([FromRoute] int id)
        {
            await _nodeService.DeleteAsync(id);
        }
    }
}
