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
        private readonly LinkGenerator _linkGenerator;
        private readonly IInviteService _inviteService;
        public InvitesController(IUserContextProvider userContextProvider,
            LinkGenerator linkGenerator,
            IInviteService inviteService) 
            : base(userContextProvider)
        {
            _inviteService = inviteService;
            _linkGenerator = linkGenerator;
        }

        [HttpPost]
        public async Task<ActionResult<string>> CreateInvite(int mapId, int userId)
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

            //var inviteDto = await _inviteService.CreateInvite(mapId, userId);

            var inviteUrl = _linkGenerator.GetUriByAction(
            HttpContext,
            action: "AcceptInvite",
            controller: "Invites",
            values: new { token });

            return Ok(inviteUrl);
        }

        [HttpGet("accept/{token}")]
        public async Task<ActionResult<MapDto>> AcceptInviteByToken(string token)
        {
            var access = await _inviteService.AcceptInvite(token);

            return Ok(access);
        }
    }
}
