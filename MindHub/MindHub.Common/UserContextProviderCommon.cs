using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MindHub.Common
{
    public class UserContextProviderCommon : IUserContextProvider
    {
        private UserContext _userContext = new UserContext();

        public UserContext Get()
        {
            return _userContext;
        }

        public void Set(UserContext context)
        {
            _userContext = context;
        }
    }
}
