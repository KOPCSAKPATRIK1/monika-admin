namespace MonikaAdmin.Core.Models.Business;

/// <summary>
/// Egy import eredménye: hány elem lett új, és hány frissült egy meglévő helyén.
/// </summary>
public class MergeResult
{
    public int Added { get; set; }

    public int Updated { get; set; }
}
