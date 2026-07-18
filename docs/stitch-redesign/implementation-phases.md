# Implementation Phases

Phasing follows **dependencies and visual consistency**, not file counts. Prefer route-by-route replacement inside the current app using the Stitch token system from Phase 1 onward.

**Branch:** `stitch-full-redesign` from the complete functional source branch (verified at kickoff — not assumed to be `main`).  
**Decisions:** OD-01–OD-18 resolved 2026-07-17 — see [open-decisions.md](./open-decisions.md).  
**Do not** maintain two complete design systems indefinitely — aliases only during migration.

---

## Phase 0 — Design audit and visual contract

**Status:** Complete and approved.

| Item | Detail |
|---|---|
| **Scope** | Inspect all Stitch files; map routes; extract tokens; resolve conflicts |
| **Deliverables** | `docs/stitch-redesign/` + `docs/designs/` |
| **Acceptance** | Decisions OD-01–OD-18 resolved; inventory complete |
| **Commit** | Planning package + `docs: resolve Stitch redesign product decisions` |

---

## Phase 1 — New design foundation

**Status:** Complete.

| Item | Detail |
|---|---|
| **Scope** | Literata + Inter; `--dp-*` tokens; spacing; typography utilities; focus rings; reduced motion; layout/control/media primitives; base Drawer/Dialog/EmptyState/Skeleton; **dev-only** component reference route matching `dining_passport_component_library` |
| **Components** | See Phase 1 kickoff list in approval prompt (`PageContainer`, `Section`, `SectionHeader`, `Button`, `IconButton`, `Input`, `SearchInput`, `FilterChip`, `ActiveFilterChip`, `Select`, `MichelinDistinction`, `RestaurantMedia`, `RestaurantFallback`, `Drawer`, `Dialog`, `EmptyState`, `Skeleton`) |
| **Routes** | Dev-only reference (`/dev/stitch-foundation` or equivalent); not in production nav; gated with `notFound()` in production |
| **Dependencies** | OD-03 Literata; OD-13 gold; approved color clarification |
| **Preserve** | Controllers, stores, server actions, hooks, domain logic |
| **Acceptance** | Tokens match approved spec; primitives independently composed; aliases documented; typecheck/lint/test/build; screenshots @1440/768/390 under `docs/stitch-redesign/baselines/foundation/` |
| **Tests** | Lint, typecheck, unit tests, production build, secret scan |
| **Commit** | `feat(ui): introduce Stitch design tokens and primitives` |
| **Stop** | Do **not** begin Phase 2 (shell) or any route redesign |

---

## Phase 2 — Global application shell

| Item | Detail |
|---|---|
| **Scope** | AppHeader (signed-in/out); SiteFooter; footer gate; auth shell scaffolding; breadcrumbs; nav IA; product wordmark **Dining Passport** (OD-02) |
| **Routes** | Affects all pages visually |
| **Dependencies** | Phase 1 |
| **Preserve** | Nav destinations, account entry, map footer gating, disclaimer meaning |
| **Acceptance** | Header 72px; canonical links; disclaimer present; map has no footer |
| **Screenshots** | Header signed-out/in @1440/390; footer; map no-footer |
| **Tests** | Auth e2e smoke for header account entry |
| **Commit** | `feat(ui): rebuild application shell to Stitch header/footer` |

---

## Phase 3 — Shared restaurant presentation

| Item | Detail |
|---|---|
| **Scope** | All card variants, list/map rows, MichelinDistinction, media/fallback, ReservationAction, SaveAction, skeletons |
| **Dependencies** | Phase 1–2 |
| **Preserve** | Resolver labels, passport save, image policy, analytics hooks |
| **Acceptance** | Cards match library/explore proportions; no Google on cards; truthful CTAs |
| **Screenshots** | Card gallery @1440 |
| **Tests** | Reservations unit + update e2e selectors as cards land |
| **Commit** | `feat(ui): add Stitch restaurant presentation components` |

---

## Phase 4 — Homepage

| Item | Detail |
|---|---|
| **Scope** | Build `/` from `explore_feed` composition — do not adapt old section stack |
| **Components** | MarketingHero, StatsStrip, Featured section |
| **Dependencies** | Phase 2–3 |
| **Preserve** | Totals, featured data source, independence messaging |
| **Acceptance** | Matches explore_feed silhouette; old browse modules removed from home |
| **Screenshots** | 1440, 768, 390 vs `explore_feed/screen.png` |
| **Tests** | Build; smoke navigate home→explore |
| **Commit** | `feat(ui): rebuild homepage from Stitch explore_feed composition` |

---

## Phase 5 — Explore

| Item | Detail |
|---|---|
| **Scope** | Search, toolbar, quick filters, drawer, grid, list, pagination, loading, empty |
| **Routes** | `/explore` |
| **Dependencies** | Phase 3 |
| **Preserve** | Entire explore query/URL contract |
| **Acceptance** | Grid matches explore design; drawer matches list/drawer design; empty/loading from system_states |
| **Screenshots** | Grid, list, drawer open, empty, loading @1440/390 |
| **Tests** | `test_explore.mjs`; Playwright filter/search smoke |
| **Commit** | `feat(ui): rebuild explore from Stitch directory designs` |

---

## Phase 6 — Map

| Item | Detail |
|---|---|
| **Scope** | Rebuild workspace UI; keep MapLibre + query logic |
| **Routes** | `/map` |
| **Dependencies** | Phase 3; Google compact frame |
| **Preserve** | Clustering, sync, Fit/Reset/Search this area, Saved/Visited, compact Google on selection |
| **Acceptance** | 420px panel; gold selected marker language; no footer; empty state |
| **Screenshots** | Desktop selected, mobile sheet, empty @1440/390 |
| **Tests** | `e2e/map.spec.ts`; google-places map path |
| **Commit** | `feat(ui): rebuild map workspace to Stitch panel layout` |

---

## Phase 7 — Restaurant details

| Item | Detail |
|---|---|
| **Scope** | Identity hero, facts, Google section frame, journey controls, plan/visit dialogs, related/nearby |
| **Routes** | `/restaurants/[slug]` |
| **Dependencies** | Phase 3; Google wrappers |
| **Preserve** | Resolver, passport mutations, UI Kit, related/nearby data |
| **Acceptance** | Matches benu composition; Google only in kit; dialogs match designs |
| **Screenshots** | Detail, Google on/off, dialogs, 390 sticky bar |
| **Tests** | reservations + google-places e2e |
| **Commit** | `feat(ui): rebuild restaurant detail from Stitch identity hero` |

---

## Phase 8 — Passport and personal lists

| Item | Detail |
|---|---|
| **Scope** | Passport narrative, empty state, `/saved`, `/visited`, **`/planned` (OD-07)**, progress modules; To Visit metric per OD-09 |
| **Dependencies** | Phase 3; dialogs from Phase 7 |
| **Preserve** | Passport provider, metrics, cloud sync notice |
| **Acceptance** | Active + empty match designs; lists match saved/visited |
| **Screenshots** | Active, empty, saved, visited @1440/390 |
| **Tests** | passport unit tests; manual sync smoke |
| **Commit** | `feat(ui): rebuild passport and personal list surfaces` |

---

## Phase 9 — Collections

| Item | Detail |
|---|---|
| **Scope** | Index, create/edit/delete dialogs, detail hero/progress/rows, empty |
| **Routes** | `/collections`, `/collections/[slug]` |
| **Dependencies** | Phase 8 |
| **Preserve** | Collection persistence |
| **Acceptance** | Matches overview + detail; no public/share unless approved |
| **Screenshots** | Index, create dialog, detail, empty |
| **Tests** | Manual CRUD + any existing tests |
| **Commit** | `feat(ui): rebuild collections from Stitch designs` |

---

## Phase 10 — Authentication and account

| Item | Detail |
|---|---|
| **Scope** | AuthShell for login/signup/forgot/reset; success/error; account settings IA subset |
| **Dependencies** | Phase 2 |
| **Preserve** | Auth actions, callback, redirects, account deletion safety |
| **Acceptance** | Split auth matches designs; account sections only for real capabilities |
| **Screenshots** | Each auth screen + account @1440/390 |
| **Tests** | `e2e/auth.spec.ts` |
| **Commit** | `feat(ui): rebuild auth and account shells` |

---

## Phase 11 — Taxonomy and education

| Item | Detail |
|---|---|
| **Scope** | State, city, cuisine, stars 1/2/3, about Michelin stars |
| **Dependencies** | Phase 3 cards; Phase 2 shell |
| **Preserve** | Taxonomy data aggregations |
| **Acceptance** | Heroes/bentos match designs with real US data; education under canonical nav |
| **Screenshots** | One example each taxonomy + education @1440/390 |
| **Tests** | Build; link smoke from home/explore |
| **Commit** | `feat(ui): rebuild taxonomy and Michelin education pages` |

---

## Phase 12 — System states and responsive completion

**Status:** Complete — see [`final-audit.md`](./final-audit.md), [`release-readiness.md`](./release-readiness.md).

| Item | Detail |
|---|---|
| **Scope** | 404, error, network failure, provider unavailable, full responsive audit, a11y audit, visual regression, delete obsolete UI |
| **Dependencies** | Phases 4–11 |
| **Acceptance** | All quality gates green; deletion plan executed; single token system remains |
| **Screenshots** | `baselines/final/` |
| **Tests** | Full unit + e2e on port **3112** + build |
| **Commit** | `feat(ui): complete Stitch redesign system states and cleanup` (and related Phase 12 commits) |

---

## Branch and migration strategy

| Topic | Recommendation |
|---|---|
| Source branch | Branch containing complete functional app including Google Places + 271 Place IDs (verified at kickoff) |
| **Working branch** | `stitch-full-redesign` |
| **Preserve features** | Never rewrite providers/resolvers mid-visual work; migrate presentation only |
| **Avoid broken intermediate** | Ship shell+tokens first; migrate route-by-route; keep old page working until its PR replaces it entirely |
| **Feature flags** | Optional per-route `STITCH_UI_<ROUTE>` only if long-lived parallel needed; prefer short-lived full replacements per route |
| **Tests** | Update Playwright with each route PR; keep domain unit tests green continuously |
| **Delete obsolete** | After each route’s replacement merges and screenshots accepted — see deletion-plan |
| **Dual design systems** | Temporary CSS aliases ≤ Phase 12; then delete |
| **Visual snapshots** | Add/update baselines when each route’s acceptance screenshots are approved |
| **Merge** | Merge to main when Phases 1–12 complete **or** after a contiguous set of phases if product accepts partial Stitch (not recommended before Phase 4+) |

## Suggested PR slicing

1. Phase 1–2  
2. Phase 3  
3. Phase 4  
4. Phase 5  
5. Phase 6  
6. Phase 7  
7. Phase 8–9  
8. Phase 10  
9. Phase 11–12  

Each PR must include the quality gates from [testing-and-visual-qa.md](./testing-and-visual-qa.md).
