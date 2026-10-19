namespace MonikaAdmin.Core.Models.Domain;

public class Video
{
    /// <summary>
    /// A videófájl neve; a szegmensek erre hivatkoznak.
    /// </summary>
    public required string VideoId { get; set; }

    public required string Title { get; set; }

    /// <summary>
    /// Útvonal vagy URL, ahonnan a lejátszó betölti a fájlt.
    /// </summary>
    public required string Url { get; set; }

    public int? DurationSeconds { get; set; }
}
