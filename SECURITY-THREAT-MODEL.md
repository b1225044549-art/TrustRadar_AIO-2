# TrustRadar AIO 3.0 — Security and Privacy Threat Model

Status: design baseline; requires implementation and independent review.

## Assets to protect

- User accounts, sessions, workspace membership, and role assignments.
- Case notes, indicators, evidence files, reports, and exports.
- Provider API credentials and integration configuration.
- Audit records, backups, and operational logs.

## Main threats and required controls

| Threat | Required control |
|---|---|
| Unauthorized case access | Server-side workspace authorization on every request; deny by default; negative permission tests |
| Credential leakage | Secrets stored server-side in a secret manager or protected environment; never in client bundles, logs, or exports |
| Malicious URL / SSRF | Do not fetch user-submitted URLs by default; if a future provider workflow fetches URLs, isolate it, block private/link-local/loopback/reserved ranges, validate every redirect and resolved address, constrain ports/protocols, and enforce egress policy |
| Malicious evidence upload | Allowlist media types, inspect actual file signatures, cap size, randomize storage names, store outside web root, scan where available, and serve as attachment with safe content headers |
| Stored/reflected injection | Contextual output encoding, safe rendering, strict validation; never render untrusted HTML |
| Abuse / scraping | Per-user and per-provider rate limits, quotas, abuse monitoring, source terms review |
| Data loss | Automated backups, restore drills, retention policy, versioned report exports |
| Audit tampering | Append-only audit design and restricted write access; alert on suspicious administrative changes |
| AI fabrication | Ground claims in stored observations, cite observation IDs, label inference and uncertainty, refuse to invent sources |
| Sensitive-data overcollection | Data minimization, redaction, retention limits, deletion workflows |

## Safe OSINT operating boundaries

- Use authorized public sources and respect provider terms, rate limits, privacy, and applicable law.
- Do not implement private-account access, credential collection, private-profile scraping, doxxing, deanonymization, or private-person tracking.
- A handle match, phone format, email syntax, domain registration record, or single provider result does not prove identity, ownership, intent, or wrongdoing.
- Keep analyst notes distinct from source-derived observations.
- Record source, retrieval timestamp, method, freshness, and limitations for external data.

## Release checks

Security review must include authentication and authorization tests, SSRF and redirect tests for any fetch-capable service, upload validation, dependency scanning, secret scanning, rate-limit tests, audit coverage, backup/restore, and privacy/deletion verification. A threat model is not evidence that controls are implemented.
