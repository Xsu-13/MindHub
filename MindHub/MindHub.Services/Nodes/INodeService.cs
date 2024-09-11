using MindHub.Services.BaseServices;

namespace MindHub.Services.Nodes
{
    public interface INodeService : IService<NodeDto>
    {
        Task<List<NodeDto>> GetByMapId(int mapId);
    }
}