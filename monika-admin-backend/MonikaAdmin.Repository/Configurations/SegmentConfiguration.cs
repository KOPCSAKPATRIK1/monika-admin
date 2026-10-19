using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MonikaAdmin.Core.Models.Domain;

namespace MonikaAdmin.Repository.Configurations;

public class SegmentConfiguration : IEntityTypeConfiguration<Segment>
{
    public void Configure(EntityTypeBuilder<Segment> builder)
    {
        builder.ToTable("Segments");
        builder.HasKey(segment => segment.Id);
        builder.Property(segment => segment.Id).ValueGeneratedNever();
        builder.Property(segment => segment.Title).HasMaxLength(80);
        builder.Property(segment => segment.VideoId).HasMaxLength(260);
        builder.PrimitiveCollection(segment => segment.Topics);
        builder.PrimitiveCollection(segment => segment.Keywords);

        // Nem egyedi: a felhasználó két szegmenst is tehet ugyanarra az időre; az import a sorrendben
        // első találatot frissíti.
        builder.HasIndex(segment => new { segment.VideoId, segment.StartSeconds });
    }
}
