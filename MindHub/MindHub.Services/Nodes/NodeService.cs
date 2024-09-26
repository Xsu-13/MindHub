using AutoMapper;
using Microsoft.EntityFrameworkCore;
using MindHub.DAL;
using MindHub.DAL.Repositories;
using MindHub.Services.BaseServices;
using MindHub.Services.Maps;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MindHub.Services.Nodes
{
    public class NodeService : ServiceBase<Node, NodeDto>, INodeService
    {
        public NodeService(
            IRepository<Node> repository,
            IMapper mapper
            ) : base(repository, mapper)
        {
        }
        protected override IQueryable<Node> GetQueryCore()
        {
            return base.GetQueryCore()
                .Include(f => f.Style);
        }
        public async Task<List<NodeDto>> GetByMapId(int mapId)
        {
            var nodes = _repository.GetQuery()
                .Include(f => f.Style)
                .Where(x => x.MapId == mapId)
                .ToList();

            return _mapper.Map<List<NodeDto>>(nodes);
        }
    }
}
