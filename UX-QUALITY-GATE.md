# TrustRadar AIO 3.0 — UX Quality Gate

A feature is not UX-complete until all applicable checks pass.

## Discoverability and workflow
- Users can identify their current workspace and page.
- Primary action is visually clear and secondary actions do not compete with it.
- Common tasks can be completed without memorizing hidden gestures.
- Destructive actions require confirmation and explain what will be removed.
- Back, cancel, save, and exit behavior is consistent.

## Feedback and recovery
- Every asynchronous operation has loading, success, empty, and error states as applicable.
- Errors explain the problem and a safe next step.
- Autosave and synchronization states are explicit; no silent success claims.
- User input is preserved after recoverable validation or network errors.

## Accessibility and comfort
- All interactive controls are keyboard reachable with visible focus.
- Touch controls are comfortably sized and separated.
- Reduced-motion preference is respected.
- Text remains readable at increased system font sizes and at narrow widths.
- Color is not the only way to communicate status.
- Semantic labels and screen-reader announcements are tested on supported platforms.

## Responsive and localization
- Test at phone, tablet, laptop, and wide desktop widths.
- Test Arabic RTL and English/French/German LTR, including tables, dialogs, menus, icons, and mixed-direction technical values.
- No clipped controls or horizontal overflow in normal workflows.
- Dates, numbers, and plural forms use locale-aware formatting.

## Performance and trust
- Navigation and search remain responsive with realistic dataset sizes.
- No decorative animation blocks a task.
- Demo/simulated data is unmistakably labeled.
- Local-only, connected, stale, and unavailable data states are never conflated.

## Release evidence
Record device/browser, viewport, locale, test scenario, outcome, defects, and retest evidence. A checklist without execution evidence does not pass this gate.
