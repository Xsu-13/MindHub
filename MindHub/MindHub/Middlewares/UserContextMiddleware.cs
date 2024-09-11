using MindHub.Common;
using MindHub.DAL.Repositories;
using MindHub.DAL;
using MindHub.API.Extensions;

namespace MindHub.API.Middlewares
{
    public class UserContextMiddleware
    {
        private readonly RequestDelegate _next;

        public UserContextMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext httpContext, IRepository<User> userRepository, IUserContextProvider userContextProvider)
        {
            var userContext = httpContext.User.ToUserContext() ?? new UserContext();

            userContextProvider.Set(userContext);

            await _next(httpContext);
        }
    }

    public static class UserContextMiddlewareExtensions
    {
        public static IApplicationBuilder UseUserContext(
            this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<UserContextMiddleware>();
        }
    }
}
