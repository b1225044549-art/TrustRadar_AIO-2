# Local Investigation Core — Alpha 3

Status: implemented as a tested local-first domain module; not yet wired into the main interface.

## Included operations

- Create and validate investigation cases.
- Track case status, tags, objective and chronological events.
- Add evidence metadata with source name, optional public URL, observed time, confidence and limitations.
- Add observations with explicit types: observed fact, inference or hypothesis.
- Require an evidence link before an observation can be recorded as an observed fact.
- Record analyst-asserted relationships only when endpoints differ and a rationale is supplied.
- Add analyst notes and generate transparent case summaries.
- Persist a versioned local store with fail-closed validation for malformed or unsupported data.

## Important boundaries

- Source URLs are stored as metadata only; the module does not open or fetch them.
- Evidence is not automatically authenticated. A future SHA-256 value can detect byte changes, not prove authenticity or authorship.
- A relationship is an analyst assertion with a stated basis, not proof that two entities are the same person.
- Confidence labels are analyst-entered descriptors, not calibrated probabilities.
- This is local storage, not multi-user collaboration or a secure server-side evidence vault.
