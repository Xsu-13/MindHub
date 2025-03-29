using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace MindHub.API.Controllers
{
    public class LiveHub : Hub
    {
        private static readonly ConcurrentDictionary<string, string> _lockedNodes = new();

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

            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendMousePosition(string connectionId, int x, int y)
        {
            await Clients.Others.SendAsync("ReceiveMousePosition", connectionId, x, y);
        }
    }
}
