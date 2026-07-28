# Foundation baseline notes — Phase 1

**Date:** 2026-07-17  
**Route:** `/dev/stitch-foundation` (development only; `notFound()` in production)  
**Stitch reference:** `docs/designs/dining_passport_component_library/screen.png` (copied as `stitch-reference.png`)

## Match

- Literata display + Inter UI
- Core `--dp-*` palette (canvas `#fcf9f8`, surface `#ffffff`, primary `#123b2f`, star gold `#b88a2a`)
- 48px primary/secondary/ghost buttons with 8px radius
- 48px inputs / search / select
- Soft chips with 4px radius (not large pills)
- Michelin distinction marks in star gold only
- 4:3 restaurant fallback media
- Drawer and dialog primitives with Escape/backdrop close
- Empty state and skeleton grid patterns
- No horizontal overflow at 1440 / 768 / 390 after path wrap fix

## Meaningful differences vs Stitch component-library reference

1. **Root app chrome still wraps the page.** SiteHeader + SiteFooter from the unrebuilt shell appear above/below the foundation canvas. Stitch reference is a standalone library page without that chrome. Phase 2 will replace the shell; until then dual headers are expected on this dev route.
2. **Product wordmark** in the foundation strip is “Dining Passport” (OD-02). Reference matches.
3. **Google Places module** shown in the Stitch HTML library is **not** duplicated here as a custom recreation. Google remains behind the existing UI Kit wrappers (Phase 6–7). Foundation shows media/fallback + empty/loading only.
4. **Discovery/editorial card composites** from the library HTML are deferred to Phase 3 (shared restaurant presentation). Phase 1 ships media/fallback + distinction atoms only.
5. **Material Symbols** icon font is not loaded; icon buttons use inline SVG strokes for Phase 1.
6. **Reference PNG is a narrow tall crop** of the library; our screenshots are full-page captures of the live foundation route at 1440 / 768 / 390.
7. **Display type** uses Literata exclusively (OD-03). Some Stitch HTML files also referenced Instrument Serif; those are non-canonical.

## Accepted for Phase 1

Differences 1–7 above. “Similar direction” is not claimed as visual approval of route compositions — Phase 1 only locks the token/primitives foundation.

## Production behavior changed in Phase 1

- Display font sitewide: Instrument Serif → Literata (existing `font-display` callers)
- `siteConfig.productName` → `Dining Passport` (metadata / titles)
- Legacy page canvas colors unchanged (`--color-bg` still white for unrebuilt routes)
- New `/dev/stitch-foundation` route (dev only)
