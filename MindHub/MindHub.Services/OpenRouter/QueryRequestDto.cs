using MindHub.Services.Nodes;
using System.Collections.Generic;

namespace MindHub.Services.OpenRouter
{
    public class QueryRequestDto
    {
        public string Query { get; set; } = string.Empty;
        public string? Model { get; set; }
        public double? Temperature { get; set; }
        public int? MaxTokens { get; set; }
        public List<NodeDto>? context { get; set; }
    }
}
