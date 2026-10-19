# 0001: Az API a frontend tagging store-ját követi

**Állapot:** elfogadva · 2026-10-19

## Helyzet

A Monika Admin frontend (`monika-admin/src/app/features/tagging/`) eddig localStorage-ban tartotta a
két táblát (videók, szegmensek). A backend ezt váltja ki. A szabályok a frontend
`.claude/conventions/tagging.md`-jéből és a `tagging.store.ts`-ből jönnek.

## Döntés

Minden store-művelethez egy végpont tartozik, ugyanazzal a viselkedéssel:

| Végpont | A frontend store párja | Viselkedés |
| --- | --- | --- |
| `GET /api/videos` | `videoList` | azonosító szerint rendezve |
| `POST /api/videos` | `addVideo` | 409, ha az azonosító foglalt |
| `PUT /api/videos/{videoId}` | `updateVideo` | új azonosítónál a szegmensek is átkerülnek; 409, ha foglalt |
| `DELETE /api/videos/{videoId}` | `deleteVideo` | csak a videót törli, a szegmensei maradnak |
| `POST /api/videos/import` | `mergeVideos` | azonos azonosító frissül, a többi új; `{ added, updated }` |
| `GET /api/segments?videoId=` | `segmentList` | videó, majd kezdőidő szerint rendezve |
| `POST /api/segments` | `addSegment` | 201 a `Location` fejléccel |
| `PUT /api/segments/{id}` | `updateSegment` | |
| `DELETE /api/segments/{id}` | `deleteSegment` | |
| `POST /api/segments/import` | `mergeSegments` | azonos videó + azonos kezdőidő (másodpercben) frissül, a többi új |

- A CSV/JSON fájl beolvasása és exportja a frontendben marad. Az import végpontok a már feldolgozott
  listát kapják, a frontend `SegmentData` / `Video` alakjában.
- A mezőszabályok a frontend validációjával egyeznek: cím legfeljebb 80 karakter, legalább egy
  téma, leírás legfeljebb 3 mondat, idő `mm:ss` vagy `h:mm:ss`. A hibaüzenetek magyarok, a
  hibakulcsok a JSON mezőnevei.
- A szegmens `id`-ja a backendé (Guid v7), a frontend nem küldi.

## Következmények

- A frontend store a végpontokra cserélhető úgy, hogy a felület viselkedése nem változik.
- Ha a frontend szabálya változik (például új mező vagy más összefésülési kulcs), ezt a táblát, a
  DTO-kat és az `openapi/monika-admin-api.json`-t egy PR-ben kell módosítani (`api-spec-fidelity`).
- Hitelesítés még nincs: a frontend demo bejelentkezése nem hív API-t. Ez a következő ADR.
