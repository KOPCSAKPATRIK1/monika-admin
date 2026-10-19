# C# / .NET kódstílus és szabályok

A `csharp-kodstilus.md` alapján, a MonikaAdmin Web API-ra igazítva. Az asztali, MVVM és XAML
részek helyén a 8. rész Web API szabályokat ad, a példák a MonikaAdmin namespace-eit használják.

- **1–11. rész:** a követendő stílus.
- **12. rész:** contractok, vagyis hibaosztályok, amelyeket a fordító nem lát. Mindegyiknél ott van, hogyan
  ellenőrizd és mit tegyél.
- **13. rész:** minták, amelyeket ne másolj át, a helyes megoldással együtt.

Ütközésnél a sorrend: contract > ez a fájl > a `conventions/` tényei > hivatalos best practice >
saját tudás. Az ütközést mindig mondd ki, ne dönts csendben.

---

## 1. Formázás

| Szabály | Érték |
| --- | --- |
| Behúzás | 4 szóköz, tab nincs |
| Sorvég | CRLF (`end_of_line = crlf`) |
| Kapcsos zárójel | mindig új sorban (Allman), lambdánál, metódusnál, típusnál, property-nél is |
| `else`, `catch`, `finally` | új sorban |
| Kapcsos zárójel egysoros blokknál | kötelező, egysoros `if` is kap `{ }`-t |
| Egysoros blokk egy sorban | nem: `csharp_preserve_single_line_blocks = false` |
| Namespace | file-scoped: `namespace Foo.Bar;` |
| `using` | a namespace előtt, `System.*` elöl, ábécérendben |
| `using` utasítás | egyszerű forma: `using var x = …;` |
| Szóközök | kulcsszó után igen (`if (`), metódusnév és `(` között nem, cast után nem, `:` körül öröklésnél igen |
| Operátor tördelésnél | a sor elejére kerül |
| Hosszú paraméterlista | minden paraméter külön sorban, a nyitó `(` után új sor |

A teljes beállítás a solution gyökerében lévő `.editorconfig`, kiegészítve a `_camelCase` privát
mező és az `I` előtagú interfész elnevezési szabályával. A build ellenőrzi
(`EnforceCodeStyleInBuild` a `Directory.Build.props`-ban).

## 2. Nyelvi elemek

- `var` mindenhol, ahol a típus kiderül (beépített típusoknál is).
- Target-typed `new()`, ha a típus a bal oldalon áll: `private readonly List<VideoDto> _videos = new();`
- Objektum- és gyűjtemény-inicializáló a property-nkénti értékadás helyett.
- `int`, `string`, `bool` kulcsszó, nem `Int32`, `String`.
- Nincs `this.` minősítés.
- Pattern matching az `as` + null-ellenőrzés helyett: `if (x is Video video)`.
- Expression body property-nél és accessornál igen, konstruktornál nem. Metódusnál csak akkor, ha egy
  sorba fér.
- Logikai eredményt közvetlenül adj vissza, ne `if/else`-ben:
  `private static bool IsTitleMissing(VideoDto video) => string.IsNullOrWhiteSpace(video.Title);`
- `??` és `?.` a kézi null-ellenőrzés helyett.
- Nem használt visszatérési érték: discard (`_ = …`).
- Mezők `readonly`-k, ha a konstruktor után nem változnak.

## 3. Elnevezés

| Mi | Forma | Példa |
| --- | --- | --- |
| Típus, metódus, property, esemény | PascalCase | `VideoService`, `GetVideosWithSegments` |
| Interfész | `I` + PascalCase | `IVideoService`, `IRepository<TEntity>` |
| Privát mező | `_camelCase` | `_videoRepository` |
| Paraméter, lokális változó | camelCase | `segmentItems`, `newVideo` |
| Generikus típusparaméter | `T` + szerep | `TEntity` |
| Aszinkron metódus | `Async` végződés | `GetVideosAsync` |
| Logikai metódus vagy property | kérdésként olvasható | `IsValid`, `IsPublished`, `CanDelete` |
| Service | `<Domén>Service : I<Domén>Service` | `VideoService : IVideoService` |
| Repository | generikus: `Repository<TEntity> : IRepository<TEntity>` | |
| Bemeneti/szerkesztési adatobjektum | `<Domén>Dto` | `VideoDto`, `SegmentDto` |
| Listás megjelenítési modell | `<Domén>VmList`, beágyazott elemre `<Domén>InfoVmList` | `VideoVmList`, `VideoInfoVmList` |
| Controller | `<Domén>Controller`, többes számú doménnel | `VideosController` |
| Options osztály | `<Név>Options`, `SectionName` konstanssal | `FrontendOptions` |
| Repository-mező a service-ben | `_<entitás>Repository` | `_segmentRepository` |

Egy név önmagában is mondja meg, mi ez és mire való (domén + szerep). Ne legyen `data`, `item2`,
`temp`, `flag`. Ne adj egy repositorynak `_categoryService` nevet. Projektnév, namespace és mappa
ugyanazt a helyesen írt szót használja.

## 4. Fájlok, mappák, namespace-ek

- Fájlonként egy fő típus, a fájl neve a típus neve. Kivétel: a hozzá tartozó kis beágyazott
  adattípus (például `VideoVmList` mellett `VideoInfoVmList`) mehet ugyanabba a fájlba.
- A namespace a projekt gyökér-namespace-ével kezdődik, és követi a mappát:
  `MonikaAdmin.Core/Models/Business/Dtos/VideoDto.cs` → `namespace MonikaAdmin.Core.Models.Business.Dtos;`
- Interfészek külön mappában a Core projektben, szerep szerint: `Interfaces/Business/`,
  `Interfaces/Repository/`.
- Modellek szerep szerint: `Models/Domain/` (entitások), `Models/Business/` (megjelenítési modellek),
  `Models/Business/Dtos/` (DTO-k).
- A teljes mappatérkép: `conventions/architecture.md`.
- `<Nullable>enable</Nullable>` és `<ImplicitUsings>enable</ImplicitUsings>` minden projektben (a
  `Directory.Build.props` adja). Fájlszintű `#nullable` kapcsolót ne használj.

## 5. Rétegek

```
Core            entitások, DTO-k, megjelenítési modellek, interfészek; nem hivatkozik más projektre
Repository      DbContext és a generikus repository; csak a Core-ra hivatkozik
Business        a service-ek (a Core interfészeinek implementációi); a Core-ra hivatkozik
Api (host)      controllerek, options, DI-összerakás (composition root); mindenre hivatkozhat
```

- A függőségek a Core felé mutatnak. A Business és a Repository nem hivatkozik egymásra, mindkettő a
  Core interfészein keresztül beszél.
- A controller csak service-interfészt kap, repositoryt vagy DbContextet soha.
- Az entitás nem megy ki az API-n. A service DTO-t vagy `VmList`-et ad vissza, és a leképezés a
  service-ben, egy helyen történik.

## 6. Osztályok felépítése

A service-ekben és a controllerekben a tagok sorrendje `#region` blokkokkal, mindig ugyanígy:

```csharp
public class VideoService : IVideoService
{
    #region Private members

    private readonly IRepository<Video> _videoRepository;
    private readonly IUnitOfWork _unitOfWork;

    #endregion

    #region Constructor

    public VideoService(
        IRepository<Video> videoRepository,
        IUnitOfWork unitOfWork)
    {
        _videoRepository = videoRepository;
        _unitOfWork = unitOfWork;
    }

    #endregion

    public async Task<VideoVmList[]> GetVideosAsync(CancellationToken cancellationToken)
    {
        …
    }
}
```

- Konstruktoros injektálás, `private readonly` mezőkbe. Több paraméternél mindegyik külön sorban.

## 7. Adatelérés (EF Core)

- Generikus repository: `IRepository<TEntity>` a Core-ban, `Repository<TEntity>` a Repository
  projektben: `GetAll`, `GetAllIncluding(params …)`, `Find(predicate)`, `Add`, `AddRange`,
  `Remove`, `Update`.
- A lekérdező metódusok `IQueryable<T>`-t adnak vissza. A service építi tovább (`Include`, `Select`),
  és ő materializál (`ToArrayAsync()`).
- Listát a service tömbként ad vissza (`T[]`), nem `List<T>`-ként.
- Leképezés: `Select(x => new XVmList { … })` projekcióval a lekérdezésben, nem betöltés utáni
  ciklussal.
- Keresés azonosító alapján: `Find(x => x.Id == id).FirstOrDefaultAsync()`, utána null-ellenőrzés. Nem
  létező elemre a módosító metódus csendben visszatér, a törlő `bool`-t ad (`false` = nem sikerült).
- **Egy felhasználói művelet = egy `SaveChanges`.** A repository nem commitol. A service végzi el az
  összes változtatást, aztán egyszer ment az injektált `IUnitOfWork.SaveChangesAsync()`-kel (lásd
  `commit-side-effect-order`).
- Code-first: a modellváltozás és a migráció ugyanabban a commitban van. Entitás-konfiguráció
  `IEntityTypeConfiguration<T>`-vel a `Configurations/` mappában, nem az `OnModelCreating`-ben.
- A connection string konfigurációból jön (`appsettings.json`, user secrets), kódban nincs.
- Igaz/hamis értéket `bool`-ként tárolj, dátumot dátumtípusként. `sbyte` jelzőt és szöveges dátumot
  ne használj.

## 8. Web API

- Controllerek `[ApiController]` attribútummal, a `Controllers/` mappában.
- A controller vékony: bemenet → service-hívás → válasz. Üzleti logika és leképezés a service-ben.
- Aszinkron végpont: `async Task<…>`, `Async` végződésű service-metódus, és a `CancellationToken`
  végigmegy a hívási láncon. `async void` soha.
- Minden válasz- és hibakódot deklarálj (`[ProducesResponseType]` vagy `TypedResults`). Hiba
  ProblemDetails formában megy ki, saját hibatest-formátum nincs.
- Nem létező elemre `404`, sikeres törlésre `204`, létrehozásra `201` a `Location` fejléccel.
- A felhasználónak szóló hibaüzenet magyarul a ProblemDetails `detail` mezőjébe kerül.
- Végpont vagy DTO változásakor az `openapi/monika-admin-api.json` diffje a commit része
  (`api-spec-fidelity`).

## 9. Validáció

- A bemeneti DTO data annotationöket kap (`[Required]`, `[MaxLength]`, `[Range]`). Az
  `[ApiController]` érvénytelen bemenetre automatikusan 400-at ad ProblemDetails-szel.
- Ami annotációval nem írható le (több mező együtt, adatbázis-állapot), azt a service ellenőrzi, és
  a controller 400-at vagy 409-et ad.
- A határokat a bemenetnél ellenőrizd (kérés), nem a service mélyén.
- A hibaüzenet a felhasználó nyelvén szól, és megmondja a szabályt („A címnek legalább 4 karakteresnek
  kell lennie”).

## 10. Dependency injection

- Egy composition root (`Program.cs`), csoportosítva és megjegyzéssel jelölve: DbContext →
  konfiguráció (`Configure<TOptions>`) → repositoryk → business service-ek → Web API.
- Repository: egyetlen nyitott generikus regisztráció, `services.AddScoped(typeof(IRepository<>), typeof(Repository<>));`.
  Ugyanazt a service-t ne regisztráld két különböző élettartammal.
- Élettartamok: a DbContext és ami használja (`IUnitOfWork`, repositoryk, business service-ek)
  `Scoped`, vagyis kérésenként egy. Singleton csak állapot nélküli vagy app-szintű adatot tartó
  szolgáltatás lehet.
- Háttérmunkában (`BackgroundService`, `IHostedService`) a scoped service-eket műveletenként egy
  `IServiceScopeFactory.CreateScope()`-ból kérd, ne a gyökér-providerből (lásd
  `lifetime-matched-injection`).
- Beállítás az options patternnel (`IOptions<T>`), nem statikus mezőből.

## 11. Dokumentáció és kommentek

- Minden publikus service-interfész metódusa kap XML dokumentációt, magyarul, teljes mondattal és
  ponttal: `<summary>`, minden paraméterhez `<param>`, és `<returns>`, ha van visszatérési érték.
  Az implementáció nem ismétli meg.

```csharp
/// <summary>
/// Videó törlése.
/// </summary>
/// <param name="id">Videó azonosító.</param>
/// <param name="cancellationToken">A művelet megszakítására szolgáló token.</param>
/// <returns>Igaz, ha a videó létezett és törlődött.</returns>
Task<bool> DeleteVideoAsync(int id, CancellationToken cancellationToken);
```

- Komment csak a nem nyilvánvaló „miért”-hez. Ami a következő sorból látszik, azt ne írd le.
- Generált vagy sablonból jött kód kommentjeit nem kell lefordítani. Saját kódban magyarul írj.
- `#pragma warning disable` és `null!` csak indoklással, egy sorral felette.

---

## 12. Contractok (hibaosztályok)

Mindegyik olyan hiba, amit a fordító és a linter nem jelez, de drága. Ha a változtatásod érinti a
„mikor” részt, menj végig a „hogyan ellenőrizd” lépésen. Mind jelölt (`candidate`): egy valódi
incidens erősíti meg, vagy kikerül.

### emit-hygiene: zajmentes kód
**Mikor:** bármilyen kód írásakor.
**Ellenőrizd:** minden kommentnél kérdezd meg, hogy „miért”-et magyaráz-e. Minden új függvénynél,
hogy egynél több hívója van-e. Minden guardnál, hogy melyik valódi bemenet éri el.
**Tedd:** töröld a narráló kommenteket, olvaszd vissza az egyszer használt segédfüggvényt, és kövesd
a fájl meglévő stílusát.

### self-descriptive-naming: önmagáért beszélő nevek
**Mikor:** bármi elnevezésekor.
**Ellenőrizd:** egy keresési találatban, önmagában olvasva is kiderül-e a névből, mi ez és mire
való?
**Tedd:** név = domén + szerep. Logikai érték kérdésként olvasható. Amihez a diffed nem nyúlt, azt
ne nevezd át.

### logic-over-surface: szabály a hibaosztályról, ne az API-ról
**Mikor:** szabály, contract vagy convention írásakor.
**Ellenőrizd:** mi tört el, mi a gyökérok, mi a hibaosztály, és hogyan találja meg más a következő
esetet.
**Tedd:** a konkrét API-név legfeljebb példaként szerepeljen. Amit a fordító vagy a hivatalos
dokumentáció már elmond, abból nem kell szabály.

### lifetime-matched-injection: az élettartamok egyezzenek
**Mikor:** service regisztrálásakor, singleton vagy cache írásakor, háttérmunkánál, eseménykezelőnél.
**Ellenőrizd:** minden regisztrációnál nevezz meg két élettartamot: a tartóét (folyamat, scope,
kérés) és az adatét (app, felhasználó, kérés, művelet). Egyezniük kell. A gyökér-providerből vagy
statikus service locatorból feloldott scoped service valójában singleton.
**Tedd:** scoped service-t ne tarts singletonban, statikus mezőben vagy `BackgroundService`-ben.
Használj `IServiceScopeFactory`-t vagy `IDbContextFactory<T>`-t műveletenként. Az eseménykezelőt
és a timert a tulajdonosa szüntesse meg.

### commit-side-effect-order: egy művelet, egy commit, utána a mellékhatás
**Mikor:** `SaveChanges`, többlépéses írás vagy törlés, e-mail, üzenet, HTTP-hívás, újrapróbálás.
**Ellenőrizd:** írd fel sorban a commitokat és a külső hatásokat. Mi marad, ha a folyamat bármelyik
után leáll? Mi történik, ha kétszer fut le?
**Tedd:** egy felhasználói művelethez egy `SaveChanges` vagy egy explicit tranzakció tartozzon. A
repository ne commitoljon. A külső hatás a commit után jöjjön, vagy outboxon keresztül. Az
újrapróbált művelet legyen idempotens.

### lost-update: elveszett módosítás
**Mikor:** update végpont (PUT/PATCH), kapcsoló (toggle), számláló változtatása, háttérfolyamat
ugyanazokon a sorokon.
**Ellenőrizd:** kerülhet-e egy második szereplő az olvasás és a mentés közé? Ha igen, miből venné
észre a második mentés?
**Tedd:** konkurens szerkesztésnél concurrency token (`rowversion`), a
`DbUpdateConcurrencyException` kezelése és `409`-es válasz, amit a frontend kezel. Számláló és
kapcsoló az adatbázisban változzon (`ExecuteUpdate`, `SET x = x - 1`), ne memóriában. Csak a
módosított mezőket mentsd.

### nullability-across-layers: nullability minden rétegben ugyanaz
**Mikor:** új vagy módosított mező, oszlop, DTO, leképezés.
**Ellenőrizd:** kövesd végig a mezőt entitás → oszlop → DTO → leképezés → OpenAPI spec →
TypeScript-típus. Mindenhol ugyanaz a nullability, vagy egyetlen explicit leképezés dönt. Minden
`null!`, `!` és elnyomott CS86xx figyelmeztetés mellé kell indoklás.
**Tedd:** `<Nullable>enable</Nullable>`. A nullabilityről egyszer dönts, az igazság forrásánál
(általában az oszlopnál). Ne `!`-lel tedd zölddé a buildet.

### time-kind: az idő fajtája
**Mikor:** `DateTime`, `DateTimeOffset`, `DateOnly`, `TimeSpan`, szövegként tárolt dátum, időzóna,
dátum JSON-ban.
**Ellenőrizd:** minden időmezőnél nevezd meg a fajtáját: pillanat, naptári nap, faliórás idő vagy
időtartam. Utána nézd meg, hogy a C# típus, az oszlop és a JSON formátum ehhez illik-e.
**Tedd:** pillanatra `DateTimeOffset` vagy UTC `DateTime`, naptári napra `DateOnly`, időtartamra
`TimeSpan`. Dátumot ne tárolj szövegként. Tesztelhető időhöz injektált `TimeProvider`.

### migration-history: a séma története közös állapot
**Mikor:** migráció, ModelSnapshot, modellváltozás, sémaszkript, modellt érintő ágak merge-e.
**Ellenőrizd:** minden migrációról mondd meg, hol futott már (helyben, közös adatbázison, élesben).
Merge után: `dotnet ef migrations has-pending-model-changes`. Olvasd el az `Up`-ot és a `Down`-t, és
keresd az adatvesztő lépéseket.
**Tedd:** olyan migrációt, ami már futott máshol, ne szerkessz, inkább adj hozzá újat. Párhuzamos
ágaknál a későbbit generáld újra. A modell és a migráció egy commitban legyen.

### api-spec-fidelity: az OpenAPI spec ne hazudjon
**Mikor:** végpont, DTO, enum, JSON-beállítás vagy OpenAPI-dokumentum változásakor.
**Ellenőrizd:** minden megváltozott végpontnál tégy egy valódi választ a sémája mellé (státuszkódok,
kötelező mezők, nullability, enum, dátumformátum, hibatest).
**Tedd:** a spec a kódból generálódjon, és legyen commitolva (`openapi/monika-admin-api.json`).
Minden választípust és hibakódot deklarálj. Törő változást ugyanabban a PR-ben jelezz a
frontendnek.

### openapi-client-consumption: generált kliens fogyasztása
**Mikor:** generált API-kliens vagy az általa visszaadott adat érintésekor.
**Ellenőrizd:** ha hiányzik egy mező, vagy rossz az alakja, hasonlítsd össze a valódi választ a
spec-kel. Ha eltérnek, a spec a hiba.
**Tedd:** a spec-et javítsd, aztán generálj újra. A hívás helyén a guard csak ideiglenes híd lehet,
egy linkkel a javításhoz. DTO → modell leképezés DTO-nként egy helyen legyen.

### dotnet-tooling: eszköz kiesése ne legyen csendes
**Mikor:** az SDK, a `dotnet-ef`, az LSP vagy egy MCP szerver nem érhető el, vagy a projekt itt nem
buildelhető.
**Ellenőrizd:** melyik eszköz válaszolt ténylegesen?
**Tedd:** egyszer mondd ki, használd a tartalékmegoldást, és a végső jelentésben sorold fel, mit nem
lehetett ellenőrizni.

---

## 13. Amit ne vigyél tovább

Ezek gyakori minták más C# kódbázisokból. Új kódba ne másold őket, a jobb oldali oszlop szerint írd
meg helyettük.

| Talált minta | Miért baj | Helyette |
| --- | --- | --- |
| A repository `Add`/`Update`/`Remove` metódusa maga hívja a `SaveChanges`-t | Egy törlés vagy mentés több külön commit lesz, és félúton elakadhat (`commit-side-effect-order`) | A repository csak változtat, a service a végén egyszer ment |
| Scoped DbContext és repository a gyökér-providerből (`app.Services.GetService<T>()` scope nélkül) | A DbContext a folyamat végéig él, régi adatot és változáskövetést hordoz (`lifetime-matched-injection`) | Scope műveletenként, vagy `IDbContextFactory<T>` |
| Ugyanaz a repository nyitott generikusként `Scoped`, zártként `Transient` regisztrálva | Típusonként más élettartam, kiszámíthatatlan viselkedés | Egy nyitott generikus regisztráció, egy élettartammal |
| Connection string a kódban (`UseSqlServer("server=…;pwd=…")`) | Jelszó kerülhet a repóba, és környezetenként nem állítható | `appsettings.json` / user secrets, `GetConnectionString` |
| Dátum `string`-ként az entitásban | Szövegként rendeződik és hasonlít (`time-kind`) | `DateOnly` / `DateTime` / `TimeSpan` és megfelelő oszlop |
| `sbyte Inactive` / `Popular` jelző, megjelenítéskor szöveggé alakítva | A típus nem mondja meg a jelentést, a UI-szöveg a service-ben keletkezik | `bool IsInactive`, a megjelenítési szöveg a frontendben |
| Kapcsolás memóriában: beolvasás, `0 ↔ 1` csere, teljes `Update` | Két kattintás vagy két felhasználó felülírja egymást (`lost-update`) | Feltételes update az adatbázisban, vagy concurrency token |
| `async void` metódus | A kivétel összeomlasztja a folyamatot, és nem lehet rá várni | `async Task` |
| Ugyanaz a törlő service-hívás kétszer (egyszer a feltételben, egyszer a törzsben) | Kétszer fut a mellékhatás | Egyszer hívd, és az eredményét használd |
| `if (feltétel) return true; else return false;` | Zaj | `return feltétel;` |
| Varázsszöveg összehasonlításra (`value.Name == "Összes"`) | Fordítás vagy átnevezés után csendben eltörik | Külön jelző (`Id == 0`) vagy konstans |
| Varázs alapérték (`Price ?? 10000`) | Rejtett üzleti szabály | Kötelező mező validációval, vagy nevesített konstans |
| Méret `Dictionary<string, int>` kulccsal, utána `int.Parse` | Felesleges konverzió, futásidejű hibalehetőség | `Dictionary<int, int>` vagy saját típus |
| `#pragma warning disable CS8603` és `= null!` a nullable figyelmeztetésre | Elrejti a valódi null-utat (`nullability-across-layers`) | A visszatérési típus legyen `T?`, és a hívó kezelje |
| Egy projektben ki van kapcsolva a `Nullable` | Abban a projektben nincs null-ellenőrzés | `<Nullable>enable</Nullable>` mindenhol |
| Elírt projektnév és eltérő namespace (`…Repositrory` projekt, `…Repository` namespace) | A keresés és a navigáció félrevezet | Projekt, mappa és namespace ugyanazzal a helyes névvel |
| Repository-mező `_categoryService` néven | A név mást mond, mint ami a mező | `_categoryRepository` |
