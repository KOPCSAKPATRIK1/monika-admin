# Monika Admin

Admin app for tagging video segments (topics, keywords, title, description, start time) and
managing the video list. No backend yet: auth is a demo and data lives in localStorage.

The Angular app is in `monika-admin/` (one level below the git root). Run every npm/ng command there.

## Before you touch an area, read its file

Knowledge lives in these files, not here. Read the one the task touches; don't rely on memory.

| File                               | Read when the task touches                            |
| ---------------------------------- | ----------------------------------------------------- |
| `.claude/conventions/workspace.md` | anything: versions, commands, build/tsconfig settings |
| `.claude/conventions/structure.md` | adding or moving files, naming, component shape       |
| `.claude/conventions/state.md`     | stores, signals, effects, localStorage                |
| `.claude/conventions/forms.md`     | any form, input, validation, filter field             |
| `.claude/conventions/ui.md`        | templates, styling, Bootstrap, dark mode, alerts      |
| `.claude/conventions/tagging.md`   | segments, videos, CSV/JSON import or export           |
| `.claude/decisions/traps.md`       | always skim: non-obvious decisions that look like bugs |

`.claude/contracts/` holds team rules written after real incidents. It's empty for now;
see `.claude/contracts/README.md` for when one gets added.

## Priority on conflict

1. contract  2. convention  3. official Angular best practice  4. your own knowledge

When a convention here disagrees with what you'd normally write, follow the convention and say so
in one line. Don't silently pick.

## Before you say "done"

1. `npx ng build` in `monika-admin/` passes. Note: `strictTemplates` is **not** on, so a green
   build does not prove templates are type-correct; re-read the templates you changed.
2. Walk your diff against each convention file you read and against `decisions/traps.md`.
3. Report: what you checked, anything you couldn't check (e.g. no tests exist for that code),
   and any convention you deliberately broke and why.

## When something here is wrong

The code wins. If a convention file no longer matches the code, say so, and update the file in
the same change. A new non-obvious decision goes in `decisions/traps.md`, not in this file.
