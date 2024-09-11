using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using SmartDocs.DAL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MindHub.DAL
{
    public class DbContextProvider : IDbContextProvider
    {

        public DbContextProvider(IOptions<DatabaseSettings> configuration)
        {
            var options = new DbContextOptionsBuilder<MindHubContext>();
            options.UseNpgsql(configuration.Value.ConnectionString);
            Current = new MindHubContext(options.Options);
        }

        public DbContext Current { get; }

        public Task SeedAsync()
        {
            return Task.CompletedTask;
        }
    }
}
