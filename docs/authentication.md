# Authentication

## Methods

| Method | Availability |
| --- | --- |
| Email + password | Always (when Supabase is configured) |
| Magic link | Always (when Supabase is configured) |
| Google OAuth | Only when `NEXT_PUBLIC_ENABLE_GOOGLE_AUTH=true` and provider configured |

## Routes

| Route | Purpose |
| --- | --- |
| `/login` | Password + magic link (+ optional Google) |
| `/signup` | Email/password signup |
| `/auth/callback` | PKCE/code exchange |
| `/forgot-password` | Password reset request |
| `/reset-password` | Set password after recovery link |
| `/account` | Protected account management |
| Sign out | Server action from account page |

## Security behavior

- Cookie-based SSR via `@supabase/ssr`
- Session refresh in Next.js `src/proxy.ts`
- Authorization uses `getUser()` / `getClaims()`, never an unverified local session object
- `next` redirect targets must be internal paths (`src/lib/auth/redirect.ts`)
- Secret key is server-only (`src/lib/supabase/admin.ts`) for account deletion

## Guest vs authenticated

- Public discovery routes never require auth
- `/passport`, `/saved`, `/visited`, `/collections` remain usable for guests with local storage
- Authenticated users migrate local Passport data to cloud after sign-in
- `/account` requires a verified session
