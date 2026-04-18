using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using tohoku_recovery_311.Models;

namespace tohoku_recovery_311.Data
{
    public class ApplicationDbContext : IdentityDbContext<IdentityUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        public DbSet<GeoPoint> GeoPoints { get; set; }
        public DbSet<UserVisit> UserVisits { get; set; }
    }
}