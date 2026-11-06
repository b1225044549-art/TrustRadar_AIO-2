# TrustRadar AIO 3.0 — Core Data Model

Status: target schema design; not implemented in the 2.5.0 local prototype.

## Core records

| Entity | Purpose | Important fields |
|---|---|---|
| User | Authenticated account | id, email, status, created_at |
| Workspace | Tenant boundary | id, name, owner_id, retention_policy |
| Membership | User access to workspace | workspace_id, user_id, role_id, status |
| Role / Permission | Authorization model | role_id, permission_key |
| Case | Investigation container | id, workspace_id, title, status, created_by, timestamps |
| Entity | Abstract subject under review | id, case_id, entity_type, display_label |
| Indicator | Observable value | id, indicator_type, normalized_value, first_seen_at |
| Observation | A source-backed statement | id, indicator_id, source_id, observed_at, confidence, freshness |
| Source | Provenance record | id, provider_key, source_name, terms_url, enabled_state |
| Evidence | User-supplied or collected artifact metadata | id, case_id, storage_key, sha256, media_type, size_bytes |
| Relationship | Explicitly asserted link | id, case_id, from_entity_id, to_entity_id, relation_type, basis |
| TimelineEvent | Chronological case event | id, case_id, occurred_at, event_type, summary |
| AnalystNote | Human-authored note | id, case_id, author_id, body, created_at |
| Report / ReportVersion | Reproducible report snapshots | id, case_id, version, format, generated_at |
| Watchlist | Saved monitoring target | id, workspace_id, indicator_id, schedule, state |
| BackgroundJob | Async task state | id, job_type, status, attempts, started_at, completed_at |
| AuditEvent | Security and accountability log | id, actor_id, workspace_id, action, target, created_at |

## Data integrity

- Use opaque IDs; do not expose sequential internal IDs as public identifiers.
- Add unique constraints for normalized indicators within the intended workspace scope.
- Index workspace_id and common case/time filters.
- Use foreign keys and explicit delete/retention behavior.
- Keep observations immutable; corrections should create a new observation or an auditable amendment.
- Store timestamps in UTC and render them in the user's locale.
- Record provenance for every external observation.
- A SHA-256 digest can detect later byte changes; it does not prove who created a file or that its contents are true.

## Privacy and retention

Collect only fields needed for the investigation purpose. Avoid storing passwords, authentication tokens, financial data, or unnecessary personal details. Define workspace retention and deletion behavior before launch. Deletion must cover database rows, object storage, exports, caches, and backups according to a documented retention schedule.
