# Data Retention

For every data type, document why it's stored, for how long, who can access it, how it's deleted, and how backups interact with deletion. Classification levels referenced here are defined in [DATA_CLASSIFICATION.md](DATA_CLASSIFICATION.md).

## By data type

| Data type | Why stored | Retention | Deletion |
|---|---|---|---|
| Account (Firebase Auth) | identity/login | until account deletion | Auth record removed on account deletion |
| Projects, layers, annotations, overlays (Firestore) | core application data | until user deletes the project or account | hard-deleted from Firestore on project/account deletion — not soft-archived indefinitely by default |
| Attachments (Storage: photos, PDFs, GeoJSON, KML) | user-uploaded investigation material | until the owning project/annotation is deleted | Storage object removed alongside its Firestore record — orphaned Storage files must not be left behind |
| Security/audit logs | incident investigation, abuse detection | short-to-medium term (exact window TBD when logging infrastructure is built) | rotated/purged on a schedule; never contains SECRET-level values (see [SECURITY.md](SECURITY.md) §Logging) |
| Backups (once backup strategy exists) | disaster recovery | per backup retention policy (TBD) | backup retention must be explicitly documented, not just assumed to "go away eventually" — see [SECURITY.md](SECURITY.md) §Backups |
| Provider caches (GIS layer responses, if cached) | reduce redundant external calls | per provider's caching terms (see [DATA_SOURCES.md](DATA_SOURCES.md)) — never longer than the provider allows | cleared per cache-expiry policy |
| AI request data (Phase 9, not yet built) | processing a natural-language query | not retained beyond the request unless explicitly designed otherwise | see [PRIVACY.md](PRIVACY.md) §AI and privacy before this is implemented |

## Account/project deletion checklist (design requirement)

When account deletion is implemented, it must remove: the Auth account, all Firestore records owned by that account, all Storage files owned by that account, any derived files, and any search/index records — with AI/provider-held data addressed if AI features exist by then. Backup retention beyond the live deletion must be explicitly documented (e.g. "backups roll off after N days") rather than left unspecified.

## Rule

"Delete" must mean delete. A feature that marks something `archivedAt` (see [DATA_MODEL.md](DATA_MODEL.md) `Project.archivedAt`) is not the same as deletion — archived-but-retained data must still be listed here with its own retention answer, not treated as already gone.

## Current status

No retention automation exists yet (no scheduled jobs, no backup pipeline). This document defines the target behavior; implement it as each corresponding feature (project deletion, backups, logging) is built, not in the abstract ahead of time.
