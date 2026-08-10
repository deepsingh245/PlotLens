# Compliance

Regulatory register for PlotLens. **This is an engineering-maintained tracking document, not legal advice** — re-review with a qualified Indian lawyer before any public or commercial launch, per [research/security-privacy-compliance-checklist-raw.md](research/security-privacy-compliance-checklist-raw.md) header note.

## Compliance areas to track

- Digital Personal Data Protection Act, 2023 (DPDP Act)
- Digital Personal Data Protection Rules, 2025 (notified by MeitY on 14 November 2025, staged commencement — re-check the current enforcement timeline before relying on any date here)
- IT Act / applicable rules
- CERT-In directions (Section 70B)
- Copyright and database/map licensing
- Provider API/SDK terms (per-provider, see [DATA_SOURCES.md](DATA_SOURCES.md))
- Government Open Data License — India (GODL)
- OpenStreetMap licensing/tile policy
- Cloud/AI provider terms

## Current status

**Personal MVP, single owner, no public users, no payments.** Most DPDP/commercial-compliance obligations scale with public/commercial exposure — see gates below. Do not defer basic privacy-by-design (see [PRIVACY.md](PRIVACY.md)) just because formal DPDP obligations haven't triggered yet; retrofitting privacy is much harder than building it in from the start.

## DPDP readiness (prepare ahead of any public exposure)

If/when PlotLens's processing falls within DPDP scope: personal-data inventory (start from [PRIVACY.md](PRIVACY.md) data inventory), purpose definition, lawful-basis/consent analysis, required notices, data minimization (already a design principle), security safeguards ([SECURITY.md](SECURITY.md)), retention/deletion ([DATA_RETENTION.md](DATA_RETENTION.md)), data-principal rights process, grievance mechanism, processor/vendor controls (Firebase, any AI provider), breach process ([INCIDENT_RESPONSE.md](INCIDENT_RESPONSE.md)).

## Government data licensing

The Government Open Data License — India (GODL) grants broad reuse rights for covered datasets, subject to attribution, and explicitly excludes categories such as personal information, sensitive/non-shareable data, official symbols, and certain third-party rights. For every government dataset used (see [DATA_SOURCES.md](DATA_SOURCES.md)): confirm the exact dataset is identified, license checked, attribution checked, exemptions checked, third-party content checked, modification/redistribution rights checked, accuracy/disclaimer checked.

## OSM compliance

OSM data itself is free (ODbL), but the public tile service carries usage restrictions (visible attribution, no abusive/bulk/offline tile-fetching). See [DATA_SOURCES.md](DATA_SOURCES.md) OSM entry and [SECURITY.md](SECURITY.md).

## Commercial map provider compliance

For any commercial provider (Mapbox, Mappls, etc.) adopted later: terms reviewed, attribution requirements, rate limits, pricing, key restrictions, tile/geocoding caching restrictions, export restrictions, offline-use restrictions. Visible browser map data is not automatically ours to download or repackage — see [DATA_SOURCES.md](DATA_SOURCES.md).

## Copyright

Track rights for every asset category PlotLens touches: satellite imagery, old maps, PDFs, photos, planning maps, GIS layers, icons, fonts, third-party datasets. Uploading a file to PlotLens does not grant PlotLens rights to publish, redistribute, sell, or use that content to train an AI model — see [LICENSES_AND_ATTRIBUTION.md](LICENSES_AND_ATTRIBUTION.md).

## Standards to use as roadmaps (not immediate requirements)

- **OWASP ASVS 5.0.0** — comprehensive web-application security control baseline; use as the eventual roadmap, not something to fully implement immediately.
- **OWASP LLMSVS 2.0** — if/when AI features (Phase 9) are added, use this as the LLM-application security review baseline (prompt injection, RAG, tool-calling, connector risks).

## Compliance status tracking

Every control in this file and [SECURITY_TEST_PLAN.md](SECURITY_TEST_PLAN.md) should carry one of: `NOT_STARTED`, `PLANNED`, `IMPLEMENTED`, `TESTED`, `VERIFIED`, `NOT_APPLICABLE`. As of this writing (2026-08-10), essentially everything is `NOT_STARTED` or `PLANNED` — this is expected at the pre-development stage and should be updated as Phase 1+ implementation proceeds.

## Gates before increasing exposure

**Public beta gate:** Privacy Policy, Terms of Use, retention policy, account deletion, security review, dependency scanning, rate limiting, monitoring, incident response, provider terms verified, government licensing verified, upload security reviewed, privacy review, AI-provider review if applicable.

**Commercial gate:** DPDP applicability/legal review, privacy compliance review, vendor/processor contracts where needed, security assessment, penetration test, incident response, customer deletion process, backup policy, provider commercial licenses, map licensing, government-data commercial-use verification, legal review.

Neither gate applies yet — PlotLens has not shipped a public beta or commercial offering. They're recorded here so they aren't forgotten later.
