namespace MonikaAdmin.Core.Models.Business;

public class VideoVmList
{
    public required string VideoId { get; init; }

    public required string Title { get; init; }

    public required string Url { get; init; }

    public string? Duration { get; init; }
}
