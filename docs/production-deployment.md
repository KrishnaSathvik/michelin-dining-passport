# Production deployment

Launch-draft runbook for deploying Michelin Dining Passport. Confirm values in your Vercel and Supabase dashboards before go-live.

## Vercel

1. Import the GitHub repository.
2. Framework preset: Next.js.
3. Root directory: repository root.
4. Build command: `npm run build`
5. Output: Next.js default.
6. Set environment variables from [`.env.example`](../.env.example).
7. Attach the production custom domain when ready.

Preview deployments should use the same Supabase project **or** a dedicated preview project. If sharing production Auth, add every preview URL to Supabase redirect allow-lists.

## Supabase production

### Site URL

- Production Site URL: `https://<your-domain>`
- Local Site URL remains `http://localhost:3000` for development projects.

### Auth redirect URLs

Add:

- `https://<your-domain>/auth/callback`
- `http://localhost:3000/auth/callback`
- Preview pattern if used: `https://*-<team>.vercel.app/auth/callback`

### Google OAuth

1. Create Google Cloud OAuth credentials.
2. Configure the provider in Supabase Auth.
3. Set `NEXT_PUBLIC_ENABLE_GOOGLE_AUTH=true` only after the provider works end-to-end.

### Email delivery

Configure SMTP or the Supabase email provider in the dashboard. Auth templates should use the production Site URL.

## Environment variables

Copy `.env.example` → Vercel project settings:

| Variable | Scope |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public |
| `SUPABASE_SECRET_KEY` | Server only |
| `NEXT_PUBLIC_SITE_URL` | Public production origin |
| `NEXT_PUBLIC_ENABLE_GOOGLE_AUTH` | Public flag |
| `NEXT_PUBLIC_ANALYTICS_ENABLED` | Public flag (default false) |
| `NEXT_PUBLIC_MONITORING_ENABLED` | Public flag (default false) |

Never commit real secrets. Rotate `SUPABASE_SECRET_KEY` if it leaks.

## Map tiles

The map uses MapLibre with public/demo-compatible style sources. Before heavy production traffic, choose a tile provider, set any required style URL, and document rate limits / attribution.

## Rate limits

- Correction form: in-memory limiter (5 requests / minute / IP) suitable for single-instance launch.
- Auth rate limits are enforced by Supabase.
- Replace the in-memory limiter with a shared store before multi-region scale.

## Secret rotation

1. Rotate Supabase secret key in the dashboard.
2. Update Vercel env vars.
3. Redeploy.
4. Revoke old Google OAuth secrets if rotated.
5. Re-run `npm run secrets:scan` on the repo.

## Rollback

1. Revert the Vercel deployment to the previous production deployment.
2. For data mistakes, restore `data/restaurants.json` from `data/backups/` and regenerate seed.
3. Do not run `data:apply-update --production` — production DB applies are intentionally blocked in the Phase 7 CLI; use reviewed seed/migration deploys.
