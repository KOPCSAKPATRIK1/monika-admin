using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using MonikaAdmin.Core;
using MonikaAdmin.Core.Interfaces.Business;
using MonikaAdmin.Core.Interfaces.Repository;
using MonikaAdmin.Core.Models.Business;
using MonikaAdmin.Core.Models.Business.Dtos;
using MonikaAdmin.Core.Models.Domain;

namespace MonikaAdmin.Business.Services;

public class SegmentService : ISegmentService
{
    #region Private members

    private static readonly Expression<Func<Segment, SegmentVmList>> _toSegmentVmList = segment => new SegmentVmList
    {
        Id = segment.Id,
        Topics = segment.Topics,
        Keywords = segment.Keywords,
        Title = segment.Title,
        Description = segment.Description,
        VideoId = segment.VideoId,
        Timestamp = Timestamps.FromSeconds(segment.StartSeconds),
    };

    private static readonly Func<Segment, SegmentVmList> _toSegmentVmListInMemory = _toSegmentVmList.Compile();

    private readonly IRepository<Segment> _segmentRepository;
    private readonly IUnitOfWork _unitOfWork;

    #endregion

    #region Constructor

    public SegmentService(
        IRepository<Segment> segmentRepository,
        IUnitOfWork unitOfWork)
    {
        _segmentRepository = segmentRepository;
        _unitOfWork = unitOfWork;
    }

    #endregion

    public Task<SegmentVmList[]> GetSegmentsAsync(string? videoId, CancellationToken cancellationToken)
    {
        var segments = videoId == null
            ? _segmentRepository.GetAll()
            : _segmentRepository.Find(segment => segment.VideoId == videoId);
        return segments
            .OrderBy(segment => segment.VideoId)
            .ThenBy(segment => segment.StartSeconds)
            .Select(_toSegmentVmList)
            .ToArrayAsync(cancellationToken);
    }

    public Task<SegmentVmList?> GetSegmentAsync(Guid id, CancellationToken cancellationToken)
        => _segmentRepository.Find(segment => segment.Id == id)
            .Select(_toSegmentVmList)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<SegmentVmList> AddSegmentAsync(SegmentDto segment, CancellationToken cancellationToken)
    {
        var added = ToSegment(Guid.CreateVersion7(), segment);
        _segmentRepository.Add(added);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return _toSegmentVmListInMemory(added);
    }

    public async Task<bool> UpdateSegmentAsync(Guid id, SegmentDto segment, CancellationToken cancellationToken)
    {
        var existing = await _segmentRepository.Find(stored => stored.Id == id).FirstOrDefaultAsync(cancellationToken);
        if (existing == null)
        {
            return false;
        }

        CopyFields(segment, existing);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteSegmentAsync(Guid id, CancellationToken cancellationToken)
    {
        var existing = await _segmentRepository.Find(segment => segment.Id == id).FirstOrDefaultAsync(cancellationToken);
        if (existing == null)
        {
            return false;
        }

        _segmentRepository.Remove(existing);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<MergeResult> MergeSegmentsAsync(SegmentDto[] segments, CancellationToken cancellationToken)
    {
        var videoIds = segments.Select(segment => segment.VideoId).Distinct().ToArray();
        var stored = await _segmentRepository.Find(segment => videoIds.Contains(segment.VideoId))
            .OrderBy(segment => segment.Id)
            .ToArrayAsync(cancellationToken);

        var storedByVideoAndTime = new Dictionary<(string VideoId, int StartSeconds), Segment>();
        foreach (var segment in stored)
        {
            _ = storedByVideoAndTime.TryAdd((segment.VideoId, segment.StartSeconds), segment);
        }

        var result = new MergeResult();
        foreach (var segment in segments)
        {
            var key = (segment.VideoId, Timestamps.ToSeconds(segment.Timestamp));
            if (storedByVideoAndTime.TryGetValue(key, out var existing))
            {
                CopyFields(segment, existing);
                result.Updated++;
            }
            else
            {
                var added = ToSegment(Guid.CreateVersion7(), segment);
                _segmentRepository.Add(added);
                storedByVideoAndTime.Add(key, added);
                result.Added++;
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return result;
    }

    #region Methods

    private static Segment ToSegment(Guid id, SegmentDto segment) => new()
    {
        Id = id,
        Topics = segment.Topics,
        Keywords = segment.Keywords,
        Title = segment.Title,
        Description = segment.Description,
        VideoId = segment.VideoId,
        StartSeconds = Timestamps.ToSeconds(segment.Timestamp),
    };

    private static void CopyFields(SegmentDto source, Segment target)
    {
        target.Topics = source.Topics;
        target.Keywords = source.Keywords;
        target.Title = source.Title;
        target.Description = source.Description;
        target.VideoId = source.VideoId;
        target.StartSeconds = Timestamps.ToSeconds(source.Timestamp);
    }

    #endregion
}
