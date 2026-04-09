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

                var mapNodes = await GetQueryCore()
                    .Where(x => x.MapId == node.MapId)
                    .ToListAsync();

                var childrenByParent = mapNodes
                    .Where(x => x.ParentNodeId.HasValue)
                    .GroupBy(x => x.ParentNodeId!.Value)
                    .ToDictionary(g => g.Key, g => g.Select(n => n.Id).ToList());

                var idsToDelete = new List<int> { id };
                var stack = new Stack<int>();
                stack.Push(id);

                while (stack.Count > 0)
                {
                    var currentId = stack.Pop();
                    if (!childrenByParent.TryGetValue(currentId, out var children))
                    {
                        continue;
                    }

                    foreach (var childId in children)
                    {
                        if (!idsToDelete.Contains(childId))
                        {
                            idsToDelete.Add(childId);
                            stack.Push(childId);
                        }
                    }
                }

                foreach (var nodeToDelete in mapNodes.Where(n => idsToDelete.Contains(n.Id)))
                {
                    var version = new NodeVersion
                    {
                        NodeId = nodeToDelete.Id.ToString(),
                        MapId = nodeToDelete.MapId.ToString(),
                        Data = System.Text.Json.JsonSerializer.Serialize(nodeToDelete),
                        ChangedBy = userId.ToString(),
                        ChangedAt = DateTime.UtcNow,
                        Action = "DELETE"
                    };
                    await _versionService.CreateAsync(version);
                }

                foreach (var deleteId in idsToDelete)
                {
                    await _repository.DeleteAsync(deleteId);
                }
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
