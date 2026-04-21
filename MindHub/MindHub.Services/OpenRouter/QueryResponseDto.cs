using MindHub.Services.Nodes;
using System.Collections.Generic;

namespace MindHub.Services.OpenRouter
{
    public class QueryResponseDto
    {
        public bool Success { get; set; }
        public string? ErrorMessage { get; set; }
        public List<NodeDto>? Response { get; set; }
        public string? Model { get; set; }
        public bool RequiresClarification { get; set; }
        public string? ClarificationQuestion { get; set; }
        public string? RecoveryMessage { get; set; }
    }
}
