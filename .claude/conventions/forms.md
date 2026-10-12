# Forms

Every form uses **signal forms** (`@angular/forms/signals`). There are no reactive forms
(`FormGroup`) or template-driven forms (`ngModel`) in the app; don't introduce them.

## Pattern

- A plain interface for the form model (`LoginModel`, `SegmentFormModel`), held in a private
  `signal`, wrapped with `form(model, schema, { submission: { action } })`.
- The template binds `[formRoot]="form"` on `<form>` and `[formField]="form.x"` on each control.
  Import `FormRoot` and `FormField` in the component.
- Validators (`required`, `email`, `maxLength`, `validate`) always pass a human-readable `message`.
  A custom `validate` returns `{ kind, message }` or `undefined`.
- The submit logic lives in `submission.action`. A server-side failure is returned as
  `{ kind: 'server', message }` and is shown from `form().errors()`.
- When the form model differs from the stored data (e.g. keywords typed as one comma-separated
  string), convert with small `createFormModel` / `create…Data` functions at the bottom of the file.

## Showing errors

- An error is shown only once the field is `touched()` and `invalid()`.
- Editors use a `protected errorOf(field)` helper that returns the first message or `null`; the
  template stores it with `@let` and uses it for both `is-invalid` and the `invalid-feedback` text.
- Bootstrap validation classes: `is-invalid` on the control, `invalid-feedback` text after it
  (`d-block` when the text isn't a direct sibling of the control).

## Filters and search boxes

Filter bars are signal forms too: `form(signal({ search: '', ... }))` without a schema, and the
filtered list is a `computed` that reads the filter signal.

## Editors

An editor component takes `input<T | null>()` (`null` = create new), emits `saved` / `cancelled`
outputs, and never writes to the store itself. The parent panel decides between add and update.
