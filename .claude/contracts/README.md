# Contracts

A contract is a team rule that applies to every project, written after a real incident.
This folder is empty until such an incident happens. Don't add rules here preemptively.

A contract gets added only when all of these hold:

1. Something actually went wrong, and you can name the incident.
2. Neither the compiler nor `ng build` catches it.
3. The official Angular docs don't already state the rule; otherwise it's framework knowledge.
4. It describes a **class of bugs and how to diagnose it**, not a specific API or fix value.
   ("Don't call `push()` on a signal's array" is too narrow; "a change that crosses a
   reference-equality boundary only as a mutation is invisible; trace it to the first comparison
   and produce a new value there" is the right level.)

Format: one file per contract, `<kebab-name>.md`, with frontmatter `name`, `version`, and an
`incident:` line, then sections **Failure class**, **How to diagnose**, **What to do**.
After adding one, add a row for it to the table in `.claude/CLAUDE.md`.
