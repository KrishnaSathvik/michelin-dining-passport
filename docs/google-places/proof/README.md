# Google Places UI Kit — proof index

Screenshots are **proof only** and must not be reused as application assets.
Do not commit provider photos, ratings, reviews, or raw API payloads as data files.

## Live spike (`proof/live-spike/`)

Captured with local feature flag enabled and reviewed Place IDs.

| File | What it shows |
| --- | --- |
| `full-desktop.png` / `full-mobile.png` | Spike page composition |
| `compact-desktop.png` / `compact-mobile.png` | Compact width probes |
| `strong-coverage.png` | Alinea rich coverage |
| `limited-content.png` | Lazy Betty thinner coverage |
| `similar-name.png` | Sushi Nakazawa NY ambiguity case |
| `shared-address.png` | Crown Shy sibling |
| `no-match-fallback.png` | Quiet unavailable fallback |
| `provider-error-fallback.png` | Invalid Place ID / provider error path |
| `attribution-close-up.png` | Attribution visible |

## Live product surfaces (`proof/live/`)

| File | What it shows |
| --- | --- |
| `detail-enriched-desktop.png` / `detail-enriched-mobile.png` | Restaurant detail + full UI Kit |
| `detail-multiple-photos.png` | Multi-photo Google section |
| `detail-limited-content.png` | Limited Google content restaurant |
| `detail-no-place-id.png` | No Place ID fallback (spike fixture) |
| `feature-disabled-fallback.png` | Quiet fallback UI |
| `provider-error-fallback.png` | Provider error path |
| `attribution-desktop.png` / `attribution-mobile.png` | Attribution |
| `map-selected-desktop.png` | Desktop selected panel + compact UI Kit |
| `map-selected-mobile-expanded.png` | Mobile expanded sheet + compact UI Kit |
| `map-collapsed-mobile.png` | Mobile collapsed peek without Google mount |
| `map-restaurant-without-place-id.png` | Map path without usable Place ID |
| `map-provider-error-fallback.png` | Map provider error path |

See also:

- `docs/google-places/live-validation-report.md`
- `docs/google-places/query-behavior-report.md`
- `docs/google-places/matching-report.md`
