using AutoMapper;
using MindHub.DAL;
using MindHub.DAL.Repositories;
using MindHub.Services.BaseServices;
using MindHub.Services.Nodes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MindHub.Services.Styles
{
    public class StyleService : ServiceBase<Style, StyleDto>, IStyleService
    {
        public StyleService(
            IRepository<Style> repository,
            IMapper mapper
            ) : base(repository, mapper)
        {
        }
    }
}
