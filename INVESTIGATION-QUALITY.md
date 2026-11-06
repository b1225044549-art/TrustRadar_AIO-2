# Investigation quality controls

This module provides conservative, local-only quality controls for analyst-authored case records.

## Evidence metadata assessment

`assessEvidenceMetadata()` checks whether source metadata fields are present, whether a supplied URL has an allowed HTTP(S) format, and whether the recorded observation date falls inside a configurable age window. It does **not** fetch the URL and does not establish source reachability, publisher authenticity, or factual accuracy. Those states are explicitly returned as `not_checked`, `not_independently_verified`, and `not_assessed`.

## Declared conflicts

`findDeclaredEvidenceConflicts()` only groups observations that share an explicitly supplied `subjectKey` and have opposing analyst-selected `stance` values (`supports` / `contradicts`). It is not natural-language contradiction detection. A returned conflict remains unresolved until a human reviews the underlying evidence.

## Challenge This Finding

`challengeObservation()` requires a counter-evidence record already attached to the same case and a written rationale. It preserves the original observation, creates an open challenge, and marks the observation as challenged. The system does not automatically decide which side is correct.

## Historical comparison

`compareCaseSnapshots()` compares stable record IDs between two snapshots of the same case. Added and removed records indicate differences between snapshots only; they do not prove that evidence was false, deleted from its original source, or invalid.

## Report payload

`buildCaseReport()` produces a versioned JSON-ready payload containing the case, evidence metadata assessments, observations, notes, relationships, challenges, declared conflicts, and explicit limitations. It is not a PDF renderer and does not independently archive or authenticate source content.

## Data handling boundary

All functions are local and synchronous. They do not make network requests, query external services, or generate a risk score. Source URLs remain metadata until a separately reviewed and authorized source adapter is implemented.
