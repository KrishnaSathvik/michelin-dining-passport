# Supabase setup

## Project

Hosted project name: `michelin-dining-passport` (U.S. region).

Local development uses the Supabase CLI (`npm run supabase:start`).

## Environment variables

Copy `.env.example` to `.env.local` and fill real values from the Supabase **Connect** panel:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ENABLE_GOOGLE_AUTH=false
```

Rules:

- Real values only in `.env.local` (gitignored).
- Never prefix `SUPABASE_SECRET_KEY` with `NEXT_PUBLIC_`.
- Prefer the new publishable/secret key model (`sb_publishable_…` / `sb_secret_…`).

## CLI scripts

| Script | Purpose |
| --- | --- |
| `npm run supabase:start` | Start local stack |
| `npm run supabase:stop` | Stop local stack |
| `npm run supabase:reset` | Reset DB, apply migrations + seed |
| `npm run supabase:migrate` | Apply pending migrations |
| `npm run supabase:seed:generate` | Build `supabase/seed.sql` from JSON datasets |
| `npm run supabase:types` | Generate TypeScript types from local DB |
| `npm run supabase:rls:validate` | Two-user RLS smoke checks |
| `npm run data:seed-validate` | Validate seed inputs without writing SQL |

## Dashboard configuration still required

### Auth URL configuration

Development:

- Site URL: `http://localhost:3000`
- Redirect allowlist: `http://localhost:3000/**`

After Vercel deploy:

- Site URL → production origin
- Add production callback: `https://YOUR_DOMAIN/auth/callback`
- Add preview pattern as needed (for example `https://*-YOUR_TEAM.vercel.app/**`)

### Email

- Confirm email templates point at `/auth/callback`
- Production should use custom SMTP (Supabase built-in email is for development)

### Google OAuth (optional)

1. Configure Google provider in Supabase Auth
2. Set `NEXT_PUBLIC_ENABLE_GOOGLE_AUTH=true`
3. Keep the button hidden when the flag is false

### Production environment variables

Set the same keys in Vercel (or your host), plus the production `NEXT_PUBLIC_SITE_URL`.

### Google Places UI Kit (optional enrichment)

Documented in [`docs/google-places/google-cloud-setup.md`](./google-places/google-cloud-setup.md):

```env
NEXT_PUBLIC_GOOGLE_PLACES_UI_KIT_ENABLED=false
NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY=
GOOGLE_PLACES_MATCHING_API_KEY=
```

Keep the feature flag false until browser-key referrers, billing budgets, and the technical spike are verified. Never put the matching key in `NEXT_PUBLIC_*` or client bundles.

## Migrations

Schema changes live only under `supabase/migrations/`. Do not make undocumented schema edits in the hosted SQL editor.
