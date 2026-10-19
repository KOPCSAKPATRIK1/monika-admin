using MonikaAdmin.Core.Models.Business;
using MonikaAdmin.Core.Models.Business.Dtos;

namespace MonikaAdmin.Core.Interfaces.Business;

public interface IVideoService
{
    /// <summary>
    /// Az összes videó lekérdezése azonosító szerint rendezve.
    /// </summary>
    /// <param name="cancellationToken">A művelet megszakítására szolgáló token.</param>
    /// <returns>A videók.</returns>
    Task<VideoVmList[]> GetVideosAsync(CancellationToken cancellationToken);

    /// <summary>
    /// Egy videó lekérdezése az azonosítója alapján.
    /// </summary>
    /// <param name="videoId">Videó azonosító.</param>
    /// <param name="cancellationToken">A művelet megszakítására szolgáló token.</param>
    /// <returns>A videó, vagy null, ha nincs ilyen.</returns>
    Task<VideoVmList?> GetVideoAsync(string videoId, CancellationToken cancellationToken);

    /// <summary>
    /// Új videó felvétele.
    /// </summary>
    /// <param name="video">A videó adatai.</param>
    /// <param name="cancellationToken">A művelet megszakítására szolgáló token.</param>
    /// <returns>Hamis, ha már van videó ezzel az azonosítóval.</returns>
    Task<bool> AddVideoAsync(VideoDto video, CancellationToken cancellationToken);

    /// <summary>
    /// Videó módosítása. Ha az azonosító változik, a régi azonosítóra mutató szegmensek az újra kerülnek.
    /// </summary>
    /// <param name="originalVideoId">A videó jelenlegi azonosítója.</param>
    /// <param name="video">A videó új adatai.</param>
    /// <param name="cancellationToken">A művelet megszakítására szolgáló token.</param>
    /// <returns>A módosítás eredménye.</returns>
    Task<VideoUpdateResult> UpdateVideoAsync(string originalVideoId, VideoDto video, CancellationToken cancellationToken);

    /// <summary>
    /// Videó törlése. A szegmensei megmaradnak.
    /// </summary>
    /// <param name="videoId">Videó azonosító.</param>
    /// <param name="cancellationToken">A művelet megszakítására szolgáló token.</param>
    /// <returns>Hamis, ha nincs ilyen videó.</returns>
    Task<bool> DeleteVideoAsync(string videoId, CancellationToken cancellationToken);

    /// <summary>
    /// Importált videók összefésülése: a meglévő azonosítójú videó frissül, a többi új lesz.
    /// </summary>
    /// <param name="videos">Az importált videók.</param>
    /// <param name="cancellationToken">A művelet megszakítására szolgáló token.</param>
    /// <returns>Hány videó lett új, és hány frissült.</returns>
    Task<MergeResult> MergeVideosAsync(VideoDto[] videos, CancellationToken cancellationToken);
}
