using MindHub.DAL;
using MindHub.Services.Nodes;
using MindHub.Services.Users;

namespace MindHub.Services.Maps
{
    public class MapDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Title { get; set; }
        public List<NodeDto> Nodes { get; set; }
    }
}
