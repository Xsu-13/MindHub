using Microsoft.AspNetCore.Mvc;
using MindHub.Common;
using MindHub.Services.Maps;
using Newtonsoft.Json.Linq;

namespace MindHub.API.Controllers
{
    [Route("~/api/maps")]
    public class MapController : BaseAPIController
    {
        private readonly IMapService _mapService;
        public MapController(
            IUserContextProvider userContextProvider,
            IMapService mapService
            ) : base(userContextProvider)
        {
            _mapService = mapService;
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
