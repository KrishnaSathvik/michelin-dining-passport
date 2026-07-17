# Michelin Dining Passport (working title)

Independent discovery and personal tracking for **Michelin-starred restaurants in the United States**.

Editorial dining atlas + personal restaurant passport. Not affiliated with Michelin.

## Status

**Phase 6 in progress on `phase-6-auth-and-accounts`** — Supabase auth, RLS-backed personal data, and local→cloud Passport migration. Public discovery still uses the committed local restaurant dataset.

Phases 0–5.5 are on `main`. Building feature-first through Phases 2–7, then one consolidated UI/UX polish pass. Nonblocking visual issues live in [`docs/ui-ux-backlog.md`](./docs/ui-ux-backlog.md).

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
- [Reservations](./docs/reservations.md)
- [Reservation enrichment report](./docs/reservation-enrichment-report.md)
- [Supabase setup](./docs/supabase-setup.md)
- [Authentication](./docs/authentication.md)
- [RLS policies](./docs/rls-policies.md)
- [Local-to-cloud migration](./docs/local-to-cloud-migration.md)
- [UI/UX backlog](./docs/ui-ux-backlog.md)
- [Passport metrics](./docs/passport-metrics.md)
- [Map provider ADR](./docs/adr/0001-map-provider.md)

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- MapLibre GL for `/map`
- Supabase Auth + Postgres (personal data, RLS)
- `src/` directory, import alias `@/*`

## Local development

```bash
cp .env.example .env.local   # add Supabase keys from the Connect panel
npm install
npm run data:import
npm run data:validate
npm run data:validate-geocodes
npm run data:reservations:validate
npm run supabase:seed:generate
npm run supabase:start       # Docker required
npm run dev
```

### Data scripts

| Script | Purpose |
| --- | --- |
| `npm run data:import` | Read the workbook → write `data/restaurants.json` |
| `npm run data:validate` | Verify counts, star split, unique slugs, shared-address pairs |
| `npm run data:geocode` | Batch-geocode addresses into `data/geocodes.json` (never on page load) |
| `npm run data:validate-geocodes` | Geocode coverage / approval invariants |
| `npm run data:reservations:discover` | Discover candidate booking links from official websites |
| `npm run data:reservations:validate` | Reservation record invariants |
| `npm run data:reservations:report` | Write enrichment coverage report |
| `npm run data:reservations:review` | Print needs-review candidate report |
| `npm run data:reservations:check-links` | Manual freshness check for verified URLs |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run test` | Unit tests |
| `npm run test:e2e` | Playwright journeys |
| `npm run build` | Production build |
| `npm run supabase:start` | Local Supabase stack |
| `npm run supabase:reset` | Reset DB + migrations + seed |
| `npm run supabase:seed:generate` | Build `supabase/seed.sql` from JSON |
| `npm run supabase:types` | Generate DB TypeScript types |
| `npm run supabase:rls:validate` | Two-user RLS smoke tests |

Import/validation use Python’s standard library only (no XLSX package in the browser or Node runtime).

## Design direction

**Modern Dining Guide structure + Editorial Atlas visual identity + Immersive `/map`.**

## Next phase

Phase 7 — Admin roster tools, after Phase 6 verification and merge.
