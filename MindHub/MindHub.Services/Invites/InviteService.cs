using AutoMapper;
using Microsoft.EntityFrameworkCore;
using MindHub.DAL;
using MindHub.DAL.Repositories;
using MindHub.Domain;
using MindHub.Services.BaseServices;
using MindHub.Services.Maps;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace MindHub.Services.Invites
{
    internal class InviteService : ServiceBase<Invite, InviteDto>, IInviteService
    {
        public InviteService(IRepository<Invite> repository, IMapper mapper) 
            : base(repository, mapper)
        {

        }

        public async Task<InviteDto> CreateInvite(int mapId, int userId)
        {
            var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
            .Replace("/", "_").Replace("+", "-");

            var invite = new Invite
            {
                MapId = mapId,
                InviterId = userId,
                Token = token
            };

            await _repository.CreateAsync(invite);
            await _repository.Context.SaveChangesAsync();

            return _mapper.Map<InviteDto>(invite);
        }

        public async Task<bool> AcceptInvite(string token)
        {
            var invite = await _repository.GetQuery()
                .FirstOrDefaultAsync(i => i.Token == token);

            if (invite == null || invite.ExpiresAt < DateTime.UtcNow)
                return false;
            else return true;

            // Если пользователь не авторизован - редирект на регистрацию
            /*if (userId == null)
            {
                return RedirectToPage("/Account/Register", new { inviteToken = token });
            }*/

            // Добавление прав доступа
            /*var access = new MapAccess
            {
                UserId = userId,
                MapId = invite.MapId,
                PermissionLevel = invite.Permissions
            };

            _db.MapAccesses.Add(access);
            invite.Status = InviteStatus.Accepted;
            await _db.SaveChangesAsync();*/
        }
    }
}
