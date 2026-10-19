using Microsoft.AspNetCore.Mvc;
using MonikaAdmin.Core.Interfaces.Business;
using MonikaAdmin.Core.Models.Business;
using MonikaAdmin.Core.Models.Business.Dtos;

namespace MonikaAdmin.Api.Controllers;

[ApiController]
[Route("api/videos")]
public class VideosController : ControllerBase
{
    #region Private members

    private readonly IVideoService _videoService;

    #endregion

    #region Constructor

    public VideosController(IVideoService videoService)
    {
        _videoService = videoService;
    }

    #endregion

    [HttpGet]
    [ProducesResponseType<VideoVmList[]>(StatusCodes.Status200OK)]
    public Task<VideoVmList[]> GetVideosAsync(CancellationToken cancellationToken)
        => _videoService.GetVideosAsync(cancellationToken);

    [HttpGet("{videoId}", Name = nameof(GetVideoAsync))]
    [ProducesResponseType<VideoVmList>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<VideoVmList>> GetVideoAsync(string videoId, CancellationToken cancellationToken)
    {
        var video = await _videoService.GetVideoAsync(videoId, cancellationToken);
        return video == null ? VideoNotFound(videoId) : video;
    }

    [HttpPost]
    [ProducesResponseType<VideoVmList>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<VideoVmList>> AddVideoAsync(VideoDto video, CancellationToken cancellationToken)
    {
        if (!await _videoService.AddVideoAsync(video, cancellationToken))
        {
            return VideoIdTaken(video.VideoId);
        }

        var added = await _videoService.GetVideoAsync(video.VideoId, cancellationToken);
        return CreatedAtRoute(nameof(GetVideoAsync), new { videoId = video.VideoId }, added);
    }

    [HttpPut("{videoId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> UpdateVideoAsync(string videoId, VideoDto video, CancellationToken cancellationToken)
        => await _videoService.UpdateVideoAsync(videoId, video, cancellationToken) switch
        {
            VideoUpdateResult.NotFound => VideoNotFound(videoId),
            VideoUpdateResult.VideoIdTaken => VideoIdTaken(video.VideoId),
            _ => NoContent(),
        };

    [HttpDelete("{videoId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteVideoAsync(string videoId, CancellationToken cancellationToken)
        => await _videoService.DeleteVideoAsync(videoId, cancellationToken) ? NoContent() : VideoNotFound(videoId);

    [HttpPost("import")]
    [ProducesResponseType<MergeResult>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public Task<MergeResult> MergeVideosAsync(VideoDto[] videos, CancellationToken cancellationToken)
        => _videoService.MergeVideosAsync(videos, cancellationToken);

    #region Methods

    private ObjectResult VideoNotFound(string videoId)
        => Problem(statusCode: StatusCodes.Status404NotFound, detail: $"Nincs „{videoId}” azonosítójú videó.");

    private ObjectResult VideoIdTaken(string videoId)
        => Problem(statusCode: StatusCodes.Status409Conflict, detail: $"Már van „{videoId}” azonosítójú videó.");

    #endregion
}
