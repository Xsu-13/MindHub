using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MindHub.DAL
{
    public interface IDbContextProvider
    {
        DbContext Current { get; }

        Task SeedAsync();
    }
}
