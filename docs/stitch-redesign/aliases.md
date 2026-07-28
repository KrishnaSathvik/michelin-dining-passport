# Compatibility aliases (Phase 12 — closed)

Migration aliases are resolved. One active presentation system remains: Stitch `--dp-*` tokens + `src/components/stitch/*` + `src/components/shell/*`.

## Resolved / deleted

| Item | Status |
|---|---|
| Legacy `SiteHeader` / `SiteFooter` | Deleted (Phase 2) |
| Legacy home / explore / restaurant / layout / ui trees | **Deleted (Phase 12)** |
| Legacy `Container` / `Section` / `.container-editorial` / `.section-space` / `.paper-texture` | **Deleted (Phase 12)** |
| Independent `--color-*` palette, `--radius-sm/md/lg` 6/10/12, `--shadow-float` | **Deleted (Phase 12)** |
| Google Places spike + account preview | **Deleted (Phase 12)** |
| `STITCH_UI_*` route flags | Never shipped / none remaining |
| TaxonomyPageShell | Deleted (Phase 11) |

## Intentionally retained (non-visual)

| Item | Reason |
|---|---|
| `--font-display` → Literata | Utility class name used across Stitch components; maps to `--font-literata` |
| Tailwind `@theme` convenience colors (`bg`, `ink`, `forest`, …) | Thin aliases of `--dp-*` only — not a second palette |
| `/dev/stitch-foundation` | Single internal styleguide; `notFound()` in production |
| `/dev/stitch-restaurant-components` | Presentation e2e under `next dev`; `notFound()` in production |
| `siteConfig.productName` / `primaryNav` | Product config, not visual aliases |
| Domain modules (PassportProvider, MapCanvas, GooglePlaceDetails, explore query, reservations) | Functional SoT |

## Stitch locations (canonical)

- Primitives / system states: `src/components/stitch/` (+ `stitch/system/`)
- Restaurant: `src/components/stitch/restaurant/`
- Routes: `stitch/home|explore|map|restaurant-detail|passport|collections|auth|account|taxonomy|education`
- Shell: `src/components/shell/`
- Tokens: `src/app/globals.css` (`--dp-*`)

Rules:

1. Do not reintroduce legacy presentation trees.
2. Prefer `bg-dp-*` / `text-dp-*` in new code.
3. Do not restore Google spike or dual container systems.
