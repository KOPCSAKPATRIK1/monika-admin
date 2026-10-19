using Microsoft.AspNetCore.Mvc;
using MonikaAdmin.Core.Interfaces.Business;
using MonikaAdmin.Core.Models.Business;
using MonikaAdmin.Core.Models.Business.Dtos;

namespace MonikaAdmin.Api.Controllers;

[ApiController]
[Route("api/segments")]
public class SegmentsController : ControllerBase
{
    #region Private members

    private readonly ISegmentService _segmentService;

    #endregion

    #region Constructor

    public SegmentsController(ISegmentService segmentService)
    {
        _segmentService = segmentService;
    }

    #endregion

    [HttpGet]
    [ProducesResponseType<SegmentVmList[]>(StatusCodes.Status200OK)]
    public Task<SegmentVmList[]> GetSegmentsAsync([FromQuery] string? videoId, CancellationToken cancellationToken)
        => _segmentService.GetSegmentsAsync(videoId, cancellationToken);

    [HttpGet("{id:guid}", Name = nameof(GetSegmentAsync))]
    [ProducesResponseType<SegmentVmList>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SegmentVmList>> GetSegmentAsync(Guid id, CancellationToken cancellationToken)
    {
        var segment = await _segmentService.GetSegmentAsync(id, cancellationToken);
        return segment == null ? SegmentNotFound() : segment;
    }

    [HttpPost]
    [ProducesResponseType<SegmentVmList>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<SegmentVmList>> AddSegmentAsync(SegmentDto segment, CancellationToken cancellationToken)
    {
        var added = await _segmentService.AddSegmentAsync(segment, cancellationToken);
        return CreatedAtRoute(nameof(GetSegmentAsync), new { id = added.Id }, added);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateSegmentAsync(Guid id, SegmentDto segment, CancellationToken cancellationToken)
        => await _segmentService.UpdateSegmentAsync(id, segment, cancellationToken) ? NoContent() : SegmentNotFound();

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteSegmentAsync(Guid id, CancellationToken cancellationToken)
        => await _segmentService.DeleteSegmentAsync(id, cancellationToken) ? NoContent() : SegmentNotFound();

    [HttpPost("import")]
    [ProducesResponseType<MergeResult>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public Task<MergeResult> MergeSegmentsAsync(SegmentDto[] segments, CancellationToken cancellationToken)
        => _segmentService.MergeSegmentsAsync(segments, cancellationToken);

    #region Methods

    private ObjectResult SegmentNotFound()
        => Problem(statusCode: StatusCodes.Status404NotFound, detail: "Nincs ilyen azonosítójú szegmens.");

    #endregion
}
