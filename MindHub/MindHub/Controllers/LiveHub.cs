using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace MindHub.API.Controllers
{
    public class LiveHub : Hub
    {
        private static readonly ConcurrentDictionary<string, string> _lockedNodes = new();
        private static readonly ConcurrentDictionary<string, string> _userGroups = new();

        public async Task RequestNodeLock(string nodeId)
        {
            if (_lockedNodes.TryGetValue(nodeId, out var currentLockOwner))
            {
                if(currentLockOwner != Context.ConnectionId)
                {
                    await Clients.Caller.SendAsync("ReceiveLockStatus", nodeId, true, currentLockOwner);
                    return;
                }
            }

            _lockedNodes[nodeId] = Context.ConnectionId;

            await Clients.Others.SendAsync("ReceiveLockStatus", nodeId, true, Context.ConnectionId);

            await Clients.Caller.SendAsync("ReceiveLockStatus", nodeId, false, Context.ConnectionId);
        }
        public async Task ReleaseNodeLock(string nodeId)
        {
            if (_lockedNodes.TryGetValue(nodeId, out var lockOwner) &&
                lockOwner == Context.ConnectionId)
            {
                _lockedNodes.TryRemove(nodeId, out _);
                await Clients.All.SendAsync("ReceiveLockStatus", nodeId, false, null);
            }
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userLocks = _lockedNodes.Where(x => x.Value == Context.ConnectionId).ToList();
            foreach (var lockEntry in userLocks)
            {
                _lockedNodes.TryRemove(lockEntry.Key, out _);
                await Clients.All.SendAsync("ReceiveLockStatus", lockEntry.Key, false, null);
            }
            if (_userGroups.TryRemove(Context.ConnectionId, out var mapId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, mapId);
            }

            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendMousePosition(string connectionId, int x, int y)
        {
            await Clients.Others.SendAsync("ReceiveMousePosition", connectionId, x, y);
        }

        
        // Обновление позиции нода для группы пользователей
        public async Task SubscribeToMap(string mapId)
        {
            _userGroups[Context.ConnectionId] = mapId;
            await Groups.AddToGroupAsync(Context.ConnectionId, mapId);
        }

        public async Task UpdateNodePosition(string mapId, string nodeId, double x, double y)
        {
            // Здесь можно добавить валидацию и сохранение в БД
            //await Clients.OthersInGroup(mapId).SendAsync("ReceiveNodePosition", nodeId, x, y);
            await Clients.Others.SendAsync("ReceiveNodePosition", nodeId, x, y);
        }
    }
}
