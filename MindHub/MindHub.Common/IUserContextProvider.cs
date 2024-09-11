using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MindHub.Common
{
    public interface IUserContextProvider
    {
        UserContext Get();
        void Set(UserContext context);
    }
}
