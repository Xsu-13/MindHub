using AutoMapper;
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
        private readonly IRepository<Node> _repository;
        private readonly IService<Node> _service;

        public NodeService(
            IRepository<Node> repository,
            IMapper mapper
            ) : base(repository, mapper)
        {
            _repository = repository;
        }
        public async Task<List<NodeDto>> GetByMapId(int mapId)
        {
            var nodes = _repository.GetQuery()
                .Where(x => x.MapId == mapId)
                .ToList();

            return _mapper.Map<List<NodeDto>>(nodes);
        }
    }
}
