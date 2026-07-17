# Launch checklist

## Before launch

1. Merge Phase 6 auth after real authentication smoke test.
2. Merge Phase 7 production readiness (this branch).
3. Configure production Supabase project + Vercel env vars ([production-deployment.md](./production-deployment.md)).
4. Verify Auth Site URL, redirects, email, and optional Google OAuth.
5. Run full verification suite (below).
6. Legal drafts reviewed by counsel (pages are marked launch drafts until then).
7. Choose analytics/monitoring vendors or keep flags disabled.
8. Complete UI/UX polish on a dedicated `ui-ux-polish` branch **after** this phase.

## Verification commands

```bash
npm run data:validate
npm run data:validate-geocodes
npm run data:reservations:validate
npm run data:seed-validate
npm run typecheck
npm run lint
npm test
npm run supabase:rls:validate   # requires local Supabase
npm run test:e2e
npm run build
npm run secrets:scan
npm run audit:deps
```

Optional data-maintenance smoke:

```bash
npm run data:diff -- --file ./data/restaurants.json
npm run data:geocodes:maintain -- list-missing
npm run data:geocodes:maintain -- detect-shared
npm run data:reservations:maintain -- review-failed
```

## Confirm

- [ ] 271 restaurants remain before applying test fixtures
- [ ] User data survives simulated restaurant updates (slug/ID preservation)
- [ ] Star history retained via `restaurant_awards`
- [ ] Public discovery works without Supabase
- [ ] No real secrets committed
- [ ] No full admin dashboard created
- [ ] UI/UX polish has not started yet

## Explicitly deferred

- Admin dashboard / import review UI
- Image approval queue
- Multi-role admin system
- In-browser XLSX uploader
- Consolidated visual polish
