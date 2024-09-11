using Autofac;
using Microsoft.EntityFrameworkCore.Design;
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
    public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<MindHubContext>
    {
        public MindHubContext CreateDbContext(string[] args)
        {
            using (var container = new DalModule().ToContainer())
            {
                var builder = new DbContextOptionsBuilder<MindHubContext>();
                var dbSettings = container.Resolve<IOptions<DatabaseSettings>>().Value;
                builder.UseNpgsql(dbSettings.ConnectionString);

                return new MindHubContext(builder.Options);
            }
        }
    }
}
