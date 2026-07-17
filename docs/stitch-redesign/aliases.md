# Temporary compatibility aliases

Phase 1–7 introduce Stitch tokens, primitives, shell chrome, restaurant presentation, homepage, Explore directory, Map workspace, and restaurant detail.

## Restaurant detail (Phase 7 — complete)

| Item | Status | Notes |
|---|---|---|
| `restaurants/[slug]/page.tsx` composition | **Replaced** | `stitch/restaurant-detail/RestaurantDetailView` |
| `RestaurantPassportControls` | **Deleted** | `JourneyControls` + planning/visit dialogs |
| Legacy `RestaurantDetailStickyBar` | **Deleted** | Stitch sticky bar |
| Legacy `RestaurantRelatedList` / `RestaurantLocationPreview` | **Deleted** | Stitch related/nearby + location preview |
| `RestaurantGooglePlacesSection` | **Deleted** | Outer frame is `RestaurantGoogleSection`; `GooglePlaceDetails` preserved |
| Google UI Kit / lazy mount | Retained | Provider wrappers untouched |
| Reservation resolver / Passport store | Retained | Mutations via `usePassport` |

New detail location: `src/components/stitch/restaurant-detail/*`.

## Map (Phase 6 — complete)

| Item | Status | Notes |
|---|---|---|
| `RestaurantMap` presentation chrome | **Replaced** | Domain controller kept; UI is `stitch/map/*` |
| `MapCanvas.tsx` | Retained | MapLibre engine, clusters, fit/fly |
| `src/lib/map/query.ts` | Retained | Full map URL contract |
| `MapSelectedGooglePlace` | Retained | Compact kit; Stitch frame via `MapSelectedGoogleSection` |
| `MapWorkspaceShell` | Retained | Phase 2 no-footer viewport shell |

New map presentation: `src/components/stitch/map/*` → `MapWorkspaceView`.

## Explore (Phase 5 — complete)

| Item | Status | Notes |
|---|---|---|
| `src/components/explore/*` | **Deleted** | Replaced by `stitch/explore/*` |
| `src/lib/data/explore.ts` | Retained | Full URL/filter/sort/paginate contract |
| Explore loading | Replaced | `stitch/explore/ExploreLoadingState` via `explore/loading.tsx` |

New Explore location: `src/components/stitch/explore/*` → `ExplorePageView`.

## Homepage (Phase 4 — complete)

| Item | Status | Notes |
|---|---|---|
| `src/components/home/SearchHero.tsx` | **Deleted** | Replaced by `stitch/home/MarketingHero` |
| `src/components/home/FeaturedRestaurants.tsx` | **Deleted** | Replaced by `stitch/home/HomepageFeaturedSection` + Phase 3 cards |
| `src/components/home/BrowseByState.tsx` | **Deleted** | Removed from `/` (OD-08); taxonomy routes remain |
| `src/components/home/BrowseByCuisine.tsx` | **Deleted** | Same |
| `src/components/home/MapTeaser.tsx` | **Deleted** | Map remains at `/map` |
| `src/components/home/MichelinStarsExplained.tsx` | **Deleted** | Education remains at `/about-michelin-stars` |
| `src/components/home/PassportPreview.tsx` | **Deleted** | Passport remains at `/passport` |
| `src/config/homepage.ts` | Retained | Featured slugs + section copy for `/` |

New homepage location: `src/components/stitch/home/*` → `HomepageView`.

## Shell (Phase 2)

| Item | Status | Notes | Delete by |
|---|---|---|---|
| `src/components/layout/SiteHeader.tsx` | **Removed** | Replaced by `shell/AppHeader` + `AppHeaderClient` | Done |
| `src/components/layout/SiteFooter.tsx` | **Removed** | Replaced by `shell/SiteFooter` | Done |
| `src/components/layout/SiteFooterGate.tsx` | **Removed** | Footer gating lives in `shell/AppChrome` | Done |
| `siteConfig.nav` | Retained | Still used for product config; shell primary IA uses `config/navigation.ts` `primaryNav` | Phase 12 if unused |
| Legacy `Container` / `Section` | Retained | Old route bodies | Per-route phases |
| Auth form presentation | Retained | AuthShell scaffold only; forms Phase 10 | Phase 10 |
| Map workspace inner UI | Retained | `MapWorkspaceShell` wraps existing `RestaurantMap` | Phase 6 |

## Restaurant presentation (Phase 3)

| Legacy path | New replacement | Remaining importers | Delete by |
|---|---|---|---|
| `src/components/restaurant/RestaurantDiscoveryCard.tsx` | `stitch/restaurant/RestaurantDiscoveryCard` | Related lists, Passport grids (homepage + explore + taxonomy migrated) | Phase 6–8 |
| `src/components/restaurant/RestaurantCompactCard.tsx` | `stitch/restaurant/RestaurantListRow` | Passport lists (explore list migrated) | Phase 8 |
| `src/components/restaurant/RestaurantEditorialCard.tsx` | `stitch/restaurant/RestaurantEditorialCard` | Unused after Phase 4 homepage | Phase 7 cleanup if still unused |
| `src/components/restaurant/RestaurantMedia.tsx` | `stitch/restaurant/RestaurantMedia` | Legacy cards + detail | Phase 5–7 |
| `src/components/restaurant/RestaurantImageFallback.tsx` | `stitch/restaurant/RestaurantFallback` | Legacy media | Phase 5–7 |
| `src/components/restaurant/StarMark.tsx` | `stitch/restaurant/MichelinDistinction` | Legacy cards/detail | Phase 5–7 |
| `src/components/restaurant/ReservationButton.tsx` | `stitch/restaurant/ReservationAction` | Legacy cards + sticky bar | After cards/detail migrate |
| `src/components/restaurant/SaveRestaurantButton.tsx` | `stitch/restaurant/SaveAction` | Legacy cards + sticky bar | After cards/detail migrate |
| `src/components/restaurant/CuisineLabel.tsx` / `LocationLine.tsx` / `PriceMark.tsx` | `stitch/restaurant/RestaurantMeta` | Legacy cards | Phase 5–7 |
| `src/components/restaurant/RestaurantCardSkeleton.tsx` | `stitch/restaurant/RestaurantCardSkeleton` | Explore loading | Phase 5 |

**Policy:** Do not create circular re-export aliases between old and new cards.

Phase 1 stitch atoms (`MichelinDistinction`, `RestaurantMedia`, `RestaurantFallback`) re-export from `stitch/restaurant/*`.

## Tokens / fonts (Phase 1)

| Alias | Maps to | Why | Delete by |
|---|---|---|---|
| `--font-display` → Literata (`--font-literata`) | Display font for existing `font-display` classes | Avoid Instrument Serif while old pages still use `font-display` | Phase 12 |
| Legacy `--color-*` / `--radius-*` / `.container-editorial` | Kept for old components only | Keep unrebuilt routes compiling | Phase 12 cleanup |
| Legacy `src/components/ui/Button.tsx` | Untouched | Old routes | After shell/routes migrate |
| `siteConfig.productName` | `Dining Passport` | OD-02 | Permanent |

## Stitch locations

- Primitives: `src/components/stitch/`
- Restaurant presentation: `src/components/stitch/restaurant/`
- Homepage: `src/components/stitch/home/`
- Explore: `src/components/stitch/explore/`
- Map: `src/components/stitch/map/`
- Restaurant detail: `src/components/stitch/restaurant-detail/`
- Shell: `src/components/shell/`
- Nav config: `src/config/navigation.ts`

Rules:

1. New shell and stitch primitives must not import deleted SiteHeader/SiteFooter.
2. Do not render old and new headers together.
3. Do not apply legacy visual classes to AppHeader.
4. Homepage, Explore, Map, and restaurant detail compositions are complete; other route bodies remain unrebuilt until their phase.
5. Do not globally replace legacy cards on unrebuilt routes.
6. Do not delete `MapCanvas` or weaken Google mount gates while restyling map chrome.
7. Restaurant identity is first-party; Google photos/ratings/hours/reviews stay inside the single UI Kit component.
