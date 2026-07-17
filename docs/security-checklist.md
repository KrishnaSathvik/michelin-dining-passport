# Security checklist

Launch checklist — mark items during production readiness review.

## Application

- [x] Safe internal redirects (`safeInternalPath`)
- [x] CSP + secure headers in `next.config.ts`
- [x] `poweredByHeader: false`
- [x] Correction endpoint validation + request size limit
- [x] Correction endpoint rate limit (in-memory)
- [x] Honeypot field on public correction form
- [x] CSV formula-injection sanitizer (`src/lib/security/csv.ts`)
- [ ] Durable rate limiting before multi-region scale
- [ ] CAPTCHA/bot provider if correction spam appears

## Data and secrets

- [x] `.env*` gitignored; `.env.example` committed without secrets
- [x] `npm run secrets:scan`
- [x] `npm run audit:deps`
- [x] Data-update CLI blocks accidental production apply
- [x] Seed generation never deletes user tables

## Auth

- [x] Supabase Auth for credentials
- [x] RLS policies for personal data
- [ ] Production Site URL + redirect allow-list verified
- [ ] Google OAuth enabled only after dashboard configuration
- [ ] Email templates point at production domain

## Operations

- [ ] Secret rotation drill documented and tested
- [ ] Dependency audit triage before launch
- [ ] Broken-link spot check on legal pages and primary CTAs
