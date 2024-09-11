using Microsoft.AspNetCore.Mvc;
using MindHub.Common;
using MindHub.Services.Nodes;
using MindHub.Services.Styles;
using Newtonsoft.Json.Linq;

namespace MindHub.API.Controllers
{
    [Route("~/api/styles")]
    public class StyleController : BaseAPIController
    {
        private readonly IStyleService _styleService;
        public StyleController(
            IUserContextProvider userContextProvider,
            IStyleService styleService
            ) : base(userContextProvider)
        {
            _styleService = styleService;
        }

        [HttpGet]
        public async Task<ActionResult<List<NodeDto>>> List()
        {
            var fields = await _styleService.GetListAsync();
            return Ok(fields);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<NodeDto>> Get(int id)
        {
            var field = await _styleService.FetchAsync(id);

            return Ok(field);
        }

        [HttpPost]
        public async Task<ActionResult<NodeDto>> Create([FromBody] StyleDto entity)
        {
            var styleDto = await _styleService.CreateAsync(entity);
            return Ok(styleDto);
        }

        [HttpPatch("{id}")]
        public async Task<ActionResult> PatchQuestion([FromRoute] int id, [FromBody] JObject field)
        {
            await _styleService.PatchAsync(id, field);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task Delete([FromRoute] int id)
        {
            await _styleService.DeleteAsync(id);
        }
    }
}
