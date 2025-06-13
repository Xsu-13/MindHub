using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MindHub.DAL;
using MindHub.DAL.Repositories;
using MindHub.Domain;
using MindHub.Services.BaseServices;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Text.Json.Serialization;

namespace MindHub.Services.Nodes
{
    public class NodeService : ServiceBase<Node, NodeDto>, INodeService
    {
        IRepository<NodeVersion> _versionService;
        ILogger<NodeService> _logger;
        public NodeService(
            IRepository<Node> repository,
            IRepository<NodeVersion> versionService,
            ILogger<NodeService> logger,
            IMapper mapper
            ) : base(repository, mapper)
        {
            _logger = logger;
            _versionService = versionService;
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

        public async Task PatchNodeAsync(int id, JObject field, int userId)
        {
            using var transaction = await _repository.Context.Database.BeginTransactionAsync();

            try
            {
                var node = await GetQueryCore()
                    .FirstOrDefaultAsync(x => x.Id == id);

                if (node == null) throw new Exception("Node not found");

                var oldVersion = new NodeVersion
                {
                    NodeId = id.ToString(),
                    MapId = node.MapId.ToString(),
                    Data = System.Text.Json.JsonSerializer.Serialize(node),
                    ChangedBy = userId.ToString(),
                    ChangedAt = DateTime.UtcNow,
                    Action = "UPDATE_BEFORE"
                };
                await _versionService.CreateAsync(oldVersion);
                var patchResult = await PatchAsync(id, field);

                var newVersion = new NodeVersion
                {
                    NodeId = id.ToString(),
                    MapId = node.MapId.ToString(),
                    Data = field.ToString(Formatting.None),
                    ChangedBy = userId.ToString(),
                    ChangedAt = DateTime.UtcNow,
                    Action = "UPDATE_AFTER"
                };
                
                await _versionService.CreateAsync(newVersion);
                await _repository.Context.SaveChangesAsync();

                await transaction.CommitAsync();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error updating node {NodeId}", id);
                throw;
            }
        }

        public async Task<NodeDto> CreateNodeAsync(NodeDto createDto, int userId)
        {
            using var transaction = await _repository.Context.Database.BeginTransactionAsync();

            try
            {
                var node = _mapper.Map<Node>(createDto);
                await _repository.CreateAsync(node);
                await _repository.Context.SaveChangesAsync();

                var version = new NodeVersion
                {
                    NodeId = node.Id.ToString(),
                    MapId = node.MapId.ToString(),
                    Data = System.Text.Json.JsonSerializer.Serialize(node),
                    ChangedBy = userId.ToString(),
                    ChangedAt = DateTime.UtcNow,
                    Action = "CREATE"
                };
                await _versionService.CreateAsync(version);
                await _repository.Context.SaveChangesAsync();

                await transaction.CommitAsync();
                return _mapper.Map<NodeDto>(node);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error creating node");
                throw;
            }
        }

        public async Task DeleteNodeAsync(int id, int userId)
        {
            using var transaction = await _repository.Context.Database.BeginTransactionAsync();

            try
            {
                var node = await FetchAsync(id);
                if (node == null) throw new Exception("Node not found");

                var version = new NodeVersion
                {
                    NodeId = id.ToString(),
                    MapId = node.MapId.ToString(),
                    Data = System.Text.Json.JsonSerializer.Serialize(node),
                    ChangedBy = userId.ToString(),
                    ChangedAt = DateTime.UtcNow,
                    Action = "DELETE"
                };
                await _versionService.CreateAsync(version);

                await _repository.DeleteAsync(id);
                await _repository.Context.SaveChangesAsync();

                await transaction.CommitAsync();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error deleting node {NodeId}", id);
                throw;
            }
        }
    }
}
