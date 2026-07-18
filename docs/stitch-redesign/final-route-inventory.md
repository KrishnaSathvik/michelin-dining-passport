# Final route inventory (Phase 12)

**Branch:** `stitch-full-redesign`  
**Starting commit:** `5fe01ac2f072b27f445ab2562534c490898085d1`  
**Test server:** dedicated `127.0.0.1:3112` (Playwright `E2E_PORT`, never arbitrary `:3000`)  
**Visual SoT:** Stitch (`docs/designs/`, baselines under `docs/stitch-redesign/baselines/`)  
**Functional SoT:** current application domain logic (unchanged in Phase 12)

Status legend: **Pass** · **Accepted deviation** · **Deferred** (see `remaining-debt.md`)

---

## Public discovery

| Route / state | R/C | Stitch ref | Baseline | Loading | Empty | Error / NF | 1440 | 1024/768 | 390 | Tests | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `/` | Server + client featured | `explore_feed` | `baselines/homepage/` + `final/home-*` | Featured soft fallback | N/A (featured unavailable copy) | Layout error → `error.tsx` | final | prior | final | `homepage.spec`, `test_homepage` | Pass |
| `/explore` grid | Server + client | explore designs | `baselines/explore/` + `final/explore-grid-*` | `explore/loading.tsx` | Stitch empty | NF N/A | final | prior | final | explore e2e + scripts | Pass |
| Explore list | Client view | list design | `final/explore-list-1440` | same | same | — | final | prior | prior | explore e2e | Pass |
| Explore filter drawer | Client | drawer design | `final/explore-drawer-390` | — | — | — | — | — | final | explore e2e | Pass |
| Explore empty | Client | system_states | explore notes | — | Clear filters | — | prior | — | prior | explore e2e | Pass |
| `/map` | Client workspace | map designs | `baselines/map/` + `final/map-*` | Workspace stable height | Map empty panel | MapLibre fail → list | final | prior | final | map e2e | Pass |
| Map selected desktop | Client | map selected | `final/map-selected-1440` | — | — | Google compact unavailable | final | prior | — | map + google e2e | Pass |
| Map mobile sheets | Client | map mobile | `final/map-mobile-expanded-390` | — | — | — | — | — | final | map e2e | Pass |

## Restaurant

| Route / state | R/C | Stitch ref | Baseline | Loading | Empty | Error / NF | Proofs | Tests | Status |
|---|---|---|---|---|---|---|---|---|---|
| `/restaurants/[slug]` | Server + client journey/Google | detail designs | `baselines/restaurant-detail/` + `final/restaurant-detail-*` | `loading.tsx` | N/A | `notFound()` → 404 UI | final 1440/390 | detail e2e | Pass |
| Invalid slug | Server `notFound()` | system_states | `final/not-found-*` | — | — | **HTTP 404** | final | system-states e2e | Pass |
| Google disabled / unavailable | Client kit gate | system_states | `final/provider-unavailable` | Skeleton height stable | — | Provider copy only | final | google e2e | Pass |
| Missing image | First-party fallback | restaurant components | prior gallery | — | — | — | prior | presentation e2e | Pass |

## Passport and lists

| Route / state | Notes | Baseline | Status |
|---|---|---|---|
| `/passport` active / empty | Client hydration; no empty flash before hydrate | `final/passport-*` | Pass |
| `/saved`, `/planned`, `/visited` (+ empty) | Stitch list pages | `final/saved|planned|visited-*` | Pass |
| Stale personal record | List copy for unavailable members | passport notes | Pass |

## Collections

| Route / state | Notes | Baseline | Status |
|---|---|---|---|
| `/collections` empty/active | Client | `final/collections-index-1440` | Pass |
| `/collections/[slug]` | Client missing → in-app missing state (not public 404) | `final/collection-detail-390` when members exist | Pass |
| CRUD dialogs | Stitch dialogs | prior collections baselines | Pass |

## Authentication and account

| Route / state | Notes | Baseline | Status |
|---|---|---|---|
| `/login` `/signup` `/forgot-password` `/reset-password` | Auth shell, no global chrome | `final/login-*` + auth baselines | Pass |
| `/account` unauthenticated | Redirect to login | `final/account-*` (redirect UI) | Pass |
| Delete dialog | Stitch | prior auth-account | Pass |

## Taxonomy and education

| Route / state | Notes | Baseline | Status |
|---|---|---|---|
| `/usa/[stateSlug]` | Server + loading | `final/state-1440` | Pass |
| `/cities/[citySlug]` | Server + loading | `final/city-390` | Pass |
| `/cuisines/[cuisineSlug]` | Server + loading | `final/cuisine-1440` | Pass |
| `/stars/1|2|3` | Server + loading | `final/stars-*` | Pass |
| `/about-michelin-stars` | Server + loading | `final/education-390` | Pass |
| Invalid taxonomy / stars | `notFound()` → **HTTP 404** + Stitch UI | `final/not-found-*` | Pass |

## Global states

| State | Implementation | HTTP / behavior | Baseline | Status |
|---|---|---|---|---|
| Global 404 | `src/app/not-found.tsx` → `NotFoundState` | **404** | `final/not-found-*` | Pass |
| Route error | `src/app/error.tsx` → `RouteErrorState` + `reset()` | Soft boundary | `final/route-error-1440` (dev gallery / identical component) | Pass |
| Global error | `src/app/global-error.tsx` independent shell | Hard failure | Documented | Pass |
| Network unavailable | `NetworkUnavailableState` | Distinct from NF / Google | Foundation / reuse | Pass |
| Provider unavailable | `GooglePlaceUnavailable` | Restaurant still usable | `final/provider-unavailable` | Pass |
| Loading shell | Route `loading.tsx` + skeletons | No empty flash | prior + taxonomy loaders | Pass |

## Dev surfaces (production)

| Route | Production | Retention |
|---|---|---|
| `/dev/stitch-foundation` | `notFound()` | Keep — single styleguide |
| `/dev/stitch-restaurant-components` | `notFound()` | Keep — presentation e2e |
| `/dev/google-places-spike` | **Deleted** | Historical proof docs only |
| `/dev/stitch-account-preview` | **Deleted** | Account uses real `/account` |

## Distinctions (do not conflate)

| Kind | Meaning |
|---|---|
| HTTP 404 | Public invalid resource / unknown path — App Router `notFound()` |
| Client missing personal record | e.g. missing collection slug in local/cloud passport store |
| Provider unavailable | Google UI Kit outer state; restaurant identity remains |
| Empty query result | Explore/Map filters returned zero rows |

## Coverage notes

- Acceptance widths: **1440**, **1024 or 768**, **390** (spot-checks 360/430/820/1600+ during responsive audit).
- Playwright owns port **3112** with `reuseExistingServer: false`.
- Exit code **143** from intentional server stop is not a failure.
