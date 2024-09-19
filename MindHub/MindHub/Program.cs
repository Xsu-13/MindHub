using Autofac;
using Autofac.Extensions.DependencyInjection;
using MindHub.API.Middlewares;
using MindHub.DAL;
using MindHub.Services;
using MindHub.DAL;
using MindHub.Services.Users;

var builder = WebApplication.CreateBuilder(args);
var services = builder.Services;

services.Configure<DatabaseSettings>(options => builder.Configuration.GetSection("DatabaseSettings").Bind(options));
services.Configure<JwtOptions>(options => builder.Configuration.GetSection("JwtOptions").Bind(options));

builder.Host
                .UseServiceProviderFactory(new AutofacServiceProviderFactory())
                .ConfigureContainer<ContainerBuilder>(c =>
                {
                    c.RegisterModule<DalModule>(); // dal first
                    c.RegisterModule<ServiceModule>(); //services after 
                });

services.AddControllers().AddNewtonsoftJson(options =>
{
    options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
});

services.AddEndpointsApiExplorer();
services.AddSwaggerGen();

services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173");
        policy.AllowAnyHeader();
        policy.AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseUserContext();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
