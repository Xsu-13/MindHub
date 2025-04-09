using MindHub.Services.BaseServices;
using MindHub.Services.Maps;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MindHub.Services.Invites
{
    public interface IInviteService : IService<InviteDto>
    {
        Task<InviteDto> CreateInvite(int mapId, int userId);
        Task<MapDto?> AcceptInvite(string token);
    }
}
