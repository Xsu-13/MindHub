using MindHub.Services.BaseServices;
using MindHub.Services.Nodes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MindHub.Services.Maps
{
    public interface IMapService : IService<MapDto>
    {
        Task<List<MapDto>> GetByUserId(int userId);
    }
}
