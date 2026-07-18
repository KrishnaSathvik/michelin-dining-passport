# Deletion Plan

Goal: prevent the old design system from continuing to influence the new one.  
**Phase 12 status: executed.**

## Principles

1. Delete **route-local** old UI with its Stitch replacement.
2. Remove CSS token aliases by end of Phase 12 — **Done**.
3. Do not leave “deprecated but used” components without an owner.

---

## Obsolete components (by family)

| Family | Status |
|---|---|
| Application shell | **Done** — Stitch `AppHeader` / `SiteFooter` / `AppChrome` |
| Homepage | **Done** — legacy home modules deleted |
| Explore | **Done** — legacy explore modules deleted |
| Map chrome | **Done** — `stitch/map/*`; `MapCanvas` preserved |
| Restaurant cards / detail | **Done** — legacy `src/components/restaurant/*` deleted |
| Passport / collections | **Done** — Stitch views; store preserved |
| Auth / account | **Done** — Stitch shells; actions preserved |
| Taxonomy / education | **Done** — `TaxonomyPageShell` deleted |
| Layout Container/Section | **Done** — deleted Phase 12 |
| Legacy `src/components/ui/*` | **Done** — deleted Phase 12 |

## Dev / deprecated

| Path | Status |
|---|---|
| `GooglePlacesSpikeClient` + `/dev/google-places-spike` | **Deleted** |
| `/dev/stitch-account-preview` | **Deleted** |
| `/dev/stitch-foundation` | **Intentionally retained** — styleguide, prod 404 |
| `/dev/stitch-restaurant-components` | **Intentionally retained** — gallery e2e, prod 404 |
| `.paper-texture` | **Deleted** |

## Obsolete CSS / tokens

| Item | Status |
|---|---|
| Instrument Serif | **Deleted** (Phase 1) |
| Independent `--color-*` palette | **Deleted** (Phase 12) — Tailwind maps → `--dp-*` |
| Old `--radius-sm/md/lg` 6/10/12 | **Deleted** |
| `--shadow-float` | **Deleted** |
| `.container-editorial` / `.section-space` | **Deleted** |

## Obsolete utilities / wrappers

| Item | Status |
|---|---|
| Dual Container systems | **Done** — `PageContainer` only |
| Temporary `STITCH_UI_*` flags | **None remaining** |
| Re-export shims of old card names | **Deleted** with legacy cards |

## Prior rebuild docs

| Path | Action |
|---|---|
| `docs/ui-ux-rebuild/**` | Keep as historical archive; do not use as visual source |

## Deletion checklist (Phase 12)

- [x] New Stitch system states merged  
- [x] Screenshots accepted under `baselines/final/`  
- [x] Tests updated and green  
- [x] `rg` shows no production imports of replaced files  
- [x] Files deleted  
- [x] This document marked Done / Intentionally retained
