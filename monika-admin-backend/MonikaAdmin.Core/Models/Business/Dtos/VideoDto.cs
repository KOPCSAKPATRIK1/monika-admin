using System.ComponentModel.DataAnnotations;

namespace MonikaAdmin.Core.Models.Business.Dtos;

public class VideoDto
{
    [Required(ErrorMessage = "Add meg a videó azonosítóját (fájlnevét).")]
    [MaxLength(260, ErrorMessage = "A videó azonosítója legfeljebb 260 karakter lehet.")]
    public string VideoId { get; set; } = "";

    [MaxLength(200, ErrorMessage = "A cím legfeljebb 200 karakter lehet.")]
    public string Title { get; set; } = "";

    [MaxLength(2048, ErrorMessage = "Az URL legfeljebb 2048 karakter lehet.")]
    public string Url { get; set; } = "";

    /// <summary>
    /// Hossz <c>mm:ss</c> vagy <c>h:mm:ss</c> formában; üres, ha nem ismert.
    /// </summary>
    [RegularExpression(Timestamps.Pattern, ErrorMessage = "A hossz formája mm:ss vagy h:mm:ss, például 12:30.")]
    public string? Duration { get; set; }
}
