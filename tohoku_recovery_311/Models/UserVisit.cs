// visit records in database
using System.ComponentModel.DataAnnotations;

namespace tohoku_recovery_311.Models
{
    public class UserVisit
    {
        public int Id { get; set; }

        public string? UserId { get; set; }


        public string Code { get; set; }

        public string Record { get; set; }

        public int VisitCount { get; set; }
    }
}
