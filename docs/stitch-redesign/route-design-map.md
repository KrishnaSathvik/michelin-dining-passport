# Route ↔ Design Map

Maps **actual repository routes** to Stitch references, new compositions, preserved features, unsupported mock content, and required states.

Canonical visual conventions (**approved 2026-07-17**):

- Nav: Explore · Map · Michelin Stars · Passport (+ search + account)
- Brand: **Dining Passport** (OD-02)
- Map: `dining_passport_map_workspace` (OD-04)
- Detail: `restaurant_profile_benu` (OD-05)
- Passport active: `personal_passport` (OD-06)
- Planned list: `/planned` (OD-07)
- Homepage: strict `explore_feed` (OD-08)
- Display font: Literata (OD-03)
- No mobile bottom nav (OD-12)

---

## Public discovery

### `/`

| Field | Spec |
|---|---|
| **Stitch reference** | `explore_feed` |
| **New composition** | Sticky 72px header → full-bleed atmospheric hero (brand-forward serif headline + one supporting sentence) → stats strip (271 / 216★ / 39★★ / 16★★★) → Featured Destinations section header + View All → 3-col discovery cards → soft footer with independence disclaimer |
| **Desktop (~1440/1280)** | Hero edge-to-edge; content 1280; stats 4 equal columns; featured 3-col |
| **Tablet (1024/768)** | Stats 2×2; featured 2-col then 1-col |
| **Mobile (390)** | Hero shorter; single-column cards; condensed header (logo + icons + menu) |
| **Data** | Live totals from restaurant dataset; featured restaurants from `src/config/homepage.ts` / data helpers; first-party images or fallbacks |
| **Interactions** | Nav, search→`/explore`, View All→`/explore`, card→detail, reservation CTA via resolver labels |
| **Reuse** | Totals queries, featured selection config, reservation resolver, Save if present |
| **Replace** | Entire old homepage composition. **Remove** Browse by State, Browse by Cuisine, Map teaser, Michelin explanation preview, and Passport dashboard preview from `/` (OD-08). Capabilities remain on dedicated routes. |
| **Unsupported mock** | Stock hero food as named restaurant media; forced “Check availability” on every card |
| **States** | Default; loading skeleton for featured; empty featured (unlikely) |
| **A11y** | Hero contrast; stats as list/table semantics; card links have accessible names |
| **Screenshot criteria** | Silhouette matches `explore_feed/screen.png`; header 72px; stats four columns; 3 featured cards; disclaimer present |

### `/explore` (grid)

| Field | Spec |
|---|---|
| **Stitch reference** | `explore_michelin_starred_restaurants` |
| **New composition** | Header → page title + count → DiscoveryToolbar (search, quick filters, sort, grid/list) → ActiveFilterChips → 4-col grid → Pagination → footer |
| **Preserve** | URL query contract (`src/lib/data/explore.ts`), facets, sort, pagination, Saved/Visited filters |
| **Replace** | Entire explore UI suite presentation |
| **Unsupported** | Green Star filter if not in dataset; invented availability |
| **States** | Loading (`dining_passport_system_states` skeletons); empty (`system_states`); error/inline |
| **Screenshots** | 1440 grid; 768 2-col; 390 1-col |

### `/explore` (list + filters drawer)

| Field | Spec |
|---|---|
| **Stitch reference** | `explore_list_view_filters_drawer` |
| **New composition** | List rows + right AllFiltersDrawer (distinctions, location, cuisine, price, saved/visited, Clear/Apply) |
| **Preserve** | Same query model; drawer open state (URL or local) |
| **Mobile** | Drawer full-screen; list stacked |

### `/map`

| Field | Spec |
|---|---|
| **Stitch reference** | **`dining_passport_map_workspace`** (canonical); `map_view` secondary reference only |
| **New composition** | Header only (no footer) → 420px left panel (search, filter chips, scrollable map rows, selected detail + truthful reserve CTA + compact Google strip when selected) → MapLibre canvas with markers, selected gold ring, SEARCH THIS AREA, zoom/locate/fit |
| **Preserve** | `MapCanvas`, clustering, geocodes, map query URL, list↔marker sync, Fit/Reset/Search this area, Saved/Visited filters, `MapSelectedGooglePlace` |
| **Replace** | `RestaurantMap` chrome/layout/list/detail presentation |
| **Unsupported** | Fake terrain tiles; non-Google attribution on map base if MapLibre; invented descriptions in selected panel |
| **States** | Loading map; empty results (`system_states` map empty); Google unavailable/disabled for selection; mobile bottom sheet for list/detail |
| **Screenshots** | 1440 workspace; 768 stacked; 390 sheet |

---

## Restaurant

### `/restaurants/[slug]`

| Field | Spec |
|---|---|
| **Stitch reference** | **`restaurant_profile_benu`** (canonical); dialogs from `plan_your_visit_dialog`, `record_your_visit_dialog`; Variant A `restaurant_profile` discarded for layout |
| **Sections** | Breadcrumbs → Identity hero (media \| title/meta/address/Reserve+Website/Your Journey) → Details (facts + directions map preview) + Live from Google (UI Kit wrapper) → Related Discovery → Nearby (keep product feature; compose as list/editorial matching Related styling) → footer |
| **Preserve** | Restaurant data, reservation resolver, Passport controls behavior, Google UI Kit full wrapper, related/nearby queries, sticky mobile bar behavior (restyle) |
| **Unsupported** | Custom Google photo galleries; extracted ratings outside UI Kit; invented About copy if not in dataset |
| **States** | Loading; not-found; Google missing/disabled/unavailable; planning dialog; visit dialog |
| **Screenshots** | Desktop Benu composition; 768 stack; 390; dialogs open |

---

## Passport & personal lists

### `/passport` (active) — **Phase 8 complete**

| Field | Spec |
|---|---|
| **Stitch reference** | `personal_passport` |
| **Composition** | **Done** — `stitch/passport/PassportPageView` → My Passport hero → Visited / To Visit / Favorites → Stars Collected + States Explored → Personal Collection previews → sync notice |
| **Preserve** | `PassportProvider`, store, merge, sync notices; To Visit = OD-09 |
| **Unsupported** | Fake dish tags; L'Assiette branding; bottom nav; Google content |

### `/passport` (empty) — **Phase 8 complete**

| Field | Spec |
|---|---|
| **Stitch reference** | `personal_passport_new_user_state` (body only; ignore alternate nav) |
| **Composition** | **Done** — aspirational hero + Explore/Map CTAs → Save→Plan→Visit explanation → device/cloud note |

### `/saved` — **Phase 8 complete**

| Field | Spec |
|---|---|
| **Stitch reference** | `saved_restaurants` |
| **Composition** | **Done** — `PassportListPage` mode=`saved` + `SavedRestaurantCard` |
| **Preserve** | Predicate `saved === true`; Move to Planned via Phase 7 planning dialog |
| **Unsupported** | Google content; fake Reserve labels |

### `/visited` — **Phase 8 complete**

| Field | Spec |
|---|---|
| **Stitch reference** | `visited_restaurants` |
| **Composition** | **Done** — `PassportListPage` mode=`visited` + `VisitedRestaurantCard` |
| **Title** | H1 `Visited` · subtitle `Your dining history` (OD-15) |

### `/planned` (OD-07) — **Phase 8 complete**

| Field | Spec |
|---|---|
| **Stitch reference** | `planned_restaurants` |
| **Route** | **Shipped** at `/planned` beside `/saved` and `/visited` |
| **Composition** | **Done** — `PassportListPage` mode=`planned` + `PlannedRestaurantRow` |
| **Preserve** | Existing `planned` flag and persistence — no new database concept |

### `/collections`

| Field | Spec |
|---|---|
| **Stitch reference** | `collections_overview_create_dialog` |
| **Composition** | **Done** — `stitch/collections/CollectionsPageView` → intro + Create → featured → search/sort → grid / empty |
| **Preserve** | Collections CRUD in passport store / cloud sync |
| **Unsupported** | Public collections toggle, sharing (OD-11) |

### `/collections/[slug]`

| Field | Spec |
|---|---|
| **Stitch reference** | `collection_detail_california_celebration_trip` |
| **Composition** | **Done** — `stitch/collections/CollectionDetailView` → breadcrumbs → title/actions → hero + progress → members |
| **Unsupported** | Share; public/private labels; invented progress beyond computed member metrics |

---

## Authentication & account

| Route | Stitch reference | Notes |
|---|---|---|
| `/login` | `sign_in_dining_passport` | **Phase 10 done** — `stitch/auth/SignInForm` in AuthShell; magic link + device Passport; Google only when enabled |
| `/signup` | `create_account_dining_passport` | **Phase 10 done** — `SignUpForm`; real fields only (no confirm-password) |
| `/forgot-password` | `forgot_password_dining_passport` | **Phase 10 done** — success “Check your email” state |
| `/reset-password` | `reset_password_dining_passport` | **Phase 10 done** — invalid-link + update + success; no tiled image artifact |
| `/account` | `account_settings_profile` | **Phase 10 done** — real sections only (Profile, Security, Sync, Data export, Delete); no Notifications/sessions |
| `/auth/callback` | (no design) | Unchanged route handler; no visual |

**Header states:** signed-out (Sign In / icons), signed-in (account icon) — from component library + auth screens.

---

## Taxonomy & education — Phase 11 complete

| Route | Stitch reference | Status |
|---|---|---|
| `/usa/[stateSlug]` | `state_california_michelin_guide_discovery` | **Done** — `StatePageView`; city list geography (no fake map); real glance/star metrics |
| `/cities/[citySlug]` | `city_new_york_city_michelin_guide_discovery` | **Done** — `CityPageView`; distinction + cuisine % bentos from live aggregates |
| `/cuisines/[cuisineSlug]` | `cuisine_japanese_michelin_guide_discovery` | **Done** — `CuisinePageView`; OD-14 U.S. hubs (≥2 cities) or omit |
| `/stars/[starCount]` | `distinction_three_michelin_stars_discovery` | **Done** — `StarPageView`; 3★ editorial bento; 1★ capped + Explore |
| `/about-michelin-stars` | `how_michelin_stars_work` | **Done** — `MichelinEducationPage`; canonical AppHeader/Footer only |

Presentation: `src/components/stitch/taxonomy/*`, `src/components/stitch/education/*`. Data loaders preserved in `src/lib/data/restaurants.ts`.

---

## System / missing designs

| Surface | Design coverage | Plan |
|---|---|---|
| Explore loading/empty | `dining_passport_system_states` | Implement exactly |
| Map empty | `dining_passport_system_states` | Implement exactly |
| 404 | None | Derive from Stitch EmptyState system (OD-16) |
| Network failure | None | InlineError pattern from system + auth errors |
| Google unavailable | Component library + existing wrappers | Restyle chrome only |
| Auth required (`/account`) | Partial (account + login) | Keep redirect; branded interstitial optional |
| `/dev/google-places-spike` | Out of scope | Leave or delete later; not product |

---

## Feature preservation checklist (all routes)

Every migrated route must still support applicable items from the product capability list in the planning brief (Passport flags, reservation truthfulness, Google boundary, map behaviors, auth flows, taxonomy browsing). Visual rejection of old layouts does not authorize feature deletion.
