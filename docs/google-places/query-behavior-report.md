# Google Places query-behavior report

Generated: 2026-07-17 (local development counter)

This report uses the development-only mount/query-intent counter in
`src/lib/google-places/query-intent.ts`. It estimates integration behavior and
**is not billing-authoritative**.

Environment: feature flag enabled locally; browser key configured; matching key configured (not used in browser).

## Detail page

| Step | Expected | Observed |
| --- | --- | --- |
| Open restaurant detail without scrolling to Google section | No full mount | PASS — 0 intents, 0 `gmp-place-details` |
| Scroll Google section into view | One intended full mount | PASS — +1 full intent |
| Harmless UI interaction (save control) | No additional mount | PASS — delta 0 |
| Navigate away and back, then scroll again | New page session may remount once after threshold | PASS — one full mount after scroll |

## Discovery surfaces

| Surface | Expected | Observed |
| --- | --- | --- |
| Homepage `/` | No Google UI Kit intents | PASS — delta 0 |
| Explore `/explore` | No Google UI Kit intents | PASS — delta 0 |
| Passport `/passport` | No Google UI Kit intents | PASS — delta 0 |

## Map workspace

| Step | Expected | Observed |
| --- | --- | --- |
| Open map with no selection | No compact mount | PASS |
| Pan / zoom viewport | No Google intents | PASS |
| Select a restaurant (desktop) | One compact mount | PASS |
| Select same restaurant again via URL navigation | Remount allowed on full navigation | Observed +1 (full navigation remount) |
| Rapid selection across restaurants | Debounce keeps a single live compact host | PASS — one compact element after settle |
| Mobile collapsed peek | No Google mount | PASS after viewport gate fix — 0 compact |
| Mobile expand selected sheet | One compact mount | PASS — +1 |
| Collapse and reopen same selection | May remount when section remounts | Observed +1 on reopen (section unmount/remount by design) |

## Fixes during verification

- Desktop selected Google panel used `hidden lg:block`, which still mounted UI Kit on mobile and created unintended compact intents while the peek sheet was collapsed.
- Fix: mount the desktop selected Google panel only when `matchMedia('(min-width: 1024px)')` matches. Mobile Google content mounts only in the expanded sheet.

## Summary

- No detail query before lazy threshold.
- One intended full mount after entering threshold.
- No duplicate mount on harmless detail rerender.
- No queries from Homepage, Explore, or Passport.
- No queries from map markers / unselected list rows / pan-zoom alone.
- One intended compact mount after deliberate desktop selection or mobile expand.
- Debounce protects rapid selection changes.
- Collapsed mobile sheet does not mount Google content.

Proof screenshots: `docs/google-places/proof/live/`
