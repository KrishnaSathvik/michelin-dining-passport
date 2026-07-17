# Michelin Dining Passport (working title)

Independent discovery and personal tracking for **Michelin-starred restaurants in the United States**.

Editorial dining atlas + personal restaurant passport. Not affiliated with Michelin.

## Status

**Phase 7 on `phase-7-production-readiness`** — production readiness and safe data-maintenance scripts (no admin dashboard). Phases 0–6 are complete on feature branches; polish is deferred to `ui-ux-polish`.

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
- [Data update workflow](./docs/data-update-workflow.md)
- [Restaurant identity](./docs/restaurant-identity.md)
- [Production deployment](./docs/production-deployment.md)
- [Monitoring](./docs/monitoring.md)
- [Security checklist](./docs/security-checklist.md)
- [Launch checklist](./docs/launch-checklist.md)
- [Reservations](./docs/reservations.md)
- [Supabase setup](./docs/supabase-setup.md)
- [Authentication](./docs/authentication.md)
- [UI/UX backlog](./docs/ui-ux-backlog.md)

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
| `npm run data:diff` | Diff a new XLSX/CSV/JSON roster against the canonical dataset |
| `npm run data:apply-update` | Dry-run (default) or confirmed apply of a reviewed diff |
| `npm run data:geocode` | Batch-geocode addresses into `data/geocodes.json` |
| `npm run data:validate-geocodes` | Geocode coverage / approval invariants |
| `npm run data:geocodes:maintain` | Missing coords, bounds, shared points, overrides |
| `npm run data:reservations:discover` | Discover candidate booking links |
| `npm run data:reservations:validate` | Reservation record invariants |
| `npm run data:reservations:maintain` | Recheck / review-failed / overrides |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run test` | Unit tests |
| `npm run test:e2e` | Playwright journeys |
| `npm run build` | Production build |
| `npm run secrets:scan` | Lightweight committed-secret scan |
| `npm run audit:deps` | npm dependency audit |

## Design direction

**Modern Dining Guide structure + Editorial Atlas visual identity + Immersive `/map`.**

## Next phase

**UI/UX polish** on `ui-ux-polish` after Phase 7 verification — see [`docs/ui-ux-backlog.md`](./docs/ui-ux-backlog.md).
