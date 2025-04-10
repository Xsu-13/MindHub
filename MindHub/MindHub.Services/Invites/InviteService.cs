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
        protected override IQueryable<Invite> GetQueryCore()
        {
            return base.GetQueryCore()
                .Include(f => f.Map);
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

        public async Task<int?> AcceptInvite(string token)
        {
            var invite = await GetQueryCore()
                .FirstOrDefaultAsync(i => i.Token == token);

            if (invite == null || invite.ExpiresAt < DateTime.UtcNow)
                return null;
            else
                return invite.MapId;
           
        }
    }
}
