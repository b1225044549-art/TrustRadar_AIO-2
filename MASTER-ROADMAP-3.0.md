# TrustRadar 3.0 — Master Roadmap

This roadmap describes the intended product. It is not a claim that all items exist in the current alpha.

## Product principles
- UX-first across desktop, tablet and dedicated mobile flows.
- Evidence-led: separate observed fact, inference, hypothesis, stale data and unknowns.
- Privacy-respecting: authorized public sources only; no private-account access, credential collection, doxxing, deanonymization or private-person tracking.
- Transparent capability labels: planned, in progress, implemented, tested, verified.
- Five locale foundations: Arabic, English, French, German and Simplified Chinese. Full translation coverage and rendered locale QA remain release gates.

## Workstreams
1. Engineering foundation: modular Vue components, compatible pinned dependencies, lockfile and repeatable builds.
2. UX system: responsive desktop/mobile flows, keyboard access, accessibility, onboarding, command palette and complete states.
3. Localization: full UI, validation, notifications, reports and demo content in AR/EN/FR/DE; visual RTL review.
4. Investigation workspace: connect the alpha-3 domain core to case screens, evidence board, notes, relationships and timeline.
5. Backend: FastAPI, PostgreSQL, migrations, authentication, roles, audit events, backups and recovery.
6. Intelligence modules: domain, URL, email, phone, username, IP/network, threat intelligence and passive authorized asset discovery. Every adapter must respect provider terms, quotas and privacy.
7. Analysis: provenance, source quality, freshness, confidence, alternative hypotheses and explainable investigation health checks.
8. Visualization: relationship graph, evidence board, timeline and investigation replay.
9. Reports: PDF/JSON/CSV, citations, timestamps, limitations, redaction and version history; STIX/TAXII only after standards validation.
10. AI and monitoring: evidence-cited summaries, hypotheses, report drafting, watchlists, scheduled rechecks and change alerts.
11. Demo, Lab and Benchmark: isolated fictional fixtures, deterministic scenarios, adapter tests and transparent benchmark methodology.
12. Release QA: H5 production build, Android build/device testing, security, performance, accessibility, localization and recovery verification.

## Delivered foundations
- Alpha 1: four-locale preference foundation and basic RTL shell.
- Alpha 2: persisted appearance preference and locale-aware formatting helpers.
- Alpha 3: tested local investigation domain core and brand identity system.

## Next execution order
1. Integrate case/evidence core into a usable interface.
2. Complete UI translation and RTL visual QA.
3. Modularize the large page without breaking existing behavior.
4. Resolve compatible dependency versions and lockfile; prove clean install and H5/Android builds.
5. Build backend, security and authorized source-adapter layer.
6. Complete investigation workflows, reporting, visualization, monitoring and AI with evidence citations.
7. Pass release QA gates before calling it stable 3.0.
