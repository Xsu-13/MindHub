using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MindHub.Services.BaseServices
{
    public interface IService<TDto> where TDto : class, new()
    {
        Task<List<int>> GetIdsAsync();
        Task<int> CountAsync();
        Task<List<TDto>> GetListAsync();
        Task<List<TCustomDto>> GetListAsync<TCustomDto>() where TCustomDto : class, new();
        Task<TDto> FetchAsync(int id);
        Task<int> AddOrUpdateAsync(TDto dto);
        Task<TDto> CreateAsync(TDto dto);
        Task UpdateAsync(TDto dto);
        Task<TDto> PatchAsync(int id, JObject entity);
        Task DeleteAsync(int id);
        Task DeleteAsync(TDto dto);
        Task RestoreAsync(int fileId);
        Task DisableAsync(int id);
        Task EnableAsync(int id);
    }
}
