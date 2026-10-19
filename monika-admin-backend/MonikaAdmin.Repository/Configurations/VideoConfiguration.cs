using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MonikaAdmin.Core.Models.Domain;

namespace MonikaAdmin.Repository.Configurations;

public class VideoConfiguration : IEntityTypeConfiguration<Video>
{
    public void Configure(EntityTypeBuilder<Video> builder)
    {
        builder.ToTable("Videos");
        builder.HasKey(video => video.VideoId);
        builder.Property(video => video.VideoId).HasMaxLength(260);
        builder.Property(video => video.Title).HasMaxLength(200);
        builder.Property(video => video.Url).HasMaxLength(2048);
    }
}
