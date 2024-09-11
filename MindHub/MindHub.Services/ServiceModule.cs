using Autofac;
using AutoMapper;
using MindHub.Common;
using MindHub.Services.BaseServices;
using Module = Autofac.Module;

namespace MindHub.Services
{
    public class ServiceModule : Module
    {
        protected override void Load(ContainerBuilder builder)
        {

            builder
               .RegisterGeneric(typeof(ServiceBase<,>))
               .As(typeof(IService<>))
               .InstancePerLifetimeScope();

            builder.RegisterAssemblyTypes(ThisAssembly)
                    .Where(c => c.IsClass)
                     .AsImplementedInterfaces()
                    .InstancePerLifetimeScope();

            builder
               .RegisterType<UserContextProviderCommon>()
               .As<IUserContextProvider>()
               .InstancePerLifetimeScope();

            builder.Register(context => new MapperConfiguration(cfg =>
            {
                cfg.AddProfile(new ServiceDtoMappingProfiles());
            }))
                 .AsSelf()
                 .As<IConfigurationProvider>()
                 .SingleInstance();

            builder.Register(r =>
            {
                var context = r.Resolve<IComponentContext>();
                var config = context.Resolve<MapperConfiguration>();
                return config.CreateMapper(context.Resolve);
            })
                .As<IMapper>()
                .SingleInstance();

            base.Load(builder);
        }
    }
}
