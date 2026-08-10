# Security Test Plan

The test matrix that must pass before any feature involving auth, storage, or external data ships. Pairs with [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md)'s security section and [THREAT_MODEL.md](THREAT_MODEL.md).

| Test | Expected result |
|---|---|
| Unauthenticated Firestore read | Denied |
| User A reads User B's project | Denied |
| User A edits User B's project | Denied |
| User A deletes User B's project | Denied |
| User A downloads User B's file | Denied |
| Oversized upload | Denied |
| Wrong file type / MIME mismatch | Denied |
| Malicious filename (path traversal attempt) | Sanitized/rejected |
| ZIP bomb (KMZ) | Rejected |
| SSRF attempt targeting localhost | Denied |
| SSRF attempt targeting cloud metadata endpoint | Denied |
| XSS payload in annotation/note text | Escaped, not executed |
| `javascript:` scheme in a user-entered link | Rejected |
| Invalid/malformed GeoJSON | Rejected |
| Oversized/deeply-nested GeoJSON | Rejected |
| Invalid/unexpected provider response (WMS/WFS) | Safe failure — "layer unavailable" state, no crash, no silent wrong data |
| Secret committed to source | CI fails (once secret scanning exists) |

## How to run these

Use the Firebase Emulator Suite for Firestore/Storage rule tests — do not test security by repeatedly changing production rules. Add these as automated tests under `tests/integration/` and `tests/unit/` (see [ARCHITECTURE.md](ARCHITECTURE.md) module layout) as each corresponding feature is implemented; a feature is not "done" if its row in this table hasn't been exercised.

## Minimum test coverage by category (from PRE-dev checklist)

- **GIS:** longitude/latitude ordering, distance, area, polygon validity, coordinate conversion, image-corner serialization — see [GIS_ARCHITECTURE.md](GIS_ARCHITECTURE.md) §Testing requirements.
- **Security:** the IDOR/upload/SSRF/XSS rows above.
- **Provider:** provider unavailable, invalid response, timeout, malformed GeoJSON, WMS failure — see [PROVIDER_ARCHITECTURE.md](PROVIDER_ARCHITECTURE.md) §Rules.
- **UI:** create project, add marker, draw polygon, upload image, move image corners, change opacity, save/reopen — see [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md).
