# Implementation plan

## Phase status

| Phase | Name | Status |
| --- | --- | --- |
| **0** | Foundation: audit, docs, design direction | **In progress → complete with this doc set** |
| 1 | Static homepage (approved direction) | Not started |
| 2 | Explore + filters + taxonomy pages | Not started |
| 3 | Restaurant detail pages | Not started |
| 4 | Passport preview (local) | Not started |
| 5 | Geocode + `/map` | Not started |
| 6 | Supabase auth + personal data | Not started |
| 7 | Admin + roster import pipeline | Not started |

---

## Phase 0 (complete when docs land)

Deliverables:

- [x] Next.js app scaffold (TS, Tailwind, App Router, `src/`, `@/*`)
- [x] Workbook at `/data/usa_michelin_starred_restaurants_by_state_2026.xlsx`
- [x] Data audit (`docs/data-audit.md`) — **271** restaurants; **216 / 39 / 16** stars
- [x] PRD (`docs/product-requirements.md`)
- [x] Architecture (`docs/architecture.md`)
- [x] Design system + 3 directions + recommendation (`docs/design-system.md`)
- [x] This implementation plan
- [x] No Supabase / Maps / auth wiring

**Exit criteria:** Stakeholder approves combined homepage direction before any homepage build.

---

## Phase 1 — Static homepage only

**Prompt intent:** Build the approved homepage using real restaurant records. No auth, Supabase, Google Places, or full Explore.

### Work

1. Convert workbook → `data/restaurants.json` (script; commit JSON for stable builds).
2. Add `src/lib/data` loaders + slug helpers.
3. Install fonts: Instrument Serif + Inter via `next/font`.
4. Apply design tokens in `globals.css`.
5. Implement `SiteHeader` / `SiteFooter`.
6. Homepage sections:
   - Search-led hero (wires to `/explore?q=` even if Explore is minimal stub)
   - Featured composition (real names/meta; placeholder image treatments)
   - State browsing (real counts)
   - Cuisine browsing (real counts)
   - Michelin-star explanation
   - Passport preview (static/demo)
7. Stub `/explore` with “coming next” or minimal passthrough — optional, keep thin.
8. Responsive pass + accessibility (focus, contrast, landmarks).

### Explicitly out of scope

- Auth, Supabase, Maps SDKs
- Fake restaurant photos
- Full filter engine polish (can be Phase 2)
- All taxonomy routes fully built

### Acceptance

- First viewport: brand + search + one headline + supporting line + CTAs (no dashboard clutter)
- Counts match audit (271 / star split / state totals)
- Visual identity matches Editorial Atlas tokens
- Structure matches Modern Dining Guide

---

## Phase 2 — Explore + filters

- `/explore` with query params: `q`, `stars`, `state`, `cuisine`, `price`, `sort`
- FilterBar + Discovery cards / list toggle
- Empty states
- Shareable URLs

---

## Phase 3 — Detail + taxonomy routes

- `/restaurants/[slug]`
- `/usa/[stateSlug]`, `/cities/[citySlug]`, `/cuisines/[cuisineSlug]`, `/stars/[starCount]`
- `/about-michelin-stars`
- External Guide + website links with safe `rel`

---

## Phase 4 — Passport preview (pre-auth)

- LocalStorage saved/visited (optional ADR)
- `/passport`, `/saved`, `/visited` shells
- Clear upgrade path messaging for accounts

---

## Phase 5 — Map

- Batch geocode addresses → store lat/lng in JSON/DB
- `/map` with list + markers (MapLibre/Mapbox preferred initially)
- Compact cards + marker preview
- Do **not** make homepage map-first until this phase is solid

---

## Phase 6 — Supabase + accounts

- Schema from `docs/architecture.md`
- Auth, RLS, sync local passport → user tables
- `/account`, collections

---

## Phase 7 — Admin

- Workbook diff import
- Enrichment editing
- Image approval
- Publish flags

---

## Dependency policy

- Prefer zero new deps for Phase 1 beyond fonts.
- Add `xlsx`/`sheetjs` or a one-off Python import script only for data conversion — not a runtime client dependency if avoidable.
- Run dependency trust checks before adding anything network-facing (auth/maps).

---

## Risks

| Risk | Mitigation |
| --- | --- |
| Guide updates drift from workbook | Version `source_updated_at`; import diff in admin |
| Shared addresses confuse map pins | Offset sibling markers; show both in preview |
| Cuisine label inconsistency | Curated grouping map later; don’t over-normalize early |
| Image licensing | Placeholders until rights-cleared assets |
| Scope creep into marketplace UX | Keep non-goals visible in PRD |
| Home git repo nesting | Project has its own `.git` → push only this repo to GitHub |

---

## Exact next implementation phase

**Phase 1 — Build the approved homepage only**, using real workbook restaurants, placeholder image treatments, and the combined design direction:

> Modern Dining Guide structure + Editorial Atlas visual identity (+ Immersive `/map` later).
