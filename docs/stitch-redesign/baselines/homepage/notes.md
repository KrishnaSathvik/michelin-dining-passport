# Phase 4 — Homepage baselines (explore_feed)

Primary reference: `docs/designs/explore_feed/screen.png` (copied as `stitch-reference.png`).

## Capture set

| File | Notes |
|---|---|
| `stitch-reference.png` | Stitch explore_feed screen |
| `impl-1440.png` | Full page desktop |
| `impl-1280.png` | Content-width desktop |
| `impl-1024.png` | Tablet landscape |
| `impl-768.png` | Tablet |
| `impl-390.png` | Mobile — no horizontal overflow |
| `hero-1440.png` | Full-bleed hero only |
| `stats-1440.png` | Four-stat strip |
| `featured-cards-1440.png` | Three discovery cards |
| `featured-fallback.png` | Named-restaurant fallback (no approved photos) |
| `featured-save-states.png` | Save control on featured cards |
| `truthful-reservation-labels.png` | Resolver CTAs on cards |
| `homepage-loading.png` | `?proof=loading` (dev only) |
| `homepage-missing-featured.png` | `?proof=empty` (dev only) |

## Composition checklist (from Stitch HTML)

Recorded before implementation:

1. Section order: Header → Hero → Stats → Featured (3 cards) → Footer  
2. Hero height: `614px` / `min-height 500px`  
3. Headline: centered, large serif, ~max content width  
4. Image: full-bleed atmospheric dining room; `primary/40` overlay  
5. No hero search / no hero CTA group in Stitch source  
6. Stats: 4 equal columns, dividers, Literata values, caps labels, star marks on star rows  
7. Featured: soft surface, section title + View All, 3-col discovery cards, 80px section padding  
8. Margins: 64px desktop / 20px mobile; content max 1280  
9. Footer: soft surface, independence disclaimer  

## Comparison

| Dimension | Stitch | Implementation | Verdict |
|---|---|---|---|
| Page silhouette | Hero → stats → 3 cards → footer | Matches | Accept |
| Hero height | ~614px | `h-[min(614px,85vh)] min-h-[500px]` | Accept |
| Hero crop | Moody dining room, centered | Local atmospheric photo + `primary/40` | Accept |
| Text block | Centered, max ~2xl support | Matches | Accept |
| Heading scale | 48–64px display | Literata 36 → 48 → 64 | Accept |
| CTA placement | None in hero; View All in featured | Matches (header search retained globally) | Accept |
| Stats | 4 equal; 2×2 tablet | Same | Accept |
| Section spacing | ~80px featured padding | `--dp-section` | Accept |
| Card width/ratio | 3-col 4:3 media | Phase 3 discovery cards | Accept |
| Footer transition | Soft low surface into footer | Featured `bg-dp-surface-low` → Phase 2 footer | Accept |
| Mobile | 1-col cards; stacked hero | Matches; no overflow | Accept |

## Accepted content adaptations

1. Headline adapted from “The Guide to America's Finest Tables” → “America's Michelin-starred tables” (factual; preserves centered hero silhouette).  
2. Supporting copy uses live restaurant count; no epicurean marketing claims.  
3. “Featured Destinations” → “Featured Restaurants” (restaurants, not destinations).  
4. Card media uses designed fallbacks until approved first-party photos exist — not Stitch stock food.  
5. Distinction + Save placement follow Phase 3 discovery card contract (stars below media + overlay save) rather than Stitch badge-on-image-only.  
6. No Privacy/Terms footer links (no routes).  
7. Hero uses Literata (OD-03), not Instrument Serif from the HTML mock.

## Overflow

Checked 1440 / 1280 / 1024 / 768 / 390: `scrollWidth === clientWidth`.

## Google boundary

Zero `gmp-place-details` mounts on `/`.

## Deletions

Obsolete `src/components/home/*` presentation removed after cutover. No alternate old homepage retained.
