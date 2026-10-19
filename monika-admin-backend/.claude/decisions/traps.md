# Csapdák: szándékos döntések, amelyek hibának tűnnek

## A DbContext valósítja meg az `IUnitOfWork`-öt

`MonikaAdminDbContext : DbContext, IUnitOfWork`, és a DI ugyanazt a scoped példányt adja
`IUnitOfWork`-ként. Nem hiányzik egy külön `UnitOfWork` osztály. Így a service a Core interfészén
keresztül ment, a Business projekt nem hivatkozik az EF Core-ra, és a mentés a repositorykkal
ugyanabban a DbContextben történik.

## Nincs `Get` a repositoryban

A forrás-kódstílus `Get`-et is felsorol, de azonosító szerinti keresésre a
`Find(x => x.Id == id)` szabályt adja. Egy második út ugyanarra zaj lenne, ezért kimaradt.

## A connection stringet a DbContext első feloldása olvassa

A `Program.cs`-ben az `AddDbContext` a `(serviceProvider, options)` overloadot használja, és ott
dob, ha hiányzik a connection string. Ne hozd előre `builder.Configuration`-ből: a buildkori
OpenAPI-generálás (`GenerateOpenApiDocuments`) elindítja az appot, és ott nincs connection string.

## Az `openapi/monika-admin-api.json` generált, mégis commitolt

Minden build újraírja. Szándékosan van a gitben: a PR diffje mutatja meg a frontendnek a
szerződésváltozást (`api-spec-fidelity`). Kézzel ne szerkeszd.

## A `System.Security.Cryptography.Pkcs` rögzítve van

A `Directory.Packages.props` tranzitívan rögzíti (10.0.13), mert a `Microsoft.Data.SqlClient`
sebezhető verziót hozna. Ha a SqlClient frissítés után javított verziót hoz, a rögzítés törölhető.
Ellenőrzés: `dotnet list package --vulnerable --include-transitive`.

## A CORS az options patternből épül

A CORS policy az `IOptions<FrontendOptions>`-ból jön (`AddOptions<CorsOptions>().Configure<…>`), nem
a `builder.Configuration` közvetlen olvasásából. Üres `AllowedOrigins` mellett (Production
alapérték) semmilyen origin nincs engedve. Ez szándékos: éles originnél a környezet adja meg.

## Az idő másodpercben, a JSON-ban `m:ss` szöveg

A kezdőidő és a hossz időtartam (`time-kind`), ezért `int` másodpercként van tárolva
(`StartSeconds`, `DurationSeconds`). Az API a frontend formátumát beszéli: bemenetként `mm:ss` vagy
`h:mm:ss`, kimenetként mindig `m:ss`, ahogy a frontend `secondsToTimestamp`-je írja. Ezért jön vissza
az `1:02:15` hossz `62:15`-ként: ugyanaz az érték, nem hiba. Az összefésülés is másodpercben
hasonlít, így a `0:00` és a `0:00:00` ugyanaz a szegmens.

## A `Segment.VideoId` nem idegen kulcs

A frontend szabálya (`tagging.md`): a szegmens mutathat nem létező videóra, és a videó törlése
megtartja a szegmenseit. Idegen kulcs ezt megtiltaná.

## A videó átnevezése törlés + felvétel

A `VideoId` kulcs, és az EF Core nem módosít kulcsot. Az `UpdateVideoAsync` a régi sort törli, az
újat felveszi, és átírja a szegmensek `VideoId`-ját, egy mentésben.

## A Business projekt hivatkozik az EF Core csomagra

Csak az `IQueryable` aszinkron materializálásához (`ToArrayAsync`, `FirstOrDefaultAsync`). DbContextet
és a Repository projektet nem látja. A rétegszabály a projekthivatkozásokról szól, ez csomag.

## A DTO-k nem `required`-ek

`required` mellett a hiányzó mező JSON-deszerializálási hibát adna angol üzenettel, mielőtt a
`[Required]` lefutna. Ezért alapértéket kapnak (`""`, `[]`), és a validáció fogja meg őket.

## Nincs konkurenciaellenőrzés

A `lost-update` contract szerint két szerkesztő felülírhatja egymást. Most egyetlen admin van, ezért
nincs `rowversion`. Ha több szerkesztő lesz, ez az első teendő.
