using Autofac;
using Autofac.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MindHub.Common;
using MindHub.DAL.Repositories;
using Module = Autofac.Module;
using MindHub.DAL;
using MindHub.Services.Users;

namespace MindHub.DAL
{
    public sealed class DalModule : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            builder.RegisterAssemblyTypes(ThisAssembly)
                .Where(c => c.IsClass)
                .InstancePerLifetimeScope()
                .AsImplementedInterfaces();

            builder
                .RegisterGeneric(typeof(RepositoryBase<>))
                .As(typeof(IRepository<>))
                .InstancePerLifetimeScope();

            builder
                .RegisterType<UserContextProviderCommon>()
                .As<IUserContextProvider>();

            var services = new ServiceCollection();

            builder.Populate(services);

            base.Load(builder);
        }

        internal Autofac.IContainer ToContainer()
        {
            var builder = new ContainerBuilder();
            builder.RegisterModule(this);
            builder.RegisterModule<DalConfigModule>();
            return builder.Build();
        }
    }

    public sealed class DalConfigModule : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            var services = new ServiceCollection();

            var cfg = new ConfigurationBuilder()
                .AddJsonFile("migrationSettings.json", true, true)
                .Build();

            var dbSettings = cfg.GetSection("DatabaseSettings");

            services.Configure<DatabaseSettings>(options => dbSettings.Bind(options));

            var jwtoptions = cfg.GetSection("JwtOptions");

            services.Configure<JwtOptions>(options => jwtoptions.Bind(options));

            builder.Populate(services);

            base.Load(builder);
        }
    }
}
