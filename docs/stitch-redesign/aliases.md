# Temporary compatibility aliases

Phase 1 introduces an independent Stitch `--dp-*` token system and `src/components/stitch/*` primitives.

Existing production routes continue to use legacy presentation components and legacy CSS tokens until each route is rebuilt.

## Active aliases (Phase 1)

| Alias | Maps to | Why | Delete by |
|---|---|---|---|
| `--font-display` → Literata (`--font-literata`) | Display font for existing `font-display` classes | Avoid loading Instrument Serif while old pages still use `font-display` | Phase 12 (or when no callers remain) |
| `--font-instrument-serif` CSS variable name unused | Removed from layout | OD-03 | Done in Phase 1 |
| Legacy `--color-*` / `--radius-*` / `.container-editorial` | Kept for old components only | Keep existing routes compiling and visually stable until replaced | End of each route phase → Phase 12 cleanup |
| Legacy `src/components/ui/Button.tsx` | Untouched | Old routes import it | Delete when no imports (after shell/routes migrate) |
| Legacy `Container` / `Section` | Untouched | Old routes | Phase 2–12 per deletion-plan |
| Legacy `RestaurantMedia` / `StarMark` / fallbacks | Untouched | Old cards/detail | Phase 3–7 |

## Rules

1. New Stitch primitives must import **only** `--dp-*` tokens and `src/components/stitch/*`.
2. Do not restyle legacy components “in place” to approximate Stitch.
3. Do not import legacy presentation into Stitch primitives.
4. When a route migrates, switch it to Stitch primitives and remove its legacy imports in the same PR when practical.
