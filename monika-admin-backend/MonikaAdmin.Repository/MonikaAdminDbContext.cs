using Microsoft.EntityFrameworkCore;
using MonikaAdmin.Core.Interfaces.Repository;

namespace MonikaAdmin.Repository;

public class MonikaAdminDbContext : DbContext, IUnitOfWork
{
    public MonikaAdminDbContext(DbContextOptions<MonikaAdminDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(MonikaAdminDbContext).Assembly);
    }
}
