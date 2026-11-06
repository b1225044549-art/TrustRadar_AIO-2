# TrustRadar AIO

**Discover. Investigate. Connect.**

TrustRadar is a local-first workspace for organizing authorized public-source research, preliminary indicator-format checks, and evidence-led investigations.

## Package status

**Best available source handoff — version 3.0.0-alpha.7. Not a production-final release.**

This package is the most complete source snapshot available in this workspace. It has a passing automated unit-test suite and a JavaScript syntax-check script. A clean dependency install and framework builds could not be completed in the current build environment, so no H5 or Android binary is included.

## Included capabilities

- Conservative, local format checks for domains, URLs, email-like values, phone-like values, and usernames.
- Synthetic Demo Mode, isolated from local case records.
- Local saved indicators, recent searches, and reports.
- Case workspace with evidence metadata, evidence-linked observations, notes, analyst-asserted relationships, status changes, and activity timeline.
- Local storage, backup support, and Dark / Light / System appearance preferences.
- Five-minute local analysis cache with forced refresh and clear cache-status disclosure.
- Versioned audit JSON export with provenance and explicit limitations; Demo Mode bypasses normal analysis caching.
- Locale foundations for Arabic, English, French, German and Simplified Chinese (`zh-cn`). Coverage is partial; untranslated text may fall back to English.
- Arabic is configured RTL; other supported locales are LTR.

## Requirements

- Node.js 20 or newer is recommended.
- npm.
- Network access to the npm registry for installing the UniApp/Vue toolchain.

## Install and run

```bash
npm install
npm run verify
npm run dev:h5
```

Build commands:

```bash
npm run build:h5
npm run build:app
```

UniApp/Vue/Vite direct dependencies are pinned to an explicit DCloud Vue 3/Vite baseline. A verified lockfile is still required before treating this as a reproducible release. `npm install` and the build commands have **not** been verified in the current environment.

## Verification

- `npm test` — 58 tests passed in the available Node.js environment.
- `npm run test:syntax` — checks JavaScript syntax in `utils/`, `tests/`, and `scripts/`.
- `npm run verify` — runs both checks.

Passing unit tests does not prove that the Vue/UniApp app builds, renders correctly, or works on Android devices. See `RELEASE-STATUS.md` and `FINAL-RELEASE-GATE.md`.

## Product and analysis limitations

The analyzer performs local format/structure checks only. It does not query reputation providers, verify ownership, determine whether an indicator is malicious, or produce a threat verdict. A matching identifier is not proof of identity or wrongdoing.

This package does not include a production backend, authentication, team collaboration, or live OSINT provider integrations.

## Responsible use

Use authorized public sources and respect applicable law and provider terms. Do not use the product for private-account access, credential collection, doxxing, deanonymization, or tracking private individuals. Keep observed facts separate from interpretations and hypotheses.


## Release engineering

See `docs/DEPENDENCY-BASELINE.md` for the pinned DCloud/Vue/Vite toolchain and current install/build gate. Run `npm run verify:release` to execute tests and fail-closed release preflight checks.
