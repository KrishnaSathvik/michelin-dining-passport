# Michelin Dining Passport (working title)

Independent discovery and personal tracking for **Michelin-starred restaurants in the United States**.

Editorial dining atlas + personal restaurant passport. Not affiliated with Michelin.

## Status

**Phase 3 complete** — restaurant detail, taxonomy hubs, Michelin education page, sitemap/robots, and structured data.

Building feature-first through Phases 2–7, then one consolidated UI/UX polish pass. Nonblocking visual issues live in [`docs/ui-ux-backlog.md`](./docs/ui-ux-backlog.md).

| Metric | Value |
| --- | ---: |
| Restaurants | 271 |
| 1-star | 216 |
| 2-star | 39 |
| 3-star | 16 |
| States / districts | 14 |

Dataset workbook: [`data/usa_michelin_starred_restaurants_by_state_2026.xlsx`](./data/usa_michelin_starred_restaurants_by_state_2026.xlsx)  
Committed JSON: [`data/restaurants.json`](./data/restaurants.json)

## Docs

- [Product requirements](./docs/product-requirements.md)
- [Data audit](./docs/data-audit.md)
- [Architecture](./docs/architecture.md)
- [Design system & homepage directions](./docs/design-system.md)
- [Implementation plan](./docs/implementation-plan.md)
- [UI/UX backlog](./docs/ui-ux-backlog.md)

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- `src/` directory, import alias `@/*`
- No Supabase / Maps / auth yet

## Local development

```bash
npm install
npm run data:import
npm run data:validate
npm run dev
```

### Data scripts

| Script | Purpose |
| --- | --- |
| `npm run data:import` | Read the workbook → write `data/restaurants.json` |
| `npm run data:validate` | Verify counts, star split, unique slugs, shared-address pairs |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run test` | Unit tests (Explore query engine) |
| `npm run build` | Production build |

Import/validation use Python’s standard library only (no XLSX package in the browser or Node runtime).

## Design direction

**Modern Dining Guide structure + Editorial Atlas visual identity + Immersive `/map` later.**

## Next phase

Phase 3 — restaurant detail and taxonomy pages after Phase 2 merges.
