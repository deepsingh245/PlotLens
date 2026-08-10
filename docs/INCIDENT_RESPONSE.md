# Incident Response

## Process

```text
Detect
 ↓
Contain
 ↓
Preserve evidence
 ↓
Rotate credentials
 ↓
Assess affected data
 ↓
Determine reporting obligations
 ↓
Remediate
 ↓
Verify
 ↓
Document
```

## Notes per step

- **Detect:** via monitoring/alerts (see [SECURITY.md](SECURITY.md) §Logging) once they exist; for the current pre-development/personal-MVP stage, detection is manual/ad hoc — revisit this when the app is actually running.
- **Contain:** disable the affected access path (revoke a key, tighten a Firestore rule, take a feature offline) before investigating further.
- **Preserve evidence:** capture logs/state before rotating credentials or changing rules, where feasible, so root cause can still be determined afterward.
- **Rotate credentials:** any key/token that may have been exposed — see rotation procedure fields in [SECURITY.md](SECURITY.md) §API key security.
- **Assess affected data:** cross-reference against [DATA_CLASSIFICATION.md](DATA_CLASSIFICATION.md) — SENSITIVE/SECRET-level exposure changes the response urgency and reporting analysis.
- **Determine reporting obligations:** CERT-In directions under Section 70B and any DPDP breach-notification requirements apply once relevant thresholds/scope are met — see [COMPLIANCE.md](COMPLIANCE.md). This determination should involve a qualified reviewer once the app has real users beyond the owner; do not self-assess a genuine breach's legal obligations from this document alone.
- **Remediate:** fix the underlying cause, not just the symptom (e.g. don't just delete a leaked key — fix why it was committed).
- **Verify:** confirm the fix actually closes the gap (re-run the relevant [SECURITY_TEST_PLAN.md](SECURITY_TEST_PLAN.md) row).
- **Document:** add an entry to [CHANGELOG.md](../CHANGELOG.md) under a `### Security` heading, and update this file or [THREAT_MODEL.md](THREAT_MODEL.md) if the incident reveals a new threat category.

## Current status

No incident response tooling (monitoring, alerting, on-call) exists yet — this is expected at the pre-development stage. This process is the plan to follow once something does go wrong, even manually, starting from day one of real usage.
