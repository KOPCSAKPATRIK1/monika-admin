# Workspace

- Angular 22.2, single application project `monika-admin`, plain Angular CLI (no Nx).
- Builder: `@angular/build:application`. Unit tests: `@angular/build:unit-test` with Vitest + jsdom.
- TypeScript ~6.0. Package manager: npm.
- Zoneless: `zone.js` is not a dependency and `app.config.ts` has no zone provider.
- `withComponentInputBinding()` is on: route params and query params arrive as component `input()`s
  (e.g. `Login.returnUrl` comes from `?returnUrl=`).

## Commands (run in `monika-admin/`)

| Task  | Command          |
| ----- | ---------------- |
| dev   | `npx ng serve`   |
| build | `npx ng build`   |
| test  | `npx ng test`    |

## Compiler settings worth knowing

- `tsconfig.json` does **not** set `"strict": true`, and `angularCompilerOptions` does **not** set
  `strictTemplates`. Null-safety and template type errors are therefore not caught by the build.
  Turning them on is a separate, deliberate change, not a side effect of another task.
- Production budget: initial bundle warns at 500 kB, errors at 1 MB. Bootstrap's CSS alone is about
  230 kB raw, so the initial bundle is already close to the warning line. Keep new code lazy
  (inside routed pages), not in `app.config.ts` or the root component.

## Formatting

Prettier: 100 columns, single quotes, Angular parser for `.html`. No ESLint is configured.

## Sample data

`monika-admin/sample-data/` has a Hungarian-header segments CSV (`;`-separated) and a videos JSON,
for trying the importers by hand.
