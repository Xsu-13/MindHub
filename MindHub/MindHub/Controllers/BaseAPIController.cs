using Microsoft.AspNetCore.Mvc;
using MindHub.Common;

namespace MindHub.API.Controllers
{
    [ApiController]
    public class BaseAPIController : ControllerBase
    {
        protected readonly UserContext UserContext;

        public BaseAPIController(IUserContextProvider userContextProvider)
        {
            UserContext = userContextProvider.Get();
        }
    }
}
