# TrustRadar AIO 3.0 — Source Adapter Contract

Status: adapter design; no live provider adapters are included in 2.5.0.

Each adapter is a small, isolated integration implementing a shared contract:

- `provider_key`: stable internal key.
- `display_name`: provider name shown to the user.
- `capabilities`: exact supported query types and returned fields.
- `terms_url`: provider terms or API policy reference.
- `health_check()`: returns configured/available/unavailable without exposing secrets.
- `query(request)`: validates supported input, applies timeouts and quota, and returns normalized observations.
- `normalize(raw_response)`: maps provider output to the common observation schema.

Every query result must report:
- `success`, `partial`, `unavailable`, `rate_limited`, or `error` status;
- provider and source reference;
- retrieval timestamp and provider observation time when available;
- normalized values and confidence/freshness labels;
- limitations, missing fields, and error class;
- attribution and citation metadata where provider terms permit it.

Do not convert provider errors or no-results into a clean bill of health. Do not silently substitute a different provider. Cache only where provider terms permit it and attach a freshness timestamp. Keep API keys on the server and rotate/revoke them through the integration administration flow.

A provider should not be enabled until its legal/terms review, quota behavior, schema mapping, error tests, provenance display, and data-retention impact are documented.
