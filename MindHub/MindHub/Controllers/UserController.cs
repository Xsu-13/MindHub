using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
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

        [HttpPost("signup")]
        public async Task<ActionResult> SignUp([FromBody] SignUpRequest request)
        {
            await _userService.SingUp(request.Username, request.Email, request.Password);

            return Ok();
        }

        [HttpPost("login")]
        public async Task<ActionResult> Login([FromBody] LoginRequest request)
        {
            var token = await _userService.Login(request.Email, request.Password);
            if(!token.IsNullOrEmpty())
                Response.Cookies.Append("token", token);

            return !token.IsNullOrEmpty() ? Ok() : BadRequest();
        }

        [HttpPost("logout")]
        public async Task<ActionResult> Logout()
        {
            Response.Cookies.Delete("token");

            return Ok();
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

    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class SignUpRequest
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
