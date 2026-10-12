# State

No state library. State lives in `@Injectable({ providedIn: 'root' })` services built on signals.
Current stores: `AuthService` (`core/auth/`), `TaggingStore` (`features/tagging/`).

## Store shape

- Private writable `signal`s hold the data; the public API is `computed`s and `asReadonly()`.
  Components never `set` a store's signal directly; they call a store method.
- Derived views (sorted lists, id sets, counts per key) are `computed`s on the store, so every
  component shares one result.
- Component-local UI state (open editor, selected tab, pending delete) is a `signal` in the
  component, not in the store.

## Updates are always new values

Every update builds a new array/object and calls `set` (`slice()` then push, `filter`, or a loop
into a new list). Never mutate an array or object that is already inside a signal: signals and
`computed`s compare by reference, so an in-place change is invisible to the UI and to persistence.

## Persistence

- `TaggingStore` saves each list to localStorage from an `effect()` in its constructor, so every
  change is saved without the methods having to remember it.
- localStorage keys are prefixed `monika-admin.` (`monika-admin.user`, `.segments`, `.videos`).
- Reads and writes are wrapped in `try/catch`; a failed read falls back to an empty value, a
  failed write keeps the data in memory for the session.
- localStorage is a stand-in until a backend exists (see the `TODO`s). Keep storage access inside the
  store so it can be swapped for HTTP calls without touching components.

## effect()

Used only for side effects that leave Angular: localStorage writes, and resetting a form when an
editor's `input()` changes. The form reset reads the input, then wraps the write in `untracked()`
so the effect re-runs only when the input changes. Don't use `effect()` to copy one signal into
another; use `computed`.
