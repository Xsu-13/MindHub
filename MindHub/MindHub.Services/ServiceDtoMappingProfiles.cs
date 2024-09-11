using AutoMapper;
using MindHub.DAL;
using MindHub.Services.Maps;
using MindHub.Services.Nodes;
using MindHub.Services.Styles;
using MindHub.Services.Users;

namespace MindHub.Services
{
    public class ServiceDtoMappingProfiles : Profile
    {
        public ServiceDtoMappingProfiles()
        {
            CreateMap<Node, NodeDto>();
            CreateMap<NodeDto, Node>();
            CreateMap<Map, MapDto>();
            CreateMap<MapDto, Map>();
            CreateMap<Style, StyleDto>();
            CreateMap<StyleDto, Style>();
            CreateMap<User, UserDto>();
            CreateMap<UserDto, User>();
        }
    }
}
