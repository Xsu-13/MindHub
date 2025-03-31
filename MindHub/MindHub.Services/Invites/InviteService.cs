using AutoMapper;
using MindHub.DAL;
using MindHub.DAL.Repositories;
using MindHub.Domain;
using MindHub.Services.BaseServices;
using MindHub.Services.Maps;
using System;
using System.Collections.Generic;
using System.Linq;
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

        public void CreateInvite(InviteDto invite)
        {
            
        }
    }
}
