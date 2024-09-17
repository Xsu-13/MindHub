using Autofac;
using Autofac.Extensions.DependencyInjection;
using MindHub.API.Middlewares;
using MindHub.DAL;
using MindHub.Services;
using SmartDocs.DAL;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.Configure<DatabaseSettings>(options => builder.Configuration.GetSection("DatabaseSettings").Bind(options));

builder.Host
                .UseServiceProviderFactory(new AutofacServiceProviderFactory())
                .ConfigureContainer<ContainerBuilder>(c =>
                {
                    c.RegisterModule<DalModule>(); // dal first
                    c.RegisterModule<ServiceModule>(); //services after 
                });

builder.Services.AddControllers().AddNewtonsoftJson(options =>
{
    options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseUserContext();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
