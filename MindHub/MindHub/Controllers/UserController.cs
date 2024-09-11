using Microsoft.AspNetCore.Mvc;
using MindHub.Common;
using MindHub.Services.Nodes;
using MindHub.Services.Styles;
using MindHub.Services.Users;
using Newtonsoft.Json.Linq;

namespace MindHub.API.Controllers
{
    [Route("~/api/users")]
    public class UserController : BaseAPIController
    {
        private readonly IUserService _userService;
        public UserController(
            IUserContextProvider userContextProvider,
            IUserService userService
            ) : base(userContextProvider)
        {
            _userService = userService;
        }

        [HttpPost("signup/email={email}&password={password}")]
        public async Task<ActionResult> SignUp([FromRoute] string email, [FromRoute] string password)
        {
            var fields = await _userService.SingUp(email, password);

            return fields ? Ok() : BadRequest();
        }

        [HttpPost("login/email={email}&password={password}")]
        public async Task<ActionResult> Login([FromRoute] string email, [FromRoute] string password)
        {
            var fields = await _userService.Login(email, password);

            return fields ? Ok() : BadRequest();
        }


        [HttpGet]
        public async Task<ActionResult<List<NodeDto>>> List()
        {
            var fields = await _userService.GetListAsync();
            return Ok(fields);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<NodeDto>> Get(int id)
        {
            var field = await _userService.FetchAsync(id);
            return Ok(field);
        }

        [HttpPost]
        public async Task<ActionResult<NodeDto>> Create([FromBody] UserDto entity)
        {
            var userDto = await _userService.CreateAsync(entity);
            return Ok(userDto);
        }

        [HttpPatch("{id}")]
        public async Task<ActionResult> PatchQuestion([FromRoute] int id, [FromBody] JObject field)
        {
            await _userService.PatchAsync(id, field);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task Delete([FromRoute] int id)
        {
            await _userService.DeleteAsync(id);
        }
    }
}
