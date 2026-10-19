using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace MonikaAdmin.Core.Validation;

/// <summary>
/// Legfeljebb ennyi mondat. A mondat <c>.</c>, <c>!</c>, <c>?</c> vagy <c>…</c> után szóközzel ér
/// véget, így a <c>2.5</c> nem vágja ketté; a frontend <c>countSentences</c>-ével egyezik.
/// </summary>
[AttributeUsage(AttributeTargets.Property)]
public partial class MaxSentencesAttribute : ValidationAttribute
{
    public MaxSentencesAttribute(int maxSentences)
    {
        MaxSentences = maxSentences;
    }

    public int MaxSentences { get; }

    public override bool IsValid(object? value)
        => value is not string text || CountSentences(text) <= MaxSentences;

    public static int CountSentences(string text)
        => SentenceBreak().Split(text).Count(sentence => !string.IsNullOrWhiteSpace(sentence));

    [GeneratedRegex(@"(?<=[.!?…])\s+")]
    private static partial Regex SentenceBreak();
}
