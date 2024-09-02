using MindHub.Common.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MindHub.Domain.Interfaces
{
    public interface IEntityBase
    {
        int Id { get; set; }
        [Required]
        public RecordStatus RecordStatus { get; set; }

        [Required]
        public DateTime RecordCreateDate { get; set; }

        public DateTime? RecordUpdateDate { get; set; }
    }
}
