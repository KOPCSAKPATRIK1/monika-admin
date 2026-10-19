namespace MonikaAdmin.Core.Models.Domain;

public class Segment
{
    public Guid Id { get; set; }

    public required string[] Topics { get; set; }

    public required string[] Keywords { get; set; }

    public required string Title { get; set; }

    public required string Description { get; set; }

    /// <summary>
    /// A videó azonosítója. Szándékosan nem idegen kulcs: a szegmens mutathat olyan videóra is, ami
    /// nincs a videók között.
    /// </summary>
    public required string VideoId { get; set; }

    public int StartSeconds { get; set; }
}
