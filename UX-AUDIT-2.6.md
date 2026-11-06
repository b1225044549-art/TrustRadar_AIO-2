# TrustRadar AIO — UX Audit of 2.6.0

## Scope reviewed
The available 2.6.0 source bundle was reconstructed and inspected. This audit describes the actual local-first prototype, not the unimplemented 3.0 roadmap.

## Strengths retained
- Clear dashboard, investigation, report register, new report, saved cases, and settings destinations.
- Responsive desktop sidebar and mobile bottom navigation.
- Demo mode has a visible simulated-data banner and scenario switcher.
- Analysis copy avoids claiming a verified reputation verdict.
- Settings already has a mobile “More” entry for access to settings.

## Issues identified
1. The page is a single large Vue component, making navigation, translation, and interaction changes harder to maintain.
2. Most interface copy is hard-coded in English; Arabic, French, and German are not implemented in this release.
3. Many metadata labels use very small type, especially on mobile.
4. Focus indication and reduced-motion handling were not explicit in the stylesheet.
5. Several controls use compact touch dimensions.
6. A dashboard label said “LIVE LOCAL DATA”, which could imply a live external feed; it has been changed to “DEVICE DATA”.
7. Theme personalization, persisted locale selection, command palette, and full onboarding are not implemented yet.

## 2.6.1 changes
- Added visible keyboard focus styling.
- Added reduced-motion preference handling.
- Improved mobile touch target minimums for primary controls.
- Set mobile form controls to a 16px text size.
- Added safe-area-aware bottom navigation and toast positioning.
- Replaced the potentially misleading “LIVE LOCAL DATA” label with “DEVICE DATA”.
- Added regression tests for analyzer boundaries, demo fixture labeling, and UX accessibility baseline.

## Remaining UX work for 3.0
- Componentize the monolithic page into navigation, shell, dashboard, investigation, reports, and settings components.
- Implement centralized localization for Arabic, English, French, and German, including true RTL layout and locale-aware dates/numbers.
- Add persisted theme and locale preferences.
- Add global search and keyboard command palette.
- Add onboarding and contextual help with skip/replay controls.
- Add proper loading, empty, error, offline, and retry states to every module.
- Conduct moderated usability tests and accessibility checks on desktop and physical Android devices.
