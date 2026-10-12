# Tagging feature (`features/tagging/`)

## The two tables

| Table    | Model              | Key                       |
| -------- | ------------------ | ------------------------- |
| Segments | `Segment`          | internal `id` (UUID)      |
| Videos   | `Video`            | `videoId` (the file name) |

- `Segment.videoId` refers to `Video.videoId`. The link is **not** enforced: a segment may point to a
  video that isn't in the videos table. The UI flags these ("?" badge, "not in the videos table"
  hint, and the "+ videoId" buttons on the videos tab) instead of rejecting them.
- `SegmentData` is a `Segment` without `id`. Import, export and the editor all work with
  `SegmentData`; the `id` exists only inside the app and is never exported.
- `TOPICS` (9 entries) are placeholders until the real names arrive. Imported topics not in the list
  are kept and shown as extra options.

## Field rules (from the spec)

- `timestamp` / `duration`: `mm:ss` or `h:mm:ss`, checked with `TIMESTAMP_PATTERN`; minutes may
  exceed 59 in `mm:ss`. Use `timestampToSeconds` to compare times, never string comparison.
- `description`: at most 3 sentences, counted by `countSentences`.
- `title`: required, under 80 characters.
- `topics`: at least one.
- List cells (`topics`, `keywords`) split on `,`, `;` or `|` via `splitList`.

## Import

- One entry point per table (`importSegments`, `importVideos`) accepts CSV **or** JSON; the first
  character decides. JSON may be a bare array or an object holding the array under
  `"segments"` / `"videos"`.
- CSV header names are matched through `COLUMN_NAMES` after `simplifyColumnName` (no accents, no
  spaces, lowercase). New aliases are added there in that simplified form. With no recognisable
  header (fewer than 2 known columns), columns are read in spec order.
- Bad rows are skipped and reported as `"Row N: …"`; good rows are still imported.
- Merging into the store: a segment with the same `videoId` **and** the same time in seconds
  updates the existing one; a video with the same `videoId` is replaced.

## Export

- CSV is written with `;`, a UTF-8 byte order mark and `\r\n` line endings, so Hungarian Excel opens
  it in columns with correct accents.
- File names: `<table>-<YYYY-MM-DD>.<csv|json>`.

## Store behaviour that's intentional

- Deleting a video keeps its segments.
- Renaming a video's id moves its segments to the new id.
