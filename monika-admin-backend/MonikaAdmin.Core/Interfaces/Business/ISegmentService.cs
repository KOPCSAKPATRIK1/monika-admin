using MonikaAdmin.Core.Models.Business;
using MonikaAdmin.Core.Models.Business.Dtos;

namespace MonikaAdmin.Core.Interfaces.Business;

public interface ISegmentService
{
    /// <summary>
    /// A szegmensek lekérdezése videó és kezdőidő szerint rendezve.
    /// </summary>
    /// <param name="videoId">Ha meg van adva, csak ennek a videónak a szegmensei.</param>
    /// <param name="cancellationToken">A művelet megszakítására szolgáló token.</param>
    /// <returns>A szegmensek.</returns>
    Task<SegmentVmList[]> GetSegmentsAsync(string? videoId, CancellationToken cancellationToken);

    /// <summary>
    /// Egy szegmens lekérdezése az azonosítója alapján.
    /// </summary>
    /// <param name="id">Szegmens azonosító.</param>
    /// <param name="cancellationToken">A művelet megszakítására szolgáló token.</param>
    /// <returns>A szegmens, vagy null, ha nincs ilyen.</returns>
    Task<SegmentVmList?> GetSegmentAsync(Guid id, CancellationToken cancellationToken);

    /// <summary>
    /// Új szegmens felvétele.
    /// </summary>
    /// <param name="segment">A szegmens adatai.</param>
    /// <param name="cancellationToken">A művelet megszakítására szolgáló token.</param>
    /// <returns>A létrehozott szegmens.</returns>
    Task<SegmentVmList> AddSegmentAsync(SegmentDto segment, CancellationToken cancellationToken);

    /// <summary>
    /// Szegmens módosítása.
    /// </summary>
    /// <param name="id">Szegmens azonosító.</param>
    /// <param name="segment">A szegmens új adatai.</param>
    /// <param name="cancellationToken">A művelet megszakítására szolgáló token.</param>
    /// <returns>Hamis, ha nincs ilyen szegmens.</returns>
    Task<bool> UpdateSegmentAsync(Guid id, SegmentDto segment, CancellationToken cancellationToken);

    /// <summary>
    /// Szegmens törlése.
    /// </summary>
    /// <param name="id">Szegmens azonosító.</param>
    /// <param name="cancellationToken">A művelet megszakítására szolgáló token.</param>
    /// <returns>Hamis, ha nincs ilyen szegmens.</returns>
    Task<bool> DeleteSegmentAsync(Guid id, CancellationToken cancellationToken);

    /// <summary>
    /// Importált szegmensek összefésülése: az azonos videójú és azonos kezdőidejű szegmens frissül,
    /// a többi új lesz.
    /// </summary>
    /// <param name="segments">Az importált szegmensek.</param>
    /// <param name="cancellationToken">A művelet megszakítására szolgáló token.</param>
    /// <returns>Hány szegmens lett új, és hány frissült.</returns>
    Task<MergeResult> MergeSegmentsAsync(SegmentDto[] segments, CancellationToken cancellationToken);
}
