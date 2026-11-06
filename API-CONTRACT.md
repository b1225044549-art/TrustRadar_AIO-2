# TrustRadar AIO 3.0 — API Contract Outline

Status: proposed contract; no production API is implemented in 2.5.0.

Base path: `/api/v1`.

## Endpoint groups

- `GET /health/live` — process liveness only.
- `GET /health/ready` — readiness including required dependencies; never expose secrets or internal topology.
- `GET /me` — current authenticated user and permitted workspace context.
- `GET /workspaces` / `POST /workspaces` — list and create workspaces.
- `GET /workspaces/{workspace_id}/cases` / `POST .../cases` — list and create cases.
- `GET /cases/{case_id}` / `PATCH /cases/{case_id}` — case details and controlled updates.
- `POST /cases/{case_id}/indicators` — attach an indicator to a case.
- `GET /cases/{case_id}/observations` — source-backed observations with provenance.
- `POST /cases/{case_id}/notes` — analyst-authored notes.
- `POST /cases/{case_id}/evidence` — request an upload slot or register a validated artifact.
- `GET /cases/{case_id}/timeline` — chronological events.
- `POST /analysis/preview` — local/controlled format analysis; must not silently trigger provider lookups.
- `POST /source-jobs` — explicitly request a permitted source check.
- `GET /jobs/{job_id}` — job status and partial provider results.
- `POST /reports` / `GET /reports/{report_id}` — generate and retrieve report versions.
- `GET /integrations` / `PATCH /integrations/{provider_key}` — administrator-only provider configuration metadata; secrets are write-only and never returned.

## Response conventions

Every response should include a request identifier. Errors use stable machine-readable codes, safe human-readable messages, and field-level validation details where appropriate. Never return stack traces, secrets, raw provider credentials, or internal network details.

A source observation should include:

```json
{
  "observation_id": "opaque-id",
  "source": {"key": "provider-key", "name": "Provider name"},
  "observed_at": "UTC timestamp",
  "retrieved_at": "UTC timestamp",
  "value": {},
  "confidence": "low|medium|high|not_assessed",
  "freshness": "current|stale|unknown",
  "limitations": ["Provider-specific limitations"],
  "status": "success|partial|unavailable|rate_limited|error"
}
```

## API rules

- Validate every request with typed schemas and strict size limits.
- Enforce workspace authorization on every object access; do not rely on client-side hiding.
- Apply rate limits by user, workspace, and provider.
- Use idempotency keys for retryable creation requests.
- Paginate collection endpoints with stable cursors.
- Version breaking changes explicitly.
- Keep AI output separate from source observations and link claims to observation IDs.
