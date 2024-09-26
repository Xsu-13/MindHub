using Microsoft.AspNetCore.Mvc;
using MindHub.Common;
using MindHub.Services.Maps;
using MindHub.Services.Nodes;
using MindHub.Services.Styles;
using Newtonsoft.Json.Linq;

namespace MindHub.API.Controllers
{
    [Route("~/api/maps")]
    public class MapController : BaseAPIController
    {
        private readonly IMapService _mapService;
        private readonly INodeService _nodeService;
        private readonly IStyleService _styleService;
        public MapController(
            IUserContextProvider userContextProvider,
            IMapService mapService,
            INodeService nodeService,
            IStyleService styleService
            ) : base(userContextProvider)
        {
            _mapService = mapService;
            _nodeService = nodeService;
            _styleService = styleService;
        }

        [HttpGet]
        public async Task<ActionResult<List<MapDto>>> List()
        {
            var fields = await _mapService.GetListAsync();
            return Ok(fields);
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<List<MapDto>>> GetByUserId([FromRoute] int userId)
        {
            var fields = await _mapService.GetByUserId(userId);
            return Ok(fields);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MapDto>> Get(int id)
        {
            var field = await _mapService.FetchAsync(id);

            return Ok(field);
        }

        [HttpPost]
        public async Task<ActionResult<MapDto>> Create([FromBody] MapDto entity)
        {
            var mapDto = await _mapService.CreateAsync(entity);

            foreach(var node in mapDto.Nodes)
            {
                await _nodeService.EnableAsync(node.Id);
                if(node.StyleId != null)
                    await _styleService.EnableAsync(node.StyleId ?? 0);
            }
            return Ok(mapDto);
        }

        [HttpPatch("{id}")]
        public async Task<ActionResult> PatchQuestion([FromRoute] int id, [FromBody] JObject field)
        {
            await _mapService.PatchAsync(id, field);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task Delete([FromRoute] int id)
        {
            await _mapService.DeleteAsync(id);
        }
    }
}
