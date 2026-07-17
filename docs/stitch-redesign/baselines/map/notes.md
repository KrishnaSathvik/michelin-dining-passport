# Phase 6 — Map Workspace baselines

Primary reference: `docs/designs/dining_passport_map_workspace/screen.png` → `stitch-workspace-reference.png`.

Secondary only: `docs/designs/map_view/screen.png` → `stitch-map-view-secondary-reference.png`.

## Query contract (unchanged)

Source: `src/lib/map/query.ts` (+ explore params via `parseExploreSearchParams`)

| Param | Allowed | Default | Multi? | Notes |
|---|---|---|---|---|
| `q` | string | `""` | No | Live text filter |
| `stars` | 1\|2\|3 | `null` | No | |
| `state` | slug | `""` | No | |
| `city` | slug | `""` | No | Parsed; UI does not expose |
| `cuisine` | slug | `""` | No | |
| `price` | string | `""` | No | Parsed; UI does not expose |
| `sort` / `view` / `page` | explore enums | featured/grid/1 | No | Carried; unused by map UI |
| `saved` | `1` → true | false | No | Passport saved-only |
| `visited` | `1` → true | false | No | Passport visited-only |
| `selected` | restaurant slug | `""` | No | |
| `bounds` | `w,s,e,n` | `null` | No | Search-this-area |
| `panel` | `map`\|`list` | `map` | No | Mobile list mode when `list` |

URL sync uses `router.replace` (unchanged). Invalid bounds/stars/panel fall back safely.

## Composition checklist (from Stitch HTML)

1. Header 72px → workspace `calc(100dvh - header)`; **no footer**  
2. Left panel **420px** at xl (`360px` at lg/1024); MapLibre fills remainder  
3. Sticky search (48px) + filters Stars→State→Cuisine→Saved→Visited  
4. Scrollable `RestaurantMapRow` list; selected = structure + color  
5. Sticky selected detail: distinction, name, meta, Reserve/Save/Details, Google frame  
6. Search this area top-center; Fit/Reset (+ Clear area) above MapLibre zoom/geo  
7. Selected marker: deep-green pin + `#B88A2A` ring; clusters preserved MapLibre green  
8. Mobile: map-first; list via `panel=list`; bottom sheet peek/expand; Google only when expanded  

## Comparison

| Dimension | Stitch | Implementation | Verdict |
|---|---|---|---|
| Workspace silhouette | 420px left + map | Matches; shell height tokenized | Accept |
| Panel width | 420px | `xl:420` / `lg:360` | Accept |
| Search | 48px soft field | SearchInput | Accept |
| Filter order | Stars→State→Cuisine→Saved | + Visited (product) | Accept |
| Rows | Text map rows | Phase 3 RestaurantMapRow | Accept |
| Selected detail | Sticky bottom | Sticky bottom + Google kit | Accept |
| Google | Compact kit frame | Existing MapSelectedGooglePlace | Accept |
| Search this area | Top center | Top center when viewport drifts | Accept |
| Fit/Reset | Bottom-right stack | Fit/Reset + MapLibre zoom/geo | Accept |
| Markers | Green + gold ring | MapCanvas restyle | Accept |
| Clusters | (not in Stitch) | Preserved MapLibre behavior | Accept |
| No footer | Required | AppChrome + shell | Accept |
| Mobile | Bottom sheet | Peek/expand sheet + list panel | Accept |

## Accepted adaptations

1. Literata instead of Instrument Serif.  
2. Visited chip (supported map query; not drawn in Stitch chips).  
3. Truthful reservation labels (not hard-coded RESERVE).  
4. Google content only via UI Kit — no custom ratings/photos/hours.  
5. MapLibre attribution (not mock “© Google” on canvas).  
6. 360px panel at 1024 so the map stage stays usable.  
7. Fork-style glyph in selected marker (legible deep-green pin + gold ring).  

## Overflow / Google boundary

Checked 1440–390: no horizontal page overflow.  
No Google mount without deliberate selection; collapsed mobile peek mounts none.

## Deletions

Old list/detail chrome inside `RestaurantMap` replaced by `stitch/map/*`.  
`MapCanvas`, query module, geocodes, and Google compact wrapper preserved.
