# Threat Model

## Assets

```text
account
projects (and everything nested under them)
exact coordinates
uploaded documents/photos
API keys / provider credentials
Firebase project (infrastructure-level access)
government/open datasets (integrity of what's displayed)
AI credentials (Phase 9)
```

## Threats and mitigations

| Threat | Prevent | Detect | Respond |
|---|---|---|---|
| Account takeover | Firebase Auth, no custom password storage, secure session handling | failed-login logging | rotate session, notify, see [INCIDENT_RESPONSE.md](INCIDENT_RESPONSE.md) |
| IDOR (cross-user data access) | ownership checks on every resource, deny-by-default Firestore/Storage rules | IDOR test suite ([SECURITY_TEST_PLAN.md](SECURITY_TEST_PLAN.md)) run pre-release | audit affected records, patch rule, notify if data was exposed |
| Data leak (misconfigured rules/storage) | locked rules from day one, Emulator-tested before deploy | monitoring/alerts on unusual read volume | rotate any exposed credentials, assess scope, see [INCIDENT_RESPONSE.md](INCIDENT_RESPONSE.md) |
| Malicious upload (crafted image/PDF/KML/GeoJSON) | allowlist + signature validation + parser limits ([SECURITY.md](SECURITY.md) §File upload / GIS file security) | parser error monitoring | reject, do not attempt to "repair" untrusted input |
| SSRF via provider/WMS URL | explicit domain allowlist, no arbitrary server-side fetch ([SECURITY.md](SECURITY.md) §SSRF) | anomalous outbound-request monitoring once it exists | block offending request path, audit provider adapter code |
| XSS via annotation/note/layer-name fields | framework escaping, never render raw HTML from user content | — | patch render path, audit stored content for injected scripts |
| CSRF | SameSite cookies, origin checks if cookie-based sessions are used | — | invalidate sessions, patch |
| API abuse / cost abuse | rate limits, quotas, per-user limits, billing alerts | usage/cost monitoring | throttle, revoke abused key, adjust quota |
| Secret leakage (committed key, exposed env) | `.env.local` gitignored, secret scanning in CI once CI exists | CI secret-scan failure | rotate immediately, audit usage during exposure window |
| Dependency compromise | vet before adding ([SECURITY.md](SECURITY.md) §Dependency security), lockfiles, periodic audit | dependency vulnerability alerts | patch/pin, audit blast radius |
| Prompt injection (Phase 9) | treat imported content as data, never instructions ([PRIVACY.md](PRIVACY.md) §Prompt injection) | — | review AI output before it drives any action |
| DoS / resource exhaustion (huge GeoJSON, ZIP bomb, giant image) | size/complexity limits at every input boundary ([SECURITY.md](SECURITY.md) §Resource exhaustion) | error-rate/latency monitoring | reject oversized input, add/tighten limit |
| Government-data misrepresentation (stale/wrong layer shown as current) | source metadata tracking, "last verified" display, no fabricated accuracy | — | mark layer unavailable/stale, correct or remove |

## Out of scope for this threat model (for now)

Nation-state-level adversaries, physical security of the developer's machine, and threats specific to a public multi-tenant deployment that doesn't exist yet (this app currently has a single owner-user). Revisit this document before any public-beta or commercial launch — see gates in [COMPLIANCE.md](COMPLIANCE.md).
