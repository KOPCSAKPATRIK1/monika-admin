# UI and styling

- Bootstrap 5.3 **CSS only**, loaded globally from `angular.json` `styles`. Bootstrap's JavaScript is
  not loaded: anything interactive (dismissing an alert, tabs, confirm-delete) is done with a
  signal in the component, not `data-bs-*` attributes.
- Style with Bootstrap utility and component classes in the template. `src/styles.css` and the
  component styles are empty. A rare one-off size goes in an inline `style` (e.g. the login card's
  `max-width`); there are no custom CSS classes.
- Dark mode follows the OS: a small script in `src/index.html` sets `data-bs-theme` on `<html>`.
  Use theme-aware classes (`bg-body-tertiary`, `text-body-secondary`, `text-bg-*`) instead of fixed
  colours, so both themes work.
- Templates use the built-in control flow (`@if`, `@for` with `track`, `@switch`, `@let`), never
  `*ngIf` / `*ngFor`. Track by a stable id (`segment.id`, `video.videoId`); `$index` only for lists
  that have no id.
- Destructive actions use an inline "Delete? Yes / No" in the row, not a modal or `confirm()`.
- Import results are shown as a dismissible alert built by `import-message.ts`
  (`success` / `warning` with skipped-row details / `danger`).
- Empty states: a bordered, centred muted box when a table has no data at all; a single table row
  when filters match nothing.
- Accessibility: every input has a `<label for>` or an `aria-label`; icon-only or hidden-text
  controls use `visually-hidden` or `aria-label`; alerts use `role="alert"` or `role="status"`.
