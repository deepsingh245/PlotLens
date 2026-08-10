# Privacy

Privacy source of truth. Regulatory detail lives in [COMPLIANCE.md](COMPLIANCE.md); classification levels in [DATA_CLASSIFICATION.md](DATA_CLASSIFICATION.md); retention rules in [DATA_RETENTION.md](DATA_RETENTION.md). This file covers what data PlotLens touches and the default privacy posture.

## Current risk profile

Private/personal MVP · owner-only access · potentially sensitive property locations · potentially sensitive photos/documents/notes · third-party map/GIS providers in the loop · possible personal data if the owner records names/contacts in notes · no payments initially · public sharing OFF initially.

**Build private-by-default even though only one person uses it today** — habits formed now are the habits the app ships with later.

## Data inventory

| Data | Example | Classification |
|---|---|---|
| Account ID | Firebase UID | Private |
| Email | account email | Personal |
| Property coordinates | exact location | Sensitive |
| Photos | uploaded JPG | Sensitive |
| PDFs | property documents | Sensitive |
| Notes | investigation notes | Sensitive |
| GeoJSON | boundary | Sensitive |
| API credentials | provider token | Secret |
| Government dataset | public layer | Public/third-party |

Full classification-level definitions in [DATA_CLASSIFICATION.md](DATA_CLASSIFICATION.md).

## Data minimization

Do not collect: phone numbers, Aadhaar/PAN/passport numbers, bank information, continuous GPS history, contacts, or identity documents — unless a specific, documented future feature actually requires one of these. If the app only needs a property point, don't build location tracking beyond that point. If arbitrary PDF upload is allowed (it is, for property documents), warn users in the UI against uploading identity/financial documents they don't need to.

## Privacy defaults

```text
Projects       PRIVATE
Uploads        PRIVATE
Annotations    PRIVATE
Coordinates    PRIVATE
Notes          PRIVATE
Exports        PRIVATE
Sharing        OFF
```

Public sharing is explicitly not implemented in v0.1 (see [PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md) non-goals). If added later, `Private` / `Unlisted` / `Public` must be distinct, explicit states, with a pre-launch checklist covering: sensitive-data warning, private attachments excluded from shared views, EXIF reviewed, coordinate-precision option, link revocation, and access logging.

## Photos and EXIF

Uploaded photos can carry embedded GPS coordinates and device metadata. Consider stripping EXIF before any future public-sharing feature; for the private MVP this is lower priority but should not be forgotten when sharing is designed.

## AI and privacy (Phase 9, not yet built)

Never send private documents to an AI provider by default without a documented reason. Review the AI provider's data retention, training-use, and data-location/transfer terms before adopting one — see [THIRD_PARTY_RISK.md](THIRD_PARTY_RISK.md).

### Prompt injection

Imported content (PDF text, KML/GeoJSON properties, web page content, notes) is **data**, never **instructions**. Any future AI feature must not obey instructions embedded inside uploaded/imported content.

## Property data privacy

A single property investigation can combine exact coordinates, photos, and private notes into something far more sensitive than any one piece alone. Treat a full property project as private-by-default and avoid features that would casually expose the combination (e.g. a "shareable link" that doesn't let the user exclude attachments).

## Account deletion (design requirement, not yet implemented)

When implemented, deleting an account must delete: the auth account, Firestore records, Storage files, any derived files, search/index records, and (where applicable) AI/provider-held data — with backup retention explicitly documented rather than assumed. See [DATA_RETENTION.md](DATA_RETENTION.md).

## Regulatory context

See [COMPLIANCE.md](COMPLIANCE.md) for DPDP 2023/2025, IT Act, and CERT-In considerations. This file is the practical/product-facing privacy posture; that file is the regulatory register.
