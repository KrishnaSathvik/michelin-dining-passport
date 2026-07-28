# Phase 10 — Auth & Account visual notes

Inspection notes before / during implementation. Compare captures against Stitch references in `references/`.

## Split-shell proportions

| Breakpoint | Atmospheric panel | Form column | Form inner max |
|---|---|---|---|
| 1440 / 1280 | ~55–60% left | ~40–45% right | 440px |
| 1024 | Split retained; panel may narrow | Form remains usable | 440px |
| ≤768 | Hidden | Full width + compact wordmark | Full usable width |

Canonical form content width: **440px** (`max-w-[440px]`). AuthShell uses local atmospheric photo (`/images/homepage-hero.jpg`) with green gradient overlay — not the tiled reset-password Stitch artifact.

## Image panel / form column

- Image panel: full-bleed cover photo + primary green fade; wordmark bottom-left on desktop.
- Form column: centered stack, horizontal padding 20px mobile / 64px desktop.
- No global AppHeader / SiteFooter on auth routes.

## Wordmark & headings

- Product identity: **Dining Passport** (never Michelin as wordmark).
- Mobile: compact display wordmark above form.
- Desktop: wordmark on atmospheric panel; form H1 is route-specific.
- Sign in H1: `Welcome back` (~32px Literata).
- Signup H1: `Create an Account`.
- Forgot H1: `Forgot Password` (~24–32px).
- Reset H1: `Reset Password`.
- Account H1: `Account settings`.

## Inputs & spacing

- Control height: **48px** (`--dp-control-height`).
- Input text: **16px** minimum.
- Label: uppercase label-caps, 8px above field.
- Field stack: **24px** gaps.
- Primary action: filled primary green, full width, 48px.
- Secondary: outline (magic link / Google when enabled).
- Password show/hide labeled; no browser-default reveal reliance.

## Success / error

- Field errors: under control.
- Form-level errors: banner above submit when credentials/network fail.
- Success states replace the form inside the same form column (magic link sent, reset email sent, password updated, email confirmation messaging on login).
- Forgot success: “Check your email” — generic copy; does not confirm the address exists.
- Reset success: “Password updated” + Continue to Account.
- Invalid reset context: dedicated state (no usable form).

## Device-only Passport

- Copy: “Continue with device-only Passport” → `/passport`.
- Does not imply cloud backup.

## Account layout

- Content max: 1280px PageContainer.
- Desktop aside: **240px**, sticky within page bounds.
- Nav (real only): Profile · Security · Passport Sync · Data & Export · Delete Account.
- Section cards: flat tonal borders, comfortable padding (~32px).
- Danger zone: last, separated, restrained error styling.
- Delete dialog: ~448px max, type `DELETE`, Cancel + destructive confirm.

## Desktop → mobile

- Auth: hide atmospheric panel; form-first; no stacked full-height image.
- Account: aside → accessible select / compact section jump; single column; dialog stays modal-safe.

## Unsupported Stitch mock features (omitted)

- Notifications section / nav
- Active sessions / sign out other devices / login history
- Avatar upload
- Confirm password fields (not in current actions)
- Fake sync stats / last-sync timestamps
- Import / local backup (export JSON only)
- Google OAuth button when `NEXT_PUBLIC_ENABLE_GOOGLE_AUTH` is not enabled
- Terms/Privacy links to nonexistent routes
- Billing, public profile, social accounts, analytics

## Accepted deviations

- Signup / reset omit confirm-password to match real validation.
- AuthShell uses approved local hero photography + gradient (not Stitch CDN / tiled reset artifact).
- Account H1 “Account settings” (product clarity) with Stitch IA structure.
- Home city retained in Profile because it is a real `updateProfileAction` field.
- Sign-in H1 is `Welcome back` (Stitch supporting line elevated) rather than `Sign In`.
- Google button omitted in default env (provider flag off); Magic Link kept as secondary.
- Account baselines captured via `/dev/stitch-account-preview` (production-gated). Preview header may show signed-out chrome because there is no live session; real `/account` still requires auth.

## Capture comparison (login-1440 vs sign-in-reference)

| Aspect | Match |
|---|---|
| Split-shell silhouette | Yes — atmospheric left, form right |
| Form column ~440px focus | Yes |
| Wordmark Dining Passport | Yes |
| Primary green CTA | Yes |
| Magic link secondary | Yes |
| Device-only Passport | Yes |
| Google button | Omitted (not enabled) |
| Atmospheric photo | Local hero + green wash (not Stitch CDN scallop) |

## Capture comparison (account-1440 vs account-reference)

| Aspect | Match |
|---|---|
| 240px internal nav | Yes |
| Real sections only | Yes — no Notifications |
| Danger zone last | Yes |
| AppHeader + footer | Yes (preview may show Sign in) |
| Fake sessions / sync stats | Omitted |
