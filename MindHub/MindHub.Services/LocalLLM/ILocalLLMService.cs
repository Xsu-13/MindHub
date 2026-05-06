using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MindHub.Services.LocalLLM
{
    public interface ILocalLLMService
    {
        Task<string> GenerateResponseAsync(string prompt, CancellationToken cancellationToken = default);
        Task<List<string>> GetAvailableModelsAsync();
    }
}
