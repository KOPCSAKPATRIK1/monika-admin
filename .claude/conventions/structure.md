# Structure and naming

## Folders (under `monika-admin/src/app/`)

| Folder                | Holds                                                               |
| --------------------- | ------------------------------------------------------------------- |
| `core/<area>/`        | app-wide services and guards (today: `core/auth/`)                  |
| `pages/<page>/`       | routed components, one per route, lazy-loaded                       |
| `features/<feature>/` | a feature's components, its store, its models and pure helper files |

A page composes features; a feature doesn't import from `pages/`.

## Files and classes

- Angular 20+ naming: no `.component` / `.service` suffix in file names or class names.
  `segment-editor/segment-editor.ts` exports `SegmentEditor`; `tagging.store.ts` exports `TaggingStore`.
- A component with a real template gets its own folder with `<name>.ts` + `<name>.html`.
  A small page may use an inline `template` (see `pages/dashboard/dashboard.ts`).
- No component `.css` files: styling is Bootstrap classes in the template (see `ui.md`).
- Pure, framework-free helpers are plain functions in their own file next to the feature
  (`csv.ts`, `file-io.ts`, `import-export.ts`), not methods on a service.
- Selector prefix `app-`.

## Component shape

- Standalone only; no NgModules. Dependencies go in `@Component.imports`.
- No explicit `changeDetection` is set anywhere; don't add one per component.
- Dependencies via `inject()` in field initializers, not constructor parameters.
- Members used only by the template are `protected`; injected services the template doesn't use are
  `private readonly`.
- `input()` / `output()` functions, not decorators.
- The constructor holds only `effect()` setup.

## Routing

- Routes in `app.routes.ts`, each with `loadComponent` (lazy) and a `title` of the form
  `"<Page> · Monika Admin"`.
- Guards are functional `CanActivateFn`s in `core/auth/auth.guard.ts`.

## Code style

- Comments explain *why* or describe what a value means. They don't narrate the code.
  Exported functions and non-obvious fields get a one-line `/** */`.
- The code favours plain, explicit loops and step-by-step building of results over dense
  chained expressions. Match that in files that already do it.
- UI text is English. Data (CSV headers, sample content) is Hungarian.
