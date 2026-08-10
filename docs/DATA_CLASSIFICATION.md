# Data Classification

Classification levels used throughout [PRIVACY.md](PRIVACY.md), [SECURITY.md](SECURITY.md), and [DATA_RETENTION.md](DATA_RETENTION.md).

## Levels

```text
PUBLIC       Freely shareable, no restriction (e.g. a government layer's public metadata).
INTERNAL     Not secret, but not meant for outside display (e.g. internal config, non-sensitive logs).
PRIVATE      Belongs to a specific user; access limited to that user (e.g. project names, account ID).
SENSITIVE    Private data with real-world consequence if exposed (e.g. exact coordinates, photos, notes, documents).
SECRET       Must never be exposed to any client or logged (e.g. API keys, service credentials).
```

## Classification by entity

| Entity / field | Level | Notes |
|---|---|---|
| Firebase UID | PRIVATE | |
| Account email | PRIVATE | also "personal data" under DPDP — see [COMPLIANCE.md](COMPLIANCE.md) |
| Project name/description | PRIVATE | |
| `ImageOverlay.coordinates` | SENSITIVE | exact geographic positioning |
| `Annotation.geometry` | SENSITIVE | |
| Uploaded photos/PDFs (`Attachment`) | SENSITIVE | may contain EXIF GPS, personal documents |
| Notes / annotation text | SENSITIVE | may contain names, deal terms, etc. |
| Provider API keys/tokens | SECRET | never in Firestore, never in client bundle unless the provider explicitly designs the key to be public/domain-restricted |
| Government/open dataset content | PUBLIC (usually) | still subject to attribution/license — see [DATA_SOURCES.md](DATA_SOURCES.md) |
| Security/audit logs | INTERNAL | must never contain SECRET-level values — see [SECURITY.md](SECURITY.md) §Logging |

## Handling rules by level

- **SECRET:** environment variables only, server-side unless the provider explicitly designed it for client exposure (domain-restricted token). Never logged, never in Firestore.
- **SENSITIVE:** private Storage/Firestore paths, owner-only access, excluded by default from any future sharing/export feature unless explicitly included by the user.
- **PRIVATE:** owner-only access; no cross-user visibility ever (see IDOR rules in [SECURITY_TEST_PLAN.md](SECURITY_TEST_PLAN.md)).
- **INTERNAL:** not user-facing, but not a security boundary on its own — don't rely on "internal" as a substitute for actual access control.
- **PUBLIC:** still needs attribution/license tracking per [LICENSES_AND_ATTRIBUTION.md](LICENSES_AND_ATTRIBUTION.md) even though it's not access-restricted.

## Rule

When adding a new field to [DATA_MODEL.md](DATA_MODEL.md), classify it here in the same change. An unclassified field defaults to being treated as SENSITIVE until classified — never assume something is safe to expose by default.
