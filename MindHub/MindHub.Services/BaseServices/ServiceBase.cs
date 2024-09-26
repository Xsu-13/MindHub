using AutoMapper;
using Microsoft.EntityFrameworkCore;
using MindHub.Common.Enums;
using MindHub.DAL.Repositories;
using MindHub.Domain.Interfaces;
using Newtonsoft.Json.Linq;

namespace MindHub.Services.BaseServices
{
    public class ServiceBase<TEntity, TDto>
        : IService<TDto>
        where TEntity : class, IEntityBase, new()
        where TDto : class, new()
    {
        protected readonly IRepository<TEntity> _repository;
        protected readonly IMapper _mapper;

        public ServiceBase(
            IRepository<TEntity> repository,
            IMapper mapper
            )
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<TDto> FetchAsync(int id)
        {
            var entity = await GetQueryCore().AsNoTracking().Where(w => w.Id == id).SingleOrDefaultAsync();

            if (entity == null)
                throw new ApplicationException($"{typeof(TEntity).Name} was not found");

            return _mapper.Map<TDto>(entity);
        }

        protected virtual IQueryable<TEntity> GetQueryCore()
        {
            return _repository.GetQuery();
        }

        public virtual async Task<int> CountAsync()
        {
            return await GetQueryCore().CountAsync();
        }

        public async Task<List<int>> GetIdsAsync()
        {
            return await GetQueryCore().Select(s => s.Id).ToListAsync();
        }

        public virtual async Task<List<TCustomDto>> GetListAsync<TCustomDto>() where TCustomDto : class, new()
        {
            var entities = await GetQueryCore().ToListAsync();
            var list = entities.Select(_mapper.Map<TCustomDto>).ToList();
            return await PostProcessDtoList(list);
        }

        public virtual async Task<List<TDto>> GetListAsync()
        {
            var entities = await GetQueryCore().ToListAsync();
            var list = entities.Select(_mapper.Map<TDto>).ToList();
            return await PostProcessDtoList(list);
        }

        protected virtual async Task<List<TCustomDto>> PostProcessDtoList<TCustomDto>(List<TCustomDto> dtoList)
            where TCustomDto : class
        {
            return dtoList;
        }

        public virtual async Task<int> AddOrUpdateAsync(TDto dto)
        {
            var entity = _mapper.Map<TEntity>(dto);

            await _repository.AddOrUpdateAsync(entity);
            await _repository.Context.SaveChangesAsync();
            return entity.Id;
        }

        public virtual async Task<TDto> CreateAsync(TDto dto)
        {
            var entity = _mapper.Map<TEntity>(dto);
            entity.Id = 0;
            await _repository.CreateAsync(entity);
            await _repository.Context.SaveChangesAsync();

            return await FetchAsync(entity.Id);
        }

        public virtual async Task UpdateAsync(TDto dto)
        {
            var entity = _mapper.Map<TEntity>(dto);

            await _repository.UpdateAsync(entity);
            await _repository.Context.SaveChangesAsync();
        }

        public virtual async Task<TDto> PatchAsync(int id, JObject patch)
        {
            patch.Add(nameof(IEntityBase.Id), id);

            await _repository.PatchAsync(patch);
            await _repository.Context.SaveChangesAsync();

            var entity = await FetchAsync(id);
            return entity;
        }

        public virtual async Task DeleteAsync(int id)
        {
            await _repository.DeleteAsync(id);
            await _repository.Context.SaveChangesAsync();
        }

        public virtual async Task DeleteAsync(TDto dto)
        {
            var entity = _mapper.Map<TEntity>(dto);

            await _repository.DeleteAsync(entity);
            await _repository.Context.SaveChangesAsync();
        }

        public async Task RestoreAsync(int id)
        {
            await _repository.RestoreAsync(id);
            await _repository.Context.SaveChangesAsync();
        }

        public async Task DisableAsync(int id)
        {
            var entity = await _repository.FetchAsync(id);
            entity.RecordStatus = RecordStatus.Deleted;
            await _repository.UpdateAsync(entity);
            await _repository.Context.SaveChangesAsync();
        }

        public async Task EnableAsync(int id)
        {
            var entity = await _repository.FetchAsync(id);
            entity.RecordStatus = RecordStatus.Active;
            await _repository.UpdateAsync(entity);
            await _repository.Context.SaveChangesAsync();
        }
    }
}
