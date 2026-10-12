# Traps

Things that look like bugs or invite a "cleanup" but are deliberate. One entry each: what, why.
Add an entry when you learn something the code can't tell a reader.

- **Deleting a video doesn't delete its segments.** Segments are the expensive, hand-written data;
  the video list can be re-imported. Orphaned segments are surfaced in the UI instead.
- **Segment ↔ video links aren't validated.** Segments can be imported before the video list
  exists. Rejecting them would lose work; flagging them is enough.
- **CSV export uses `;`, a BOM and CRLF.** Hungarian Excel expects `;` and needs the BOM to show
  `á, ő, ű`. Switching to `,` or dropping the BOM breaks opening the file in Excel.
- **CSV import auto-detects `,` vs `;`.** Files come both from Excel (`;`) and from other tools (`,`).
- **Import matches segments by video id + time in seconds, not by `id`.** Exported files carry no
  `id`, so re-importing an edited export must update the existing rows instead of duplicating them.
  `1:05` and `01:05` are the same segment.
- **`mm:ss` allows minutes above 59.** `75:10` is a valid start time; only the seconds are capped.
- **Auth is a demo** (`admin@gmail.com` / `admin`, 600 ms fake delay, user stored in localStorage).
  Not a security boundary; it will be replaced when the backend exists. Don't harden it in place.
- **Store data is in localStorage.** Clearing site data loses everything that wasn't exported.
- **`strict` and `strictTemplates` are off.** A green `ng build` doesn't prove null-safety or template
  types. Turning them on is its own change.
- **The editor form reset runs inside `untracked()`.** Without it the effect would also track the
  form's own signals and reset the form while the user types.
