using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MindHub.Services.Users
{
    public class JwtOptions
    {
        public string SecretKey { get; set; } = String.Empty;

        public int ExpiresHours { get; set; }
    }
}
