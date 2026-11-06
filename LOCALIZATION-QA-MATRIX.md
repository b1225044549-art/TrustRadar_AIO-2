# TrustRadar AIO 3.0 — Localization QA Matrix

Required locales: `ar`, `en`, `fr`, `de`.

| Area | Arabic | English | French | German |
|---|---|---|---|---|
| Navigation and page titles | RTL | LTR | LTR | LTR |
| Forms and validation | Required | Required | Required | Required |
| Notifications and errors | Required | Required | Required | Required |
| Tables and filters | RTL-aware | LTR | LTR | LTR |
| Dates and numbers | Locale-aware | Locale-aware | Locale-aware | Locale-aware |
| Reports and exports | Required | Required | Required | Required |
| Demo scenarios and help | Required | Required | Required | Required |
| Mobile and tablet layouts | Required | Required | Required | Required |

## Acceptance rules
- No hard-coded user-facing strings in feature components; use centralized translation keys.
- Persist the selected locale and apply it without restarting the app.
- Arabic uses true RTL layout, not only right-aligned text.
- Mixed-direction technical strings (URLs, email addresses, hashes, IPs, code) remain legible and correctly ordered.
- Avoid concatenating translated fragments; use complete localized messages with interpolation and plural rules.
- Missing translation keys fail tests and are visible in development diagnostics.
- Every locale is reviewed by a fluent human reviewer before release.

This matrix is a release requirement, not a claim that all four translations are already implemented in 3.0.0-alpha.1.
