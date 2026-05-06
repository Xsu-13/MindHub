using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MindHub.Common;
using MindHub.Domain;
using MindHub.Services.Invites;
using MindHub.Services.Maps;
using System.Security.Cryptography;

namespace MindHub.API.Controllers
{
    [Route("~/api/invites")]
    public class InvitesController : BaseAPIController
    {
        private readonly IInviteService _inviteService;
        public InvitesController(IUserContextProvider userContextProvider,
            IInviteService inviteService) 
            : base(userContextProvider)
        {
            _inviteService = inviteService;
        }

        [HttpPost("map/{mapId}/user/{userId}")]
        public async Task<ActionResult<string>> CreateInvite([FromRoute] int mapId, [FromRoute] int userId)
        {
            var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
            .Replace("/", "_").Replace("+", "-");

            var invite = new InviteDto
            {
                MapId = mapId,
                InviterId = userId,
                Token = token
            };

            await _inviteService.CreateAsync(invite);

            var inviteUrl = $"http://localhost:3000/invite/{token}";

            return Ok(inviteUrl);
        }

        [HttpGet("accept/{token}")]
        public async Task<ActionResult<int?>> AcceptInviteByToken(string token)
        {
            var mapId = await _inviteService.AcceptInvite(token);

            return Ok(mapId);
        }
    }
}
