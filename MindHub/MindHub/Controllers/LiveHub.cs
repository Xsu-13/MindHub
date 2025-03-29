using Microsoft.AspNetCore.SignalR;

namespace MindHub.API.Controllers
{
    public class LiveHub : Hub
    {
        public async Task SendMousePosition(string connectionId, int x, int y)
        {
            await Clients.Others.SendAsync("ReceiveMousePosition", connectionId, x, y);
        }
    }
}
