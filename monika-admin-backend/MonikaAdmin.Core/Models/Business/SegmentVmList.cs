namespace MonikaAdmin.Core.Models.Business;

public class SegmentVmList
{
    public Guid Id { get; init; }

    public required string[] Topics { get; init; }

    public required string[] Keywords { get; init; }

    public required string Title { get; init; }

    public required string Description { get; init; }

    public required string VideoId { get; init; }

    public required string Timestamp { get; init; }
}
