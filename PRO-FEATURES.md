# Local Pro Features — Alpha 7

## Analysis cache

- Caches local `analyzeIndicator` results for five minutes.
- Cache keys are normalized indicator strings and include a cache schema version.
- Entries are stored separately from user reports and investigation records, with a bounded 50-entry store.
- Forced refresh bypasses the cache and runs the local analyzer again.
- Demo mode bypasses this cache so synthetic session data is never mixed with ordinary workspace analysis.
- Cache status is informational. It does not make the analysis more accurate or connect external sources.

## Audit JSON export

- Exports a versioned JSON payload with the analysis, generation time, provenance metadata, and explicit limitations.
- H5 uses a browser Blob download. App-Plus uses the app's private documents directory when the runtime exposes its file API.
- Unsupported runtimes return an explicit error; the interface does not claim an export succeeded.
- The exported indicator and findings may contain sensitive information. Review the file before sharing.

## Analysis boundaries

The analyzer remains a local format/structure review. No DNS, RDAP, reputation, certificate, redirect, mailbox, carrier, or platform lookup is performed. No trust score is inferred or added by these features.
