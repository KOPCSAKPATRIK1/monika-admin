# Monika Admin backend

ASP.NET Core Web API + EF Core (SQL Server) a Monika Admin Angular apphoz. A solution:
`MonikaAdmin.slnx`. Minden `dotnet` parancsot ebben a mappában futtass.

A repó gyökerében lévő `.claude/CLAUDE.md` az Angular frontendé (`monika-admin/`). Az ottani
konvenciók, a `kit` parancs és az `ng build` erre a mappára **nem** vonatkoznak. Itt a CLI a
`kit-dotnet`, és ennek a mappának a `.claude/`-ját kezeli (`.claude/kit.json`: `"stack": "dotnet"`).

## Mielőtt hozzányúlsz egy területhez, olvasd el a fájlját

A térkép a lap alján importált `_router.md`: melyik `conventions/` fájlt mikor olvasd, a contractok,
és a hivatalos .NET réteg eszközei. A `conventions/` fájlokat a `kit-dotnet scan` generálja, kézzel
ne szerkeszd őket. Amit a csapat döntött, az a `decisions/`-ben van, és az nyer:

| Fájl                                  | Mikor olvasd                                                     |
| ------------------------------------- | ---------------------------------------------------------------- |
| `.claude/decisions/conventions.md`    | bármilyen C# kód: formázás, elnevezés, rétegek, DI, contractok    |
| `.claude/decisions/traps.md`          | mindig fusd át: szándékos döntések, amelyek hibának tűnnek       |
| `.claude/decisions/adr/`              | végpont vagy a frontenddel közös szabály változásakor            |

## Prioritás ütközésnél

1. contract (`decisions/conventions.md` 12. rész)  2. `decisions/`  3. `conventions/`
4. hivatalos .NET best practice (dotnet skillek, Microsoft Learn)  5. saját tudás

Ha ütközést látsz, mondd ki egy sorban, ne dönts csendben.

## Mielőtt azt mondod, kész

1. `dotnet build MonikaAdmin.slnx`: 0 hiba, **0 figyelmeztetés**. A stílusszabályokat a build
   ellenőrzi (`EnforceCodeStyleInBuild`), a nullable figyelmeztetés hiba.
2. Ha végpont vagy DTO változott: az `openapi/monika-admin-api.json` diffje benne van a
   commitban, és megfelel a valódi válasznak (`api-spec-fidelity`).
3. Ha a modell változott: van migráció ugyanabban a commitban, és a
   `dotnet ef migrations has-pending-model-changes` tiszta.
4. Menj végig a diffeden a `decisions/conventions.md` 12. részének érintett contractjain.
5. Jelentsd: mit ellenőriztél, mit nem lehetett (például nincs teszt), és melyik szabályt szegted
   meg szándékosan és miért.

## Kit

Generated map of conventions, decisions and contracts:

@.claude/conventions/_router.md
