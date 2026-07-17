# Shell baseline notes — Phase 2

**Date:** 2026-07-17  
**Branch:** `stitch-full-redesign`  
**Reference:** `docs/designs/dining_passport_component_library/` TopAppBar + Footer (copied as `stitch-header-reference.png`)

## Match

- 72px sticky white header, 1px `--dp-border` bottom rule, no heavy shadow
- Dining Passport Literata wordmark → `/`
- Desktop nav: Explore · Map · Michelin Stars · Passport (Inter 14px, underline/weight for current)
- Compact search icon → `/explore`
- Signed-out: Sign in; signed-in: initials avatar + account menu
- Mobile: hamburger → Drawer with focus trap + Escape restore
- Soft footer (`--dp-soft`) with wordmark, primary links, independence disclaimer
- No footer on `/map`
- Auth routes: AuthShell only — zero global banners/footers
- Foundation route uses live Stitch shell (no old SiteHeader)

## Accepted differences vs Stitch library reference

1. **Nav collapse at `lg` (1024px)** — Stitch HTML uses `md`; real content fit with search + Sign in needs `lg` to avoid collision. Documented intentional.
2. **No Privacy/Terms routes** — product has no privacy/terms pages; footer omits fake links and keeps the independence disclaimer + coverage note.
3. **No Contact / Press Kit** — not supported.
4. **Search is icon-only** — navigates to Explore (existing behavior); no new global search.
5. **Michelin Stars label** — short form matching Stitch; URL remains `/about-michelin-stars`.
6. **Signed-in screenshot** — uses foundation `forceSignedInPreview` demo (no live auth session in CI).
7. **Route body overflow at 390 on `/`** — caused by unrebuilt homepage modules (`min-h` editorial cards), **not** the shell. Header/footer measure 390×390 clean. Phase 4 will replace the home body.

## Silhouette checklist

| Check | Result |
|---|---|
| Header height 72px | Yes |
| Content width ~1280 aligned | Yes (`PageContainer`) |
| Wordmark restrained Literata | Yes |
| Nav spacing / no pills | Yes |
| Search/account alignment | Right cluster |
| Border treatment | Flat bottom border |
| Mobile transformation | Menu drawer |
| Drawer dimensions | Full height, max `--dp-drawer-width` |
| Footer hierarchy | Wordmark → links → disclaimer |

## Production behavior changes

- Global chrome replaced with Stitch `AppChrome` / `AppHeader` / `SiteFooter`
- Auth routes no longer show marketing header/footer
- Map viewport height uses `calc(100dvh - 72px)` via `MapWorkspaceShell`
- Old `SiteHeader` / `SiteFooter` / `SiteFooterGate` deleted
