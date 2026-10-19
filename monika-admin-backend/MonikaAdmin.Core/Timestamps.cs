namespace MonikaAdmin.Core;

/// <summary>
/// A frontend időformátuma: <c>mm:ss</c> (a perc 59 fölé is mehet) vagy <c>h:mm:ss</c>.
/// </summary>
public static class Timestamps
{
    public const string Pattern = @"^(\d+:[0-5]\d|\d+:[0-5]\d:[0-5]\d)$";

    public static int ToSeconds(string timestamp)
    {
        var seconds = 0;
        foreach (var part in timestamp.Split(':'))
        {
            seconds = seconds * 60 + int.Parse(part);
        }
        return seconds;
    }

    /// <summary>
    /// Ugyanaz a forma, mint a frontend <c>secondsToTimestamp</c>-je: mindig <c>m:ss</c>.
    /// </summary>
    public static string FromSeconds(int totalSeconds) => $"{totalSeconds / 60}:{totalSeconds % 60:00}";
}
