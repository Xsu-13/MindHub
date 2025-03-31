using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MindHub.Common;
using MindHub.Domain;
using MindHub.Services.Invites;
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
        public async Task<ActionResult<bool>> AcceptInvite(string token, int userId)
        {
            return true;
            /*var invite = await _db.Invites
                .FirstOrDefaultAsync(i => i.Token == token && i.Status == InviteStatus.Pending);

            if (invite == null || invite.ExpiresAt < DateTime.UtcNow)
                return BadRequest("Invalid or expired invitation");

            // Если пользователь не авторизован - редирект на регистрацию
            if (userId == null)
            {
                return RedirectToPage("/Account/Register", new { inviteToken = token });
            }

            // Добавление прав доступа
            var access = new MapAccess
            {
                UserId = userId,
                MapId = invite.MapId,
                PermissionLevel = invite.Permissions
            };

            _db.MapAccesses.Add(access);
            invite.Status = InviteStatus.Accepted;
            await _db.SaveChangesAsync();*/

            // Редирект на карту
            //return RedirectToAction("ViewMap", "MindMaps", new { id = invite.MapId });
        }
    }
}
