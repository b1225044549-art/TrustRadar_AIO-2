## 3.0.0-alpha.7 — Investigation quality controls
- Added metadata-only evidence completeness and freshness assessment with explicit non-verification states.
- Added analyst-declared evidence conflict grouping; no automatic semantic contradiction claims.
- Added Challenge This Finding workflow requiring linked counter-evidence and a rationale.
- Added record-level case snapshot comparison and a versioned JSON-ready report payload with limitations.
- Fixed deterministic evidence observation timestamps when a test or import supplies a fixed case time.
- Added regression tests for all new controls.

# Changelog

## 3.0.0-alpha.7 — local Pro features
- Added a five-minute local analysis cache with normalized cache keys, bounded storage, expiry validation, and forced refresh.
- Kept Demo Mode outside the normal analysis cache to avoid mixing simulated and ordinary results.
- Added cache-state disclosure in the analysis workspace; cache persistence failures are reported without blocking analysis.
- Added versioned audit JSON export with provenance metadata, generation timestamp, and explicit limitations.
- Added H5 Blob download and App-Plus document export paths; unsupported runtimes return an explicit failure.
- Workspace clearing now removes cached analysis entries too.
- Added regression tests for cache freshness, expiry, forced refresh, export payloads, and unsupported runtimes.

## 3.0.0-alpha.6
- Introduced a vivid, balanced multi-accent visual palette with dedicated light-theme values.
- Added Simplified Chinese locale foundation for core navigation and settings.
- Updated automated locale and release metadata tests.


## 3.0.0-alpha.6 — visual foundation pass
- Replaced the high-saturation indigo/violet-heavy palette with a calmer slate, muted teal and restrained brass identity.
- Defined coordinated dark and light semantic color tokens for backgrounds, surfaces, text, borders, actions and status states.
- Updated shared navigation, dashboard surfaces, forms, case workspace and focus treatments to use the new palette.
- Kept the existing icon glyphs and four-language foundation unchanged; icon-system and Chinese localization work remain separate follow-up stages.
- Automated regression suite: 40 tests passed. H5/Android builds and real-device visual QA are not claimed by this pass.

## 3.0.0-alpha.6
- Connected the local investigation store to a visible case workspace in the main UI.
- Added case creation, status updates, evidence metadata capture, evidence-linked observations, analyst-asserted relationship records, analyst notes and activity timeline review.
- Kept case editing disabled in Demo Mode to prevent simulated records from mixing with real local investigations.
- Added clear provenance and authenticity caveats; source URLs remain metadata and are never fetched.
- Added a tested local investigation core for cases, evidence metadata, observations, analyst notes, relationships, status and timeline events.
- Added fail-closed versioned investigation-store validation.
- Added explicit evidence linkage for observed-fact entries and clear labels for inferences/hypotheses.
- Added brand identity guidance: TrustRadar as the primary name; TrustRadar AIO as the technical/package shorthand.
- Corrected release metadata and dashboard labels; improved small-label readability baselines and added regression tests.


## 3.0.0-alpha.2
- Added persisted Dark / Light / System appearance preference.
- Added first-pass light theme and locale-aware date/number helpers.
- Extended four-language settings translations.

## 3.0.0-alpha.1
- Added four-locale foundation and language preference persistence.
- Added basic Arabic RTL shell metadata and navigation translation.

## 3.0.0-alpha.6 — source handoff verification (2026-11-06)
- Corrected stale alpha.5 version labels in the workspace shell and application settings.
- Updated README and roadmap locale notes to include the Simplified Chinese locale foundation and clearly state partial translation coverage.
- Added release-metadata regression tests.
- Re-ran the automated suite: 42 passed, 0 failed. H5/Android builds remain unverified because dependency installation did not complete.
