# Phase 5 — Explore baselines (directory rebuild)

Primary references:

- `docs/designs/explore_michelin_starred_restaurants/screen.png` → `stitch-grid-reference.png`
- `docs/designs/explore_list_view_filters_drawer/screen.png` → `stitch-list-drawer-reference.png`
- `docs/designs/dining_passport_system_states/screen.png` → `stitch-system-states-reference.png`

## Query contract (unchanged)

Source: `src/lib/data/explore.ts`

| Param | Allowed | Default | Multi? | Notes |
|---|---|---|---|---|
| `q` | trimmed string | `""` | No | AND token match on name/city/state/cuisine/address |
| `stars` | `1` \| `2` \| `3` | `null` | No | Invalid → null |
| `state` | state slug | `""` | No | Equality on `stateSlug` |
| `city` | city slug | `""` | No | Equality on `citySlug`; cleared when state chip removed |
| `cuisine` | cuisine slug | `""` | No | |
| `price` | restaurant price string | `""` | No | |
| `sort` | featured, stars-desc, stars-asc, name-asc, name-desc, state, city | `featured` | No | Invalid → featured; omitted from URL when default |
| `view` | grid \| list | `grid` | No | Invalid → grid; omitted when default |
| `page` | integer ≥ 1 | `1` | No | Floored; omitted when ≤ 1; page size 24 |

**Page reset:** search, filters, sort, view, chip remove, and clear-all reset to page 1 (forms omit `page`; chip/view hrefs set `page: 1`).

**Not in Explore contract:** `saved`, `visited` (map-only). No Green Star / Bib / open-now.

**SEO:** static title/description only; no filtered noindex/canonical (unchanged).

## Capture set

| File | Notes |
|---|---|
| `stitch-grid-reference.png` | Stitch grid screen |
| `stitch-list-drawer-reference.png` | Stitch list + drawer |
| `stitch-system-states-reference.png` | System states sheet |
| `grid-1440.png` … `grid-390.png` | Responsive grid |
| `list-1440.png` / `list-390.png` | List rows |
| `drawer-open-1440.png` / `drawer-open-390.png` | All Filters drawer |
| `active-filters.png` | Chips + clear |
| `empty-1440.png` / `empty-390.png` | `?proof=empty` (dev) |
| `loading-grid.png` / `loading-list.png` | `?proof=loading` (dev) |
| `pagination.png` | Numbered pages |
| `truthful-reservation-labels.png` | Resolver CTAs |
| `save-states.png` | Save control |
| `long-name-mobile.png` | Mobile list stacking |

## Composition checklist (recorded before implementation)

1. Order: Header → intro (H1 56px Literata, count line) → sticky DiscoveryToolbar → active chips → results toolbar (sort + view) → 4-col grid / list → pagination → footer  
2. No permanent left sidebar  
3. Search: full-width flex-grow, 48px height + Search button  
4. Quick filters: Stars → State → City → Cuisine → Price → All Filters (40–44px)  
5. Drawer: 400px desktop; near full-screen mobile; Apply primary / Clear secondary  
6. Grid: `gap-x-6` / `gap-y-12`; 4-col at xl when width supports ~280px cards  
7. List: ~120px media, generous vertical spacing, stacked on mobile  
8. Pagination: 44px circular targets, numbered pages  
9. Loading/empty from system_states  

## Comparison

| Dimension | Stitch | Implementation | Verdict |
|---|---|---|---|
| Page silhouette | Intro → toolbar → grid → pages | Matches required order | Accept |
| H1 | 56px Instrument → Literata | Literata 56px desktop | Accept |
| Result count | Separate meta line | Intro + results toolbar meta | Accept |
| Search | Full width + button | SearchInput + Button | Accept |
| Quick filters | Chip dropdowns | Native selects, 44px, selected border | Accept |
| Sort/view | Right cluster | Results toolbar | Accept (brief order) |
| Grid columns | 4 at wide | `xl:grid-cols-4` (3 at lg) | Accept |
| Card content | Phase 3 contract | Discovery cards | Accept |
| List density | 120px thumb rows | RestaurantListRow | Accept |
| Drawer width | 400px | `--dp-drawer-width` | Accept |
| Drawer fields | Distinctions, location, cuisine, price | Real facets only; no Green Star / Saved/Visited | Accept |
| Apply/Clear | Sticky footer | Drawer footer | Accept |
| Pagination | Numbered circles | Numbered + prev/next URL links | Accept |
| Loading | Toolbar + skeleton grid | ExploreLoadingState | Accept |
| Empty | Centered recovery | EmptyState + clear + suggestions | Accept |
| Mobile | 1-col; chip scroll; full drawer | Matches | Accept |

## Accepted content adaptations

1. Literata instead of Instrument Serif (OD-03).  
2. Phase 3 card contract: stars below media, overlay Save — not Stitch badge-on-image-only.  
3. No Green Star, Bib, Saved/Visited filters (unsupported in Explore query).  
4. No stock food photography — approved image or designed fallback.  
5. Truthful reservation labels from resolver.  
6. Sort options are real `EXPLORE_SORT_*` values, not Stitch “Price: Low to High”.  
7. Quick City control added to match Stitch order while preserving single-value URL model.  
8. Changing State clears City before submit (fixes stale city quirk).  

## Overflow

Checked 1440 / 1280 / 1024 / 768 / 390 via Playwright: no horizontal page overflow.

## Google boundary

Zero `gmp-place-details` mounts on `/explore`. No Google ratings/reviews rendered.

## Deletions

Obsolete `src/components/explore/*` presentation removed after cutover. Logic retained in `src/lib/data/explore.ts`. Taxonomy grid now uses stitch discovery cards without redesigning taxonomy chrome.
