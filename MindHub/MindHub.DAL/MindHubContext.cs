using Microsoft.EntityFrameworkCore;
using MindHub.Domain.Interfaces;
using System.Reflection;

namespace MindHub.DAL
{
    public class MindHubContext : DbContext
    {
        public MindHubContext(DbContextOptions options) : base(options)
        {
        }

        protected MindHubContext()
        {
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
            => optionsBuilder.LogTo(Console.WriteLine);

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            foreach (var relationship in modelBuilder.Model.GetEntityTypes()
                                                        .SelectMany(e => e.GetForeignKeys()))
            {
                relationship.DeleteBehavior = DeleteBehavior.Restrict;
            }

            modelBuilder.ApplyBaseEntityConfiguration();

        }
    }

    public static class BaseEntityConfiguration
    {
        public static void Configure<TEntity>(ModelBuilder modelBuilder)
            where TEntity : class
        {
            modelBuilder.Entity<TEntity>().HasIndex(nameof(IEntityBase.RecordCreateDate));
            modelBuilder.Entity<TEntity>().HasIndex(nameof(IEntityBase.RecordUpdateDate));
            modelBuilder.Entity<TEntity>().HasIndex(nameof(IEntityBase.RecordStatus));
        }

        public static ModelBuilder ApplyBaseEntityConfiguration(this ModelBuilder modelBuilder)
        {
            var method = typeof(BaseEntityConfiguration).GetTypeInfo().DeclaredMethods
                .Single(m => m.Name == nameof(Configure));

            var entityTypes = modelBuilder.Model.GetEntityTypes()
                .Where(e => typeof(IEntityBase).IsAssignableFrom(e.ClrType)).ToList();

            foreach (var entityType in entityTypes)
            {
                method.MakeGenericMethod(entityType.ClrType).Invoke(null, new[] { modelBuilder });
            }
            return modelBuilder;
        }

    }
}
