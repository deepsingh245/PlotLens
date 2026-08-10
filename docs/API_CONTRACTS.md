# API Contracts

Internal API surface truth. No endpoints exist yet — this document is the place to record them as they're built, so no route gets created without being documented here. Do not create an endpoint that isn't listed here; add it here first (or in the same change).

## Implemented

### GET /api/geocode

Purpose: server-side proxy to Nominatim for explicit-submit location search (see [DATA_SOURCES.md](DATA_SOURCES.md)'s Nominatim entry — client-side autocomplete is prohibited by policy, so this is called on explicit submit only, never per keystroke).
Auth required: no (read-only, public place-name search; no user data involved)
Ownership check: n/a
Request: `?q=<query text>`
Response: `{ results: [{ label: string, lngLat: { lng: number, lat: number } }] }` or `{ error: string }`
Rate limit: throttled server-side to ≤1 req/sec to Nominatim (see [SECURITY.md](SECURITY.md) §Rate limiting); returns `429` if called faster than that
Added: 2026-08-10, Phase 1

## Expected shape (planned, not yet implemented)

```text
POST   /api/projects
GET    /api/projects/:id
PATCH  /api/projects/:id
DELETE /api/projects/:id

POST   /api/overlays
PATCH  /api/overlays/:id
DELETE /api/overlays/:id

POST   /api/import/geojson
GET    /api/export/geojson/:projectId

GET    /api/providers
GET    /api/providers/:id/layers
```

## Rules for every endpoint added here

- **Authentication + authorization on every route** — never rely on frontend checks alone (see [SECURITY.md](SECURITY.md) §API Security).
- **Ownership check on every resource access** — a project/overlay/annotation ID in the URL must be verified as belonging to the requesting user, not merely "exists" (IDOR — see [SECURITY_TEST_PLAN.md](SECURITY_TEST_PLAN.md)).
- **Input validation** per [DATA_MODEL.md](DATA_MODEL.md) validation rules — never trust a payload just because it came from our own frontend.
- **Rate limiting** on anything that triggers external-provider calls, uploads, imports, or exports.
- **No server-side fetch of an arbitrary client-supplied URL** — see [SECURITY.md](SECURITY.md) §SSRF.

## Template for a new entry

```text
### METHOD /api/path

Purpose:
Auth required: yes/no
Ownership check: <resource> must belong to requesting user
Request body: { ... }
Response: { ... }
Rate limit: <policy>
Added: <date>, <phase>
```
