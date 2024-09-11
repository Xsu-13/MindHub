using AutoMapper;
using MindHub.DAL;
using MindHub.DAL.Repositories;
using MindHub.Services.BaseServices;
using MindHub.Services.Nodes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MindHub.Services.Maps
{
    public class MapService : ServiceBase<Map, MapDto>, IMapService
    {
        public MapService(
            IRepository<Map> repository,
            IMapper mapper
            ) : base(repository, mapper)
        {
        }

        public async Task<List<MapDto>> GetByUserId(int userId)
        {
            var maps = _repository.GetQuery()
                .Where(x => x.UserId == userId)
                .ToList();

            return _mapper.Map<List<MapDto>>(maps);
        }
    }
}
