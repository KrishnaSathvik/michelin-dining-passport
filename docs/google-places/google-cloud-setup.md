# Google Cloud setup for Places UI Kit

Official requirements (validate against current Google docs before production): billed Cloud project, Places UI Kit enabled, API key, Maps JavaScript API loaded via dynamic library import, and `places` library import.

## Checklist

1. Create or select a Google Cloud project with an active **billing account**.
2. Enable:
   - **Places UI Kit** (required for web components)
   - **Maps JavaScript API** (required to load UI Kit libraries)
   - **Places API (New)** — only for the one-time CLI matching workflow (server key)
3. Create **two** API keys (never commit real values):

### Browser key → `NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY`

- Application restriction: **HTTP referrers**
- Allow:
  - `http://localhost:3000/*`
  - Production origin (`https://your-domain/*`)
  - Preview domains as narrowly as practical
- API restriction: Maps JavaScript API + Places UI Kit only (as exposed in Cloud Console for your project)
- Used only in the browser bundle

### Matching key → `GOOGLE_PLACES_MATCHING_API_KEY`

- Application restriction: **None** (or IP restrict for CI/admin machines)
- API restriction: **Places API (New)** only
- Never prefix with `NEXT_PUBLIC_`
- Never log the key
- Never ship in client bundles

## Feature flag

```env
NEXT_PUBLIC_GOOGLE_PLACES_UI_KIT_ENABLED=false
NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY=
GOOGLE_PLACES_MATCHING_API_KEY=
```

Keep the flag `false` until keys, referrers, budgets, and the technical spike are verified.

## Local development

1. Copy `.env.example` → `.env.local`
2. Paste the browser key (optional for UI fallback testing)
3. Paste the matching key only when running `npm run data:google-places:*`
4. Set `NEXT_PUBLIC_GOOGLE_PLACES_UI_KIT_ENABLED=true` to exercise live components
5. Validate Google mounts on Map (compact selected place) and restaurant detail (full kit). The obsolete `/dev/google-places-spike` route was removed in Phase 12; historical proof remains under `docs/google-places/proof/`.

## Vercel / deployment

Set the same three variables in Vercel Project Settings → Environment Variables for Preview and Production. Prefer Production-only for the matching key if matching never runs in Vercel builds.

## Budget alerts and quotas

Configure Cloud Billing budgets with alerts at **$10** and **$25**, plus **50% / 75% / 90% / 100%** thresholds. Apply conservative daily quotas on Places UI Kit / Maps JavaScript until traffic is understood.

## Feature-disable procedure

1. Set `NEXT_PUBLIC_GOOGLE_PLACES_UI_KIT_ENABLED=false` in all environments
2. Redeploy (or restart local `next dev`)
3. Confirm restaurant pages and map show the quiet unavailable fallback
4. Discovery, Passport, and MapLibre continue without Google

## Security notes

- Rotate keys if leaked
- Review referrer lists after domain changes
- Run a browser-bundle check to ensure `GOOGLE_PLACES_MATCHING_API_KEY` never appears in client JS
