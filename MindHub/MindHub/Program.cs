using Autofac;
using Autofac.Extensions.DependencyInjection;
using MindHub.API.Middlewares;
using MindHub.DAL;
using MindHub.Services;
using MindHub.Services.Users;
using MindHub.Services.OpenRouter;
using MindHub.API.Controllers;
using MindHub.Services.LocalLLM;

var builder = WebApplication.CreateBuilder(args);
var services = builder.Services;

services.Configure<DatabaseSettings>(options => builder.Configuration.GetSection("DatabaseSettings").Bind(options));
services.Configure<JwtOptions>(options => builder.Configuration.GetSection("JwtOptions").Bind(options));
services.Configure<OpenRouterSettings>(options => builder.Configuration.GetSection("OpenRouterSettings").Bind(options));
builder.Services.Configure<LocalLLMSettings>(builder.Configuration.GetSection("LocalLLM"));
builder.Services.Configure<MindHub.Services.LocalLLM.LLMProviderSettings>(builder.Configuration.GetSection("LLMProvider"));



builder.Host
                .UseServiceProviderFactory(new AutofacServiceProviderFactory())
                .ConfigureContainer<ContainerBuilder>(c =>
                {
                    c.RegisterModule<DalModule>(); // dal first
                    c.RegisterModule<ServiceModule>(); //services after 
                });

builder.Services.AddHttpClient<OllamaService>(); // Для Ollama

// Регистрируем все реализации
builder.Services.AddScoped<OpenRouterService>();
builder.Services.AddScoped<LocalLLMAdapter>();
builder.Services.AddScoped<ILocalLLMService, OllamaService>();

// Фабрика для выбора провайдера
builder.Services.AddScoped<ILLMProviderFactory, LLMProviderFactory>();

builder.Services.AddScoped<IOpenRouterService>(sp =>
{
    var factory = sp.GetRequiredService<ILLMProviderFactory>();
    throw new InvalidOperationException("Используйте ILLMProviderFactory напрямую");
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
        policy.AllowCredentials();
    });
});

services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
});

services.AddScoped<IOpenRouterService, OpenRouterService>();

var app = builder.Build();

app.UseUserContext();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
    
app.UseHttpsRedirection();

app.UseAuthorization();
app.MapHub<LiveHub>("/liveHub");

app.MapControllers();


app.Run();
