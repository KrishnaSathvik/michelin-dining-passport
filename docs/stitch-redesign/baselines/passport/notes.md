# Phase 8 — Passport & personal lists baselines

Captured against Stitch references under `docs/designs/` and implementation under `src/components/stitch/passport/`.

## Design inspection (pre-implementation)

### Active Passport (`personal_passport`)

| Topic | Spec |
|---|---|
| Section order | AppHeader → My Passport intro → Journey summary (3) → Stars Collected + States Explored → Collections preview → sync notice → SiteFooter |
| Hero | Eyebrow `My Passport`; H1 ~36→48px Literata; supporting from real metrics; Explore + Map CTAs |
| Summary cards | 3-col desktop; surface-low; label 12px caps; value 32px Literata bold |
| Stars Collected | Progress rows for 1★ / 2★ / 3★ vs catalog denominators; burgundy bars |
| States Explored | Explored / catalog total; secondary gold bar; map CTA |
| Collections | Up to 3 real collections; 4:3 cover; count + visited count; link to `/collections/[slug]` |
| Spacing | Content max ~1280px; margins 20/64; section rhythm ~80px |
| Unsupported | Fake names, membership tiers, bottom nav, L'Assiette, Google content |

### Empty Passport (`personal_passport_new_user_state`)

| Topic | Spec |
|---|---|
| Composition | Centered aspirational H1 → dual CTAs → journey illustration band → 3 educational steps → device/cloud note |
| H1 | `Your dining journey starts with one table.` |
| Unsupported | Alternate mock nav; fake collection cards as real data; auth requirement |

### Saved / Planned / Visited

| Route | Card / row | Toolbar | Empty |
|---|---|---|---|
| `/saved` | 4:3 grid cards; Added date; Save; ReservationAction; Move to Planned | Search, stars/state/cuisine, sort, grid/list | Explore + Map |
| `/planned` | 320px media + agenda row; planned date; Edit plan; Mark visited; truthful reserve | Search, filters, upcoming sort | Saved + Explore + Map |
| `/visited` | 4:3 cards; visit date; dishes/notes when present; Favorite; Edit visit | Search, filters, visit-date sort | Explore + Planned + Map |

Visited title locked: H1 `Visited`, subtitle `Your dining history`.

### Metric definitions

- **Visited:** unique `visited === true`
- **To Visit (OD-09):** unique `(wantToVisit \|\| planned) && !visited`
- **Favorites:** unique `favorite === true`
- **Stars Collected:** sum of Michelin stars for unique visited restaurants
- **States Explored:** unique visited state slugs vs catalog region count

### Local list UX

Search / sort / filters are **local-only** (not URL query params). Refresh resets to defaults. Documented here intentionally.

### Saved predicate

`saved === true` (includes restaurants that remain saved after a visit). Distinct from To Visit.

### Planned + Visited coexistence

Records may remain both Planned and Visited; UI shows an “Also visited” chip. No automatic cleanup.

## Visual comparison vs references

| Area | Match | Accepted deviations |
|---|---|---|
| Active silhouette | Section order and summary/progress modules align with `personal_passport` | H1 copy uses “Your dining journey” (brand-safe); one-star progress row included for completeness |
| Empty | Hero + CTAs + steps match new-user body | Illustrative ghost map/collection art simplified to Save→Plan→Visit nodes (no fake restaurants) |
| Summary cards | 3-col, large numerals | Linked Visited→`/visited`, To Visit→`/planned`; Favorites non-linked (no `/favorites`) |
| Saved cards | Grid + Move to Planned | Uses Phase 3 media/fallback + truthful ReservationAction |
| Planned rows | Vertical agenda | “Manage Reservation” → resolver labels only |
| Visited cards | Grid + dishes/notes | No visit photos (unsupported); personal rating preserved in dialog but not displayed |
| Sync notice | Device-only + signed-in | No invented last-sync timestamps |
| Responsive | 1440→390 stacking | No bottom nav; no metric carousels |

## Proof paths

- References: `baselines/passport/references/*`
- Active: `baselines/passport/active/*`
- Empty: `baselines/passport/empty/*`
- Saved / Planned / Visited: `baselines/passport/{saved,planned,visited}/*`

Capture: `node scripts/capture_passport_baselines.mjs` with app on `:3000`.

## Privacy

Page metadata is generic (no private notes, dishes, or ratings). Personal list state is client-only.
