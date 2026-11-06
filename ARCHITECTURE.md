# TrustRadar AIO 3.0 — Target Architecture

Status: approved target design; not yet implemented in the 2.5.0 prototype.

## System boundaries

- Client: Vue 3 + UniApp. Presentation, local draft state, accessibility, responsive layouts, and API client only. Never store provider secrets in the client bundle.
- API: Python + FastAPI. Authentication, authorization, validation, case workflows, evidence metadata, source orchestration, exports, audit events.
- Database: PostgreSQL. Durable workspaces, cases, indicators, observations, sources, evidence metadata, relationships, jobs, reports, and audit events.
- Worker: separate process for scheduled monitoring and provider tasks. Introduce a queue only when asynchronous workloads are enabled; Redis is optional, not a mandatory dependency from day one.
- Provider adapters: isolated modules with strict timeouts, quotas, source provenance, normalized outputs, and explicit unsupported/error states.

## Deployment topology

A production deployment should expose the client and API through HTTPS. The API should be the only component allowed to access provider credentials and external data providers. Database and worker services must not be publicly reachable. Use separate development, staging, and production environments with separate credentials and data.

## Request flow

1. Client sends a versioned API request with an authenticated session.
2. API validates the payload and checks workspace permission.
3. A use-case/service layer applies business rules and records an audit event where required.
4. Database transaction stores durable records.
5. Provider tasks execute through an adapter boundary, not directly from UI code.
6. Each returned observation stores source, retrieval time, provider record reference where allowed, method, freshness, and limitations.
7. Client renders source-backed observations separately from analyst notes and AI-generated summaries.

## Reliability rules

- Use database migrations and test both upgrade and rollback strategy.
- Use idempotency keys for create operations that may be retried.
- Apply bounded retries only to transient provider/network errors; never retry indefinitely.
- Treat rate limits and provider outages as explicit states, not empty successful results.
- Keep user-facing status separate from provider execution status.
- Backups are incomplete until a restore drill has succeeded.

## Platform strategy

Web and Android are both product targets. Share business logic and API contracts, but verify each platform independently. Android packaging, signing, permissions, deep links, file access, clipboard behavior, and offline states require device-level tests. A successful H5 build does not establish Android readiness.
