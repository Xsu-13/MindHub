using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore;
using MindHub.Common.Enums;
using MindHub.Common;
using MindHub.Domain.Interfaces;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MindHub.DAL.Repositories
{
    public class RepositoryBase<TEntity> : IRepository<TEntity> where TEntity : class, IEntityBase
    {
        private readonly MindHubContext _context;
        private readonly IUserContextProvider _userContextProvider;

        public RepositoryBase(
            IDbContextProvider dbContextProvider,
            IUserContextProvider userContextProvider
        )
        {
            _userContextProvider = userContextProvider;
            _context = dbContextProvider.Current as MindHubContext;
        }

        public DbContext Context => _context;

        public async Task<TEntity> FetchAsync(int id)
        {
            var entity = await _context.Set<TEntity>().FindAsync(id);
            return entity;
        }

        public virtual IQueryable<TEntity> GetQueryWithDeleted()
        {
            return _context.Set<TEntity>().AsQueryable();
        }

        public virtual IQueryable<TEntity> GetQuery()
        {
            return _context.Set<TEntity>().AsQueryable().Where(x => x.RecordStatus != RecordStatus.Deleted);
        }

        public async Task AddOrUpdateAsync(TEntity entity)
        {
            if (entity.Id == default)
                await CreateAsync(entity);
            else
                await UpdateAsync(entity);
        }

        public virtual async Task CreateAsync(TEntity entity)
        {
            entity.RecordStatus = RecordStatus.Active;
            entity.RecordCreateDate = DateTime.UtcNow;
            entity.RecordUpdateDate = null;
            await _context.Set<TEntity>().AddAsync(entity);
        }

        public virtual async Task UpdateAsync(TEntity entity)
        {
            entity.RecordUpdateDate = DateTime.UtcNow;
            _context.Set<TEntity>().Update(entity);
        }

        public virtual async Task DeleteAsync(int id)
        {
            var entityToRemove = await FetchAsync(id);
            if (entityToRemove == null)
                throw new ApplicationException($"ID {id} is not found");

            entityToRemove.RecordStatus = RecordStatus.Deleted;
            entityToRemove.RecordUpdateDate = DateTime.UtcNow;
        }

        public async Task DeleteAsync(TEntity entity)
        {
            entity.RecordStatus = RecordStatus.Deleted;
            entity.RecordUpdateDate = DateTime.UtcNow;
        }

        public async Task RestoreAsync(int id)
        {
            var entityToRemove = await FetchAsync(id);
            if (entityToRemove == null)
                throw new ApplicationException($"ID {id} is not found");

            entityToRemove.RecordStatus = RecordStatus.Active;
        }

        public virtual async Task PatchAsync(JObject patch)
        {
            var entity = await PatchAsyncGeneric<TEntity>(patch);
            entity.RecordUpdateDate = DateTime.UtcNow;
        }

        private async Task<T> PatchAsyncGeneric<T>(JObject patch) where T : class, IEntityBase
        {
            var entity = patch.ToObject<T>();

            if (entity == null ||
                entity.Id == default)
                throw new ApplicationException("patch document is invalid");

            var dbSet = _context.Set<T>();
            EntityEntry<T> entry;

            if (dbSet.Any(a => a.Id == entity.Id))
            {
                entity = await dbSet.FindAsync(entity.Id);
                entry = _context.Entry(entity ??
                                       throw new ApplicationException($"entity with {entity.Id} was not found"));
            }
            else
                entry = dbSet.Attach(entity);

            foreach (var patchProp in patch.Properties()
                         .Where(w => !w.Name.Equals(nameof(IEntityBase.Id), StringComparison.OrdinalIgnoreCase)))
            {
                var entryProp = entry.Properties.SingleOrDefault(s =>
                    s.Metadata.Name.Equals(patchProp.Name, StringComparison.OrdinalIgnoreCase));

                if (entryProp != null)
                {
                    entryProp.IsModified = true;
                    entryProp.CurrentValue = patchProp.Value.ToObject<object>() == null
                        ? null
                        : patchProp.Value.ToObject(entryProp.Metadata.PropertyInfo.PropertyType);
                }
                else
                {
                    var method = typeof(RepositoryBase<T>).GetMethod(nameof(PatchAsyncGeneric));
                    var prop = typeof(T).GetProperties().FirstOrDefault(f => f.Name == patchProp.Name);
                    if (method == null || prop == null) continue;
                    if (patchProp.Value.Type == JTokenType.Array)
                    {
                        var type = prop.PropertyType.GenericTypeArguments.FirstOrDefault();

                        if (type == null) continue;
                        foreach (var value in patchProp.Value)
                        {
                            var nestedPatch = value.ToObject<JObject>();
                            var nestedEntity = nestedPatch?.ToObject<T>();
                            if (nestedEntity == null || nestedEntity.Id == default) continue;
                            var generic = method.MakeGenericMethod(type);
                            generic.Invoke(this, new object[] { nestedPatch });
                        }
                    }
                    else
                    {
                        var nestedPatch = patchProp.Value.ToObject<JObject>();
                        var nestedEntity = nestedPatch?.ToObject<T>();
                        if (nestedEntity == null || nestedEntity.Id == default) continue;
                        var generic = method.MakeGenericMethod(prop.PropertyType);
                        generic.Invoke(this, new object[] { nestedPatch });
                    }
                }
            }

            return entity;
        }
    }
}
