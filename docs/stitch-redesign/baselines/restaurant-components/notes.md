# Phase 3 — Restaurant presentation baselines

Visual comparison of `/dev/stitch-restaurant-components` against Stitch component library and Explore/Map card references.

Primary references:

- `docs/designs/dining_passport_component_library/` → `stitch-reference.png`
- `docs/designs/explore_list_view_filters_drawer/` (list row density)
- `docs/designs/dining_passport_map_workspace/` (selected map row)

## Capture set

| File | Notes |
|---|---|
| `stitch-reference.png` | Component library screen |
| `gallery-1440.png` | Full gallery desktop |
| `gallery-1024.png` | Intermediate |
| `gallery-768.png` | Tablet |
| `gallery-390.png` | Mobile full set; no horizontal overflow |
| `discovery-approved-image.png` | 1★ card with `/dev/approved-restaurant-demo.svg` |
| `discovery-fallback.png` | Designed fallback (2★ Acquerello) |
| `editorial-card.png` | SingleThread horizontal editorial |
| `list-row.png` | Benu explore-list style |
| `map-row-selected.png` | Selected map panel row |
| `reservation-labels.png` | All four truthful labels + unavailable |
| `save-states.png` | Compact / editorial / controlled overlay |
| `long-name-mobile.png` | Long name wrap at 390 |
| `loading-and-error-states.png` | Loading shimmer + error fallback + ready image |

## Comparison

| Dimension | Stitch reference | Implementation | Verdict |
|---|---|---|---|
| Card silhouette | Flat surface, soft radius, no heavy shadow | Matches — subtle hover only | Accept |
| Image ratio | 4:3 discovery media | 4:3 enforced | Accept |
| Distinction placement | Gold stars near identity; badge on editorial | Compact above name; labeled badge on editorial/detail | Accept |
| Name typography | Literata / serif display | `font-display` Literata | Accept |
| Metadata rhythm | Cuisine · location · price | `RestaurantMeta` with · separators; omits missing fields | Accept |
| Action hierarchy | Primary reserve CTA; save secondary/overlay | Primary full-width on discovery; overlay save on media | Accept |
| Border / radius | Soft 8px family | `--dp-radius-lg` | Accept |
| Fallback design | Designed non-photo | Initials + tonal geometry + gold distinction; seeded variation | Accept |
| Row density | ~120px media on list | 120–132px desktop media; stacked mobile | Accept |
| Map row selected | Left bar + border + fill | Structure + color + `aria-selected` | Accept |
| Responsive | Mobile stacks intentionally | Discovery full width; list stacks; map panel 420 max | Accept |

## Accepted differences from Stitch

1. **No stock food photography** on named restaurants — Stitch HTML uses illustrative CDN food; product uses approved first-party media or designed fallback only.
2. **Truthful reservation labels** — Stitch often shows generic “Reserve”; product uses resolver labels (`Reserve now`, `Check availability`, etc.).
3. **No Google ratings / review counts / open status** on shared cards — hard product boundary.
4. **Save uses heart control** consistent with Passport save semantics; Stitch bookmark glyph mapped to passport save (not a separate bookmark model).
5. **Approved media demo** uses a geometric first-party SVG for gallery proof until real restaurant photography lands — not atmospheric stock.
6. **Editorial eyebrow** is optional (`Featured`) and omits invented essay copy from the library mock.

## Overflow

Checked at 1440 / 1024 / 768 / 390: `scrollWidth === clientWidth` on gallery document.

## Google boundary

Gallery mounts zero `gmp-place-details` / `gmp-place-details-compact` elements.

## Route policy

Phase 3 did **not** redesign Homepage, Explore, Map, Detail, Passport, collections, auth, account, or taxonomy compositions. Legacy cards remain imported by those routes.
