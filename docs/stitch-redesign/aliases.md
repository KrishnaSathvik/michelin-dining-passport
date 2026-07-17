# Temporary compatibility aliases

Phase 1–3 introduce Stitch `--dp-*` tokens, `src/components/stitch/*` primitives, `src/components/shell/*` chrome, and `src/components/stitch/restaurant/*` presentation.

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
| `src/components/restaurant/RestaurantDiscoveryCard.tsx` | `stitch/restaurant/RestaurantDiscoveryCard` | Homepage, Explore, taxonomy, related lists, Passport grids | Phase 4–8 route rebuilds (zero imports) |
| `src/components/restaurant/RestaurantCompactCard.tsx` | `stitch/restaurant/RestaurantListRow` (+ Passport list variants later) | Explore list, Passport lists | Phase 5 / 8 |
| `src/components/restaurant/RestaurantEditorialCard.tsx` | `stitch/restaurant/RestaurantEditorialCard` | Homepage featured | Phase 4 |
| `src/components/restaurant/RestaurantMedia.tsx` | `stitch/restaurant/RestaurantMedia` | Legacy cards + detail | Phase 4–7 |
| `src/components/restaurant/RestaurantImageFallback.tsx` | `stitch/restaurant/RestaurantFallback` | Legacy media | Phase 4–7 |
| `src/components/restaurant/StarMark.tsx` | `stitch/restaurant/MichelinDistinction` | Legacy cards/detail | Phase 4–7 |
| `src/components/restaurant/ReservationButton.tsx` | `stitch/restaurant/ReservationAction` | Legacy cards + sticky bar | After cards/detail migrate |
| `src/components/restaurant/SaveRestaurantButton.tsx` | `stitch/restaurant/SaveAction` | Legacy cards + sticky bar | After cards/detail migrate |
| `src/components/restaurant/CuisineLabel.tsx` / `LocationLine.tsx` / `PriceMark.tsx` | `stitch/restaurant/RestaurantMeta` | Legacy cards | Phase 4–7 |
| `src/components/restaurant/RestaurantCardSkeleton.tsx` | `stitch/restaurant/RestaurantCardSkeleton` (+ row/editorial/map skeletons) | Explore loading | Phase 5 |

**Policy:** Do not create circular re-export aliases between old and new cards. Old routes keep importing legacy components until their dedicated phase. New components are validated at `/dev/stitch-restaurant-components` (dev-only).

Phase 1 stitch atoms (`MichelinDistinction`, `RestaurantMedia`, `RestaurantFallback`) now re-export from `stitch/restaurant/*`.

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
- Shell: `src/components/shell/`
- Nav config: `src/config/navigation.ts`

Rules:

1. New shell and stitch primitives must not import deleted SiteHeader/SiteFooter.
2. Do not render old and new headers together.
3. Do not apply legacy visual classes to AppHeader.
4. Route bodies remain unrebuilt until their phase.
5. Do not globally replace legacy cards on old routes during Phase 3.
