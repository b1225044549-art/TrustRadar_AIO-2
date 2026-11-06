# TrustRadar AIO 3.0 — Release Gates

No final release label until all mandatory gates are evidenced.

## Product functionality
- Every visible action has a real implemented behavior or is explicitly marked unavailable/coming later.
- Case, entity, indicator, evidence, source, note, timeline, relationship, report, and watchlist workflows pass end-to-end tests.
- Demo data is synthetic, clearly labeled, deterministic, and isolated from real workspaces.
- Every external result displays source, collection time, freshness, status, and limitations.

## Engineering
- Exact compatible direct dependency versions are pinned; lockfile committed.
- Clean install succeeds from an empty dependency cache.
- Database migrations apply to an empty database and supported prior schema.
- Backup and restore are exercised successfully.
- API contract, integration, unit, UI, and end-to-end tests pass.

## Security and privacy
- Authentication and object-level authorization are tested.
- Secrets are absent from client bundles and repository history.
- URL-fetch and redirect protections are tested for any feature that performs network retrieval.
- Upload validation, rate limiting, audit logging, retention, export, and deletion are verified.
- AI claims are grounded in evidence and distinguish source facts from inference.

## Platforms
- H5 production build succeeds reproducibly.
- Android package builds, is signed using a documented release process, and is tested on supported Android versions/devices.
- Responsive layouts, Arabic RTL, keyboard accessibility, screen-reader labels, offline/error states, and performance budgets are checked.

## Release evidence
For each feature, maintain one of: `PLANNED`, `IN_PROGRESS`, `IMPLEMENTED`, `TESTED`, `VERIFIED`. `IMPLEMENTED` is not equivalent to `VERIFIED`. Publish test evidence, known limitations, version notes, and rollback instructions with the release.
