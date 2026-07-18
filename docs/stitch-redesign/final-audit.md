# Final audit — Stitch full redesign Phase 12

## Source

| Item | Value |
|---|---|
| Branch | `stitch-full-redesign` |
| Phase 12 start commit | `5fe01ac2f072b27f445ab2562534c490898085d1` |
| Prior markers | `bc034e0` header search; `5fe01ac` taxonomy/education |
| Test port | **3112** (`E2E_PORT`, Playwright `reuseExistingServer` only for owned server) |
| Visual SoT | Stitch (`docs/designs/`, not `docs/ui-ux-rebuild/`) |
| Functional SoT | Current app domain logic (unchanged) |

## Routes completed

Phases 1–11 routes remain; Phase 12 added global system states and cleanup. Inventory: [`final-route-inventory.md`](./final-route-inventory.md).

## Design references

- `docs/designs/dining_passport_system_states/`
- Per-route baselines under `docs/stitch-redesign/baselines/*`
- Final set: `docs/stitch-redesign/baselines/final/`

## System states

| State | Implementation | Result |
|---|---|---|
| Global 404 | `src/app/not-found.tsx` → `NotFoundState` | Pass — HTTP 404 + UI |
| Invalid public resources | `dynamicParams = false` + `notFound()`; removed sibling `loading.tsx` that forced streamed 200 | Pass — restaurants/taxonomy/stars |
| Route error | `src/app/error.tsx` → `RouteErrorState` + `reset()` | Pass |
| Global error | `src/app/global-error.tsx` independent shell | Pass |
| Network unavailable | `NetworkUnavailableState` | Pass (reusable) |
| Provider unavailable | Updated Google copy + Stitch tokens | Pass |
| Loading / empty | Existing Stitch states retained; proof modes stay **dev-only** | Pass |

## Invalid-route HTTP status (production `next start` :3112)

| Path | Status |
|---|---|
| `/this-route-does-not-exist-phase12` | 404 |
| `/restaurants/not-a-real-slug-zzz` | 404 |
| `/usa/not-a-real-state-zzz` | 404 |
| `/cities/not-a-real-city-zzz` | 404 |
| `/cuisines/not-a-real-cuisine-zzz` | 404 |
| `/stars/4` | 404 |
| `/restaurants/benu-san-francisco-ca` | 200 |
| `/usa/california` | 200 |

Root cause of prior 200s: sibling `loading.tsx` streaming. Fix: remove those loaders on notFound routes + `dynamicParams = false` on restaurants.

## Responsive

Overflow audit script PASS at 1440/1280/1024/768/390 for major routes. No root `overflow-x: hidden` applied.

## Accessibility

- Skip link, focus rings, landmarks, one H1 on audited routes (Playwright shell/explore/auth).
- Dialogs/drawers Escape + focus restore covered in explore/shell e2e.
- No axe package in repo; manual + Playwright role assertions used. Remaining: broaden axe CI (see remaining-debt).

## Visual regression

Complete final set listed in `baselines/final/final-reference-index.md`. Review: `baselines/final/final-visual-review.md`.

## Functional regression

- `npm run typecheck` Pass
- `npm run lint` Pass
- `npm test` Pass (phase12 live HTTP included when server up)
- `npm run secrets:scan` Pass
- `npm run build` Pass
- Playwright on :3112 — **98 passed**, 9 skipped (dev galleries / proof=loading in production)

## Google boundaries

Homepage / Explore / Passport / Collections / taxonomy: no UI Kit mounts (e2e). Map compact after selection; detail full section with fallback when disabled.

## Security / privacy

Secrets scan Pass; matching key remains server-only; auth/account noIndex patterns retained; no private notes in metadata.

## Cleanup

| Item | Result |
|---|---|
| Legacy home/explore/restaurant/layout/ui trees | **Deleted** |
| Google spike + account preview | **Deleted** |
| Old `--color-*` palette / `--shadow-float` / `.container-editorial` | **Removed** as independent system; Tailwind convenience maps → `--dp-*` |
| Dual Container systems | **Removed** (legacy Container/Section deleted) |
| Dev styleguide | Keep `/dev/stitch-foundation` + restaurant gallery (prod 404) |

## Known accepted deviations

- Account final screenshots show unauthenticated redirect (no live session in capture).
- `proof=*` query modes intentionally disabled in production.
- Restaurant presentation gallery e2e skipped under `next start` (prod 404) — unit/source tests remain.
- Convenience Tailwind aliases (`bg-bg` → `--dp-bg`) retained until opportunistic `dp-*` renames; single token source remains `--dp-*`.
