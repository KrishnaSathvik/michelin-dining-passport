# Monitoring and analytics

Provider-neutral hooks live in `src/lib/monitoring/analytics.ts`.

## Flags

| Variable | Default | Effect |
| --- | --- | --- |
| `NEXT_PUBLIC_ANALYTICS_ENABLED` | `false` | Enables analytics sink wiring |
| `NEXT_PUBLIC_MONITORING_ENABLED` | `false` | Enables error-monitoring sink wiring |

When disabled, events still emit browser `CustomEvent`s (`mdp:analytics`, `mdp:error`) and development console logs so local debugging works without vendors.

## Tracked events

- `reservation_clicked`
- `restaurant_detail_viewed`
- `search_performed`
- `filter_used`
- `restaurant_saved`
- `restaurant_visited`
- `account_created`
- `local_to_cloud_migration`

Wire a vendor by subscribing to `mdp:analytics` / `mdp:error` in a small client bootstrap — do not scatter SDKs through feature code.

## Never log

- Private notes
- Favorite dishes
- Reservation confirmation notes
- Passwords
- Authentication tokens
- Supabase secrets

Property scrubbing rejects known sensitive keys before emission.
