# Deletion Plan

Goal: prevent the old design system from continuing to influence the new one. Delete obsolete presentation once its replacement is shipped and accepted.

## Principles

1. Delete **route-local** old UI in the same PR that ships the Stitch replacement when practical.
2. Keep shared old components only while any route still imports them; track remaining importers.
3. Remove CSS token aliases by end of Phase 12.
4. Do not leave “deprecated but used” components without an owner issue.

---

## Obsolete components (by family)

### Application shell (Phase 2 — done)

| Path | Status |
|---|---|
| `src/components/layout/SiteHeader.tsx` | **Deleted** — replaced by `src/components/shell/AppHeader*` |
| `src/components/layout/SiteFooter.tsx` | **Deleted** — replaced by `src/components/shell/SiteFooter` |
| `src/components/layout/SiteFooterGate.tsx` | **Deleted** — gating in `AppChrome` |
| Auth layout forest aside | **Replaced** by `AuthShell` scaffold (forms still Phase 10) |

Remaining for later phases: legacy `Container`/`Section`, route bodies, old cards.

### Homepage (Phase 4 — complete)

| Path | Status |
|---|---|
| `src/components/home/SearchHero.tsx` | **Deleted** |
| `src/components/home/FeaturedRestaurants.tsx` | **Deleted** |
| `src/components/home/BrowseByState.tsx` | **Deleted** |
| `src/components/home/BrowseByCuisine.tsx` | **Deleted** |
| `src/components/home/MapTeaser.tsx` | **Deleted** |
| `src/components/home/MichelinStarsExplained.tsx` | **Deleted** |
| `src/components/home/PassportPreview.tsx` | **Deleted** |

Replacement: `src/components/stitch/home/*` (`HomepageView`). Config retained in `src/config/homepage.ts`.

### Explore (Phase 5 — complete)

| Path | Status |
|---|---|
| `src/components/explore/ExploreSearchBar.tsx` | **Deleted** |
| `src/components/explore/ExploreQuickFilters.tsx` | **Deleted** |
| `src/components/explore/ExploreFilterDrawer.tsx` | **Deleted** |
| `src/components/explore/ExploreFilterFields.tsx` | **Deleted** |
| `src/components/explore/ExploreActiveFilters.tsx` | **Deleted** |
| `src/components/explore/ExploreToolbar.tsx` | **Deleted** |
| `src/components/explore/ExploreSortSelect.tsx` | **Deleted** |
| `src/components/explore/ExploreResults.tsx` | **Deleted** |
| `src/components/explore/ExplorePagination.tsx` | **Deleted** |
| `src/components/explore/ExploreEmptyState.tsx` | **Deleted** |

Replacement: `src/components/stitch/explore/*` (`ExplorePageView`). Keep `src/lib/data/explore.ts` forever (logic).

### Map (Phase 6 — complete)

| Path | Status |
|---|---|
| Old panel/list/detail/sheet chrome inside `RestaurantMap.tsx` | **Replaced** — controller retained; presentation is `stitch/map/*` |
| Legacy `ReservationButton` / `SaveRestaurantButton` on map | **Removed from map** — uses Phase 3 actions |
| `MapCanvas.tsx` | **Preserved** |
| `src/lib/map/query.ts` | **Preserved** |

Replacement: `src/components/stitch/map/*` (`MapWorkspaceView`) + preserved `RestaurantMap` domain controller.

### Restaurant cards / detail (after Phases 3 & 7)

| Path | Status | When safe |
|---|---|---|
| Legacy `RestaurantDiscoveryCard` | **Still imported** by taxonomy / dead home modules | Phase 9–11 |
| Legacy `RestaurantCompactCard` | **Still imported** by explore remnants only | Phase 12 |
| Legacy `RestaurantEditorialCard` | Check importers | Delete when unused |
| Legacy `RestaurantMedia` / `RestaurantImageFallback` / `StarMark` | **Still imported** by legacy cards | After Passport card migrations |
| Legacy `ReservationButton` / `SaveRestaurantButton` | **Still imported** by legacy Passport cards | After Passport migrate |
| `RestaurantDetailStickyBar` (legacy) | **Deleted** | Phase 7 |
| `RestaurantRelatedList` / `RestaurantLocationPreview` | **Deleted** | Phase 7 |
| `RestaurantPassportControls` | **Deleted** | Phase 7 — logic in `JourneyControls` |
| `RestaurantGooglePlacesSection` | **Deleted** | Phase 7 — frame is `RestaurantGoogleSection`; kit preserved |
| Detail route composition | **Replaced** | `stitch/restaurant-detail/*` |
| New map/related/nearby presentation | Shipped in Phase 3 under `stitch/restaurant/` | **Adopted in Phase 7** |

**Phase 7 restaurant-detail visual migration is complete.** Gallery: `/dev/stitch-restaurant-components` (production `notFound`).

### Passport / collections (after Phases 8–9)

| Path | Status |
|---|---|
| Old `PassportHome` | **Deleted** — replaced by `stitch/passport/*` |
| Old `PassportRestaurantList` | **Deleted** — replaced by `PassportListPage` + mode cards |
| Old saved/visited page chrome | **Replaced** — Stitch list routes |
| `/planned` | **Added** — view over existing `planned` flag (no schema change) |
| Old `CollectionsManager` / `CollectionDetail` presentation | **Deleted** — replaced by `stitch/collections/*` |

**Phase 8 Passport and personal-list visual migration is complete.**

**Phase 9 Collections visual migration is complete.**

Preserve `PassportProvider` and store modules.

### Auth / account (after Phase 10)

| Path | When safe |
|---|---|
| Old `(auth)/layout.tsx` aside styling | After AuthShell |
| Old `AuthForm` presentation | After rebuild (keep action wiring) |
| Old `AccountPanel` sections not in Stitch and unused | After account IA ships |

### Taxonomy (after Phase 11)

| Path | When safe |
|---|---|
| `TaxonomyPageShell` old composition | After new taxonomy components |

### Dev / deprecated

| Path | When safe |
|---|---|
| `src/components/google-places/GooglePlacesSpikeClient.tsx` | After prod Google paths stable |
| `src/app/dev/google-places-spike/page.tsx` | Same |
| `.paper-texture` utility | Phase 1 once callers gone |

---

## Obsolete CSS / tokens

| Item | Deletion point |
|---|---|
| Instrument Serif `next/font` wiring | **Removed in Phase 1** |
| Old SiteHeader/SiteFooter CSS coupling | **Removed in Phase 2** with component deletion |
| `--color-*` old palette | Phase 12 after no references |
| `--radius-sm/md/lg` 6/10/12 | Phase 12 |
| `--shadow-float` | Phase 1 for new UI; delete globally Phase 12 |
| `.container-editorial` / `.section-space` | After PageContainer adoption |
| Any cream/paper identity remnants | Immediately if found |

---

## Obsolete utilities / wrappers

| Item | Notes |
|---|---|
| Dual Container systems | One `PageContainer` only by Phase 12 |
| Temporary `STITCH_UI_*` flags | Remove when route stable |
| Re-export shims of old card names | Max one release; then delete |

---

## Prior rebuild docs

| Path | Action |
|---|---|
| `docs/ui-ux-rebuild/**` | Keep as historical archive; do not use as visual source |
| Rejected screenshots under `docs/ui-ux-rebuild/current/` | Evidence of failed reskin approach — reference in reviews if needed |

---

## Deletion checklist (per route PR)

- [ ] New Stitch components merged  
- [ ] Screenshots accepted  
- [ ] Tests updated and green  
- [ ] `rg` shows no imports of replaced files  
- [ ] Delete files in same or immediate follow-up PR  
- [ ] Update this document’s “when safe” rows to Done
