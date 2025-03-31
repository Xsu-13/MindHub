using Microsoft.AspNetCore.Mvc;
using MindHub.Common;

namespace MindHub.API.Controllers
{
    [Route("~/api/invites")]
    public class InvitesController : BaseAPIController
    {
        public InvitesController(IUserContextProvider userContextProvider) 
            : base(userContextProvider)
        {

        }
    }
}
