using MindHub.Services.BaseServices;
using Newtonsoft.Json.Linq;

namespace MindHub.Services.Nodes
{
    public interface INodeService : IService<NodeDto>
    {
        Task<NodeDto> CreateNodeAsync(NodeDto createDto, int userId);
        Task DeleteNodeAsync(int id, int userId);
        Task<List<NodeDto>> GetByMapId(int mapId);
        Task PatchNodeAsync(int id, JObject field, int userId);
    }
}