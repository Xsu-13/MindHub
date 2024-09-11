using MindHub.Common;
using System.Security.Claims;

namespace MindHub.API.Extensions
{
    public static class ClaimsPrincipalExtension
    {
        public static UserContext? ToUserContext(this ClaimsPrincipal user)
        {
            var userContext = new UserContext();

            var claimIdentity = user.Identity as ClaimsIdentity;
            if (claimIdentity == null)
            {
                return null;
            }

            var idClaim = claimIdentity?.FindFirst(ClaimTypes.NameIdentifier);
            var roleClaims = claimIdentity?.FindAll(ClaimTypes.Role).ToList();


            if (idClaim != null)
                userContext.UserId = Math.Abs(int.Parse(idClaim.Value));

            return userContext;

        }
    }
}
