using Microsoft.EntityFrameworkCore;
using MindHub.Domain.Interfaces;
using Newtonsoft.Json.Linq;

namespace MindHub.DAL.Repositories
{
    public interface IRepository<TEntity> where TEntity : class, IEntityBase
    {
        DbContext Context { get; }
        Task<TEntity> FetchAsync(int id);
        IQueryable<TEntity> GetQueryWithDeleted();
        IQueryable<TEntity> GetQuery();
        Task AddOrUpdateAsync(TEntity entity);
        Task CreateAsync(TEntity entity);
        Task UpdateAsync(TEntity entity);
        Task PatchAsync(JObject patch);
        Task DeleteAsync(int id);
        Task DeleteAsync(TEntity entity);
        Task RestoreAsync(int id);
    }
}
