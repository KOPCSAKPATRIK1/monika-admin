using System.ComponentModel.DataAnnotations;
using MonikaAdmin.Core.Validation;

namespace MonikaAdmin.Core.Models.Business.Dtos;

public class SegmentDto
{
    [Required(ErrorMessage = "Válassz legalább egy témát.")]
    [MinLength(1, ErrorMessage = "Válassz legalább egy témát.")]
    public string[] Topics { get; set; } = [];

    public string[] Keywords { get; set; } = [];

    [Required(ErrorMessage = "Adj meg egy rövid címet.")]
    [MaxLength(80, ErrorMessage = "A cím legfeljebb 80 karakter lehet.")]
    public string Title { get; set; } = "";

    [MaxSentences(3, ErrorMessage = "A leírás legfeljebb 3 mondat lehet.")]
    public string Description { get; set; } = "";

    [Required(ErrorMessage = "Add meg a videó azonosítóját (fájlnevét).")]
    [MaxLength(260, ErrorMessage = "A videó azonosítója legfeljebb 260 karakter lehet.")]
    public string VideoId { get; set; } = "";

    /// <summary>
    /// Kezdőidő <c>mm:ss</c> vagy <c>h:mm:ss</c> formában.
    /// </summary>
    [Required(ErrorMessage = "Add meg a kezdőidőt.")]
    [RegularExpression(Timestamps.Pattern, ErrorMessage = "A kezdőidő formája mm:ss vagy h:mm:ss, például 4:05.")]
    public string Timestamp { get; set; } = "";
}
