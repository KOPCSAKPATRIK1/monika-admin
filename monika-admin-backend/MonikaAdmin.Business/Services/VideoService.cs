using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using MonikaAdmin.Core;
using MonikaAdmin.Core.Interfaces.Business;
using MonikaAdmin.Core.Interfaces.Repository;
using MonikaAdmin.Core.Models.Business;
using MonikaAdmin.Core.Models.Business.Dtos;
using MonikaAdmin.Core.Models.Domain;

namespace MonikaAdmin.Business.Services;

public class VideoService : IVideoService
{
    #region Private members

    private static readonly Expression<Func<Video, VideoVmList>> _toVideoVmList = video => new VideoVmList
    {
        VideoId = video.VideoId,
        Title = video.Title,
        Url = video.Url,
        Duration = video.DurationSeconds == null ? null : Timestamps.FromSeconds(video.DurationSeconds.Value),
    };

    private readonly IRepository<Video> _videoRepository;
    private readonly IRepository<Segment> _segmentRepository;
    private readonly IUnitOfWork _unitOfWork;

    #endregion

    #region Constructor

    public VideoService(
        IRepository<Video> videoRepository,
        IRepository<Segment> segmentRepository,
        IUnitOfWork unitOfWork)
    {
        _videoRepository = videoRepository;
        _segmentRepository = segmentRepository;
        _unitOfWork = unitOfWork;
    }

    #endregion

    public Task<VideoVmList[]> GetVideosAsync(CancellationToken cancellationToken)
        => _videoRepository.GetAll()
            .OrderBy(video => video.VideoId)
            .Select(_toVideoVmList)
            .ToArrayAsync(cancellationToken);

    public Task<VideoVmList?> GetVideoAsync(string videoId, CancellationToken cancellationToken)
        => _videoRepository.Find(video => video.VideoId == videoId)
            .Select(_toVideoVmList)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<bool> AddVideoAsync(VideoDto video, CancellationToken cancellationToken)
    {
        if (await _videoRepository.Find(existing => existing.VideoId == video.VideoId).AnyAsync(cancellationToken))
        {
            return false;
        }

        _videoRepository.Add(ToVideo(video));
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<VideoUpdateResult> UpdateVideoAsync(
        string originalVideoId,
        VideoDto video,
        CancellationToken cancellationToken)
    {
        var existing = await _videoRepository.Find(stored => stored.VideoId == originalVideoId).FirstOrDefaultAsync(cancellationToken);
        if (existing == null)
        {
            return VideoUpdateResult.NotFound;
        }

        if (video.VideoId == originalVideoId)
        {
            CopyFields(video, existing);
        }
        else
        {
            if (await _videoRepository.Find(stored => stored.VideoId == video.VideoId).AnyAsync(cancellationToken))
            {
                return VideoUpdateResult.VideoIdTaken;
            }

            // A kulcs nem módosítható, ezért a videó új sorba kerül, és a szegmensei vele mennek.
            _videoRepository.Remove(existing);
            _videoRepository.Add(ToVideo(video));
            var segments = await _segmentRepository.Find(segment => segment.VideoId == originalVideoId).ToArrayAsync(cancellationToken);
            foreach (var segment in segments)
            {
                segment.VideoId = video.VideoId;
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return VideoUpdateResult.Updated;
    }

    public async Task<bool> DeleteVideoAsync(string videoId, CancellationToken cancellationToken)
    {
        var existing = await _videoRepository.Find(video => video.VideoId == videoId).FirstOrDefaultAsync(cancellationToken);
        if (existing == null)
        {
            return false;
        }

        _videoRepository.Remove(existing);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<MergeResult> MergeVideosAsync(VideoDto[] videos, CancellationToken cancellationToken)
    {
        var videoIds = videos.Select(video => video.VideoId).Distinct().ToArray();
        var storedById = await _videoRepository.Find(video => videoIds.Contains(video.VideoId))
            .ToDictionaryAsync(video => video.VideoId, cancellationToken);

        var result = new MergeResult();
        foreach (var video in videos)
        {
            if (storedById.TryGetValue(video.VideoId, out var stored))
            {
                CopyFields(video, stored);
                result.Updated++;
            }
            else
            {
                var added = ToVideo(video);
                _videoRepository.Add(added);
                storedById.Add(added.VideoId, added);
                result.Added++;
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return result;
    }

    #region Methods

    private static Video ToVideo(VideoDto video) => new()
    {
        VideoId = video.VideoId,
        Title = video.Title,
        Url = video.Url,
        DurationSeconds = ToDurationSeconds(video.Duration),
    };

    private static void CopyFields(VideoDto source, Video target)
    {
        target.Title = source.Title;
        target.Url = source.Url;
        target.DurationSeconds = ToDurationSeconds(source.Duration);
    }

    private static int? ToDurationSeconds(string? duration)
        => string.IsNullOrWhiteSpace(duration) ? null : Timestamps.ToSeconds(duration);

    #endregion
}
