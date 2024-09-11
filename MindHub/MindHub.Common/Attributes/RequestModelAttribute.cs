using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MindHub.Common.Attributes
{
    [AttributeUsage(AttributeTargets.Method, AllowMultiple = false)]
    public class RequestModelAttribute : Attribute
    {
        public Type RequestModel { get; private set; }

        public RequestModelAttribute(Type requestModel)
        {
            RequestModel = requestModel;
        }
    }
}
