# Michelin Dining Passport (working title)

Independent discovery and personal tracking for **Michelin-starred restaurants in the United States**.

Editorial dining atlas + personal restaurant passport. Not affiliated with Michelin.

## Status

**Phase 0 complete** — dataset audited, product/docs/design foundation locked. Homepage not built yet.

| Metric | Value |
| --- | ---: |
| Restaurants | 271 |
| 1-star | 216 |
| 2-star | 39 |
| 3-star | 16 |
| States / districts | 14 |

Dataset: [`data/usa_michelin_starred_restaurants_by_state_2026.xlsx`](./data/usa_michelin_starred_restaurants_by_state_2026.xlsx)

## Docs

- [Product requirements](./docs/product-requirements.md)
- [Data audit](./docs/data-audit.md)
- [Architecture](./docs/architecture.md)
- [Design system & homepage directions](./docs/design-system.md)
- [Implementation plan](./docs/implementation-plan.md)

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- `src/` directory, import alias `@/*`
- No Supabase / Maps / auth yet

## Local development

```bash
npm install
npm run dev
```

## Recommended design direction

**Modern Dining Guide structure + Editorial Atlas visual identity + Immersive map page (later).**

See `docs/design-system.md`.

## Next phase

Build the static homepage only (real restaurant records, placeholder imagery, no auth/Supabase/Maps).
