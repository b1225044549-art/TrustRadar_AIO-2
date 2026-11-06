# TrustRadar AIO — Demo Mode

## Purpose
Demo Mode provides a repeatable presentation environment for showing the current local-first prototype without using real personal records or implying that live OSINT providers are connected.

## Included scenarios
- **Domain Investigation:** fictional `northstar-labs.example` domain and related example URL/email values.
- **Suspicious Email Investigation:** fictional `contoso-mail.example` sender and message context.
- **Digital Footprint Review:** fictional `@northstar_demo` handle. Similar handles are not treated as identity proof.
- **Threat Correlation:** fictional `updates.example` domain and documentation-only IP address `192.0.2.44`.

All example domains use the reserved `.example` namespace. The documentation IP is from the IPv4 TEST-NET-1 range and is not presented as a live threat indicator.

## Isolation behavior
- Scenario fixtures are deep-copied each time a scenario is loaded.
- Demo records are marked `DEMO / SIMULATED` or `SIMULATED` in the interface.
- Demo search history, saved items, and reports are held in page memory only.
- Demo operations do not call local persistence functions.
- Backup export is disabled in demo mode.
- Reset reloads the active fixture; exit discards session changes and refreshes the real local workspace.
- The demo does not contact domains, IP addresses, profiles, or external intelligence providers.

## Known limits
- This is a compact deterministic demo fixture, not the full planned 3.0 synthetic dataset.
- The current local analyzer still performs format/structure checks only. It does not provide live DNS, RDAP, WHOIS, reputation, mailbox, profile, or ownership verification.
- A simulated report or matching handle is not evidence of real-world wrongdoing or identity.

## Verification
- Automated fixture tests verify the four scenarios, simulation labels, deep-copy isolation, and fallback behavior.
- Manual UI verification is still required in a working UniApp H5/Android runtime before a platform release can be called verified.
