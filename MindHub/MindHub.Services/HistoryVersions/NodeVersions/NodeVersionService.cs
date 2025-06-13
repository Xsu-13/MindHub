using AutoMapper;
using MindHub.DAL;
using MindHub.DAL.Repositories;
using MindHub.Domain;
using MindHub.Services.BaseServices;
using MindHub.Services.HistoryVersions.NodeVersions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MindHub.Services.HistoryVersions.NodeVersions
{
    public class NodeVersionService : ServiceBase<NodeVersion, NodeVersionDto>, INodeVersionService
    {
        public NodeVersionService(
            IRepository<NodeVersion> repository,
            IMapper mapper
            ) : base(repository, mapper)
        {
        }
    }
}
