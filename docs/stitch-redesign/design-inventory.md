# Design Inventory

Every package under `docs/designs/` was inspected (HTML structure + screenshot where present). Intended canvas for product screens is **desktop ~1280–1440px content**; PNG pixel sizes are often crop/export artifacts and should not override HTML layout specs.

**Shared theme (most HTML files):** Literata + Inter, Material Symbols, 8px spacing unit, 1280px max container, 64px desktop / 20px mobile margins, 80px section padding, 24px gutter, surface `#fcf9f8`, primary `#00251b` / `#123b2f`.

---

## Design system

### `michelin_discovery_system`

| Field | Value |
|---|---|
| **Files** | `DESIGN.md` |
| **Dimensions** | N/A (spec) |
| **Intended route/state** | Global visual contract |
| **Key characteristics** | Quiet-luxury editorial system; Primary Green `#123B2F`; Star Gold `#B88A2A`; Burgundy `#7A1F2B`; soft sage `#F5F6F4`; Literata + Inter; 72px sticky header; 48px buttons; 4:3 card images; flat elevation; required independence disclaimer |
| **Responsive status** | Spec only: 12-col desktop → 4-col mobile |
| **Unclear details** | Prose gold/burgundy hexes vs Material YAML secondary/tertiary tokens differ — see open decisions |

---

## Screen packages (29)

### 1. `explore_feed`

| Field | Value |
|---|---|
| **Files** | `code.html`, `screen.png` **1091×1600** |
| **Intended route** | `/` (homepage) — filename is misleading |
| **Composition** | Sticky header → full-bleed atmospheric hero (“America’s Finest Tables”) → stats strip (271 / 216 / 39 / 16) → Featured Destinations 3-up cards with primary CTA → footer |
| **Reusable** | TopAppBar, StatsStrip, SectionHeader, RestaurantDiscoveryCard, SiteFooter |
| **One-off** | Marketing hero photography |
| **Interactions** | Nav, search icon, View All, card CTA |
| **Responsive** | Desktop primary; mobile not designed |
| **Unclear** | Whether homepage includes Browse-by-state/cuisine modules (current app does; Stitch does not) |

### 2. `explore_michelin_starred_restaurants`

| Field | Value |
|---|---|
| **Files** | `code.html`, `screen.png` **1189×1600** |
| **Intended route** | `/explore` grid |
| **Composition** | Header → H1 + result count → search + quick filters + sort + grid/list toggle → 4-col discovery cards → pagination → footer |
| **Reusable** | DiscoveryToolbar, QuickFilter, ViewToggle, RestaurantDiscoveryCard, Pagination |
| **Density** | Editorial but denser than homepage; soft-bg `#F5F6F4` appears |
| **Responsive** | 4→2→1 implied |
| **Unclear** | Exact pagination control styling |

### 3. `explore_list_view_filters_drawer`

| Field | Value |
|---|---|
| **Files** | `code.html`, `screen.png` **2560×3216** |
| **Intended route** | `/explore` list + All filters drawer |
| **Composition** | Dimmed explore list (horizontal list rows) + right filter drawer (distinctions, location, cuisine, price segmented control, Saved/Visited toggles, Clear/Apply) |
| **Reusable** | RestaurantListRow, AllFiltersDrawer, ActiveFilterChip |
| **Responsive** | Drawer → full-screen on mobile |
| **Unclear** | Font conflict: Instrument Serif loaded here vs Literata system default |

### 4. `dining_passport_map_workspace`

| Field | Value |
|---|---|
| **Files** | `code.html`, `screen.png` **1600×1280** |
| **Intended route** | `/map` **canonical** |
| **Composition** | Full-viewport workspace (no footer): sticky header + **420px left panel** (search, Stars/State/Cuisine/Saved filters, list, selected detail with RESERVE/DETAILS + Google live strip) + map (fork markers, gold selected ring, SEARCH THIS AREA, zoom/locate) |
| **Reusable** | MapWorkspaceLayout, RestaurantMapRow, MapSelectedPanel, MapControls |
| **Tokens** | Explicit `restrained-gold #B88A2A`; also loads Instrument Serif |
| **Responsive** | Panel → drawer/bottom sheet (implied, not fully designed) |
| **Unclear** | Exact mobile sheet breakpoints |

### 5. `map_view`

| Field | Value |
|---|---|
| **Files** | `code.html`, `screen.png` **1600×1280** |
| **Intended route** | `/map` **simpler / superseded candidate** |
| **Composition** | ~400px left panel with photo thumbnails + map with popup card; fewer controls |
| **Conflicts** | Competes with `dining_passport_map_workspace` — recommend workspace as canonical |
| **Unclear** | Whether thumbnail list is intentional vs text-only workspace rows |

### 6. `dining_passport_system_states`

| Field | Value |
|---|---|
| **Files** | `code.html`, `screen.png` **2560×5370** |
| **Intended route** | Spec board (loading / empty / map empty) |
| **Composition** | Explore skeleton grid; explore empty with clear-filters + suggestions; map empty panel + Fit all restaurants |
| **Reusable** | SkeletonCard, EmptyState, MapEmptyState |
| **Responsive** | Not specified |

### 7. `dining_passport_component_library`

| Field | Value |
|---|---|
| **Files** | `code.html`, `screen.png` **568×1600** |
| **Intended route** | Internal styleguide (not a product route) |
| **Composition** | Header, footer, type scale, buttons/inputs, discovery + editorial cards, Google Places module |
| **Width hint** | 1440px canvas |
| **Role** | Token + component reference when screen designs conflict |

### 8. `restaurant_profile_benu`

| Field | Value |
|---|---|
| **Files** | `code.html`, `screen.png` **933×1600** |
| **Intended route** | `/restaurants/[slug]` **canonical recommendation** |
| **Composition** | Header → breadcrumbs → **~58% media / ~42% identity** (badge, title, meta, Reserve/Website, circular Your Journey: Save/Want/Visited/Favorite) → Details 3-col (facts | map | Live from Google) → Related Discovery 3 cards → footer |
| **Reusable** | RestaurantIdentityHero, MichelinDistinction, ReservationAction, JourneyControls, Google section chrome, RelatedRestaurantCard |
| **Unclear** | Nearby restaurants section not shown (app has it) |

### 9. `restaurant_profile`

| Field | Value |
|---|---|
| **Files** | `code.html`, `screen.png` **1038×1600** |
| **Intended route** | `/restaurants/[slug]` **Variant A** |
| **Composition** | Full-bleed hero with name overlay + gold star badge → pill action row → About + Google photo strip | Reserve sidebar |
| **Conflicts** | Competes with Benu split-hero — recommend Benu variant |
| **Unclear** | Google photo strip must map to UI Kit, not custom scraped photos |

### 10. `plan_your_visit_dialog`

| Field | Value |
|---|---|
| **Files** | `code.html`, `screen.png` **1038×1600** |
| **Intended route** | Detail overlay on `/restaurants/[slug]` |
| **Composition** | Modal over restaurant profile: planned date, reservation provider, confirmation note, private note → CANCEL / SAVE PLAN |
| **Reusable** | PlanningDetailsDialog |
| **Unclear** | Drawer vs modal on mobile |

### 11. `record_your_visit_dialog`

| Field | Value |
|---|---|
| **Files** | `code.html`, `screen.png` **1038×1600** |
| **Intended route** | Detail overlay on `/restaurants/[slug]` |
| **Composition** | Visit date, favorite dishes, private notes, mark favorite → SAVE VISIT |
| **Reusable** | VisitDetailsDialog |

### 12. `personal_passport`

| Field | Value |
|---|---|
| **Files** | `code.html`, `screen.png` **1373×1600** |
| **Intended route** | `/passport` active user **canonical recommendation** |
| **Composition** | Your Passport → 3 summary cards (Visited / To Visit / Favorites) → Stars Collected + States Explored progress → Personal Collection 3-up with status badges → footer |
| **Reusable** | PassportHero, JourneySummary, StateProgress, Cuisine/Stars progress, PassportRestaurantCard |
| **Unclear** | Dish tags on cards vs real favorite-dishes data |

### 13. `personal_passport_new_user_state`

| Field | Value |
|---|---|
| **Files** | `code.html`, `screen.png` **1056×1600** |
| **Intended route** | `/passport` empty |
| **Composition** | Onboarding hero + CTAs → illustrative preview → 3 feature columns (Save/Plan/Record) → cloud sync note |
| **Conflicts** | Alternate nav IA (Discover/Reservations/Awards/Guides) — discard that nav |
| **Reusable** | PassportEmptyState |

### 14. `personal_passport_overview`

| Field | Value |
|---|---|
| **Files** | `code.html`, `screen.png` **1559×1600** |
| **Intended route** | `/passport` alternate |
| **Composition** | Brand **“L'Assiette d'Or”** + Journal nav + US map stats + **mobile bottom nav** |
| **Conflicts** | Brand rename; Journal vs Passport; only bottom-nav design — reject brand rename; park bottom-nav as open decision |
| **Status** | Non-canonical for brand/nav; may inform map progress visualization |

### 15. `saved_restaurants`

| Field | Value |
|---|---|
| **Files** | `code.html`, `screen.png` **1080×1600** |
| **Intended route** | `/saved` |
| **Composition** | Breadcrumbs → Saved Restaurants → filters/sort/grid|list → 3-col cards (Added date, Reserve, Move to Planned) → Load More |
| **Reusable** | PassportListPage shell, RestaurantDiscoveryCard variant |

### 16. `planned_restaurants`

| Field | Value |
|---|---|
| **Files** | `code.html`, `screen.png` **1221×1600** |
| **Intended route** | Designed as planned list — **app has no `/planned` route today** |
| **Composition** | Vertical list rows with date/provider, Edit / Mark visited / Manage Reservation |
| **Unclear** | Add `/planned` route vs keep planned as Passport section only — open decision |
| **Mock risk** | Includes non-US restaurants |

### 17. `visited_restaurants`

| Field | Value |
|---|---|
| **Files** | `code.html`, `screen.png` **2560×3858** |
| **Intended route** | `/visited` |
| **Composition** | Dining History header → search/filters → 3-col visit cards (favorite, date, italic quote/notes, Edit visit) |
| **Unclear** | Title “Dining History” vs route “Visited” |

### 18. `collections_overview_create_dialog`

| Field | Value |
|---|---|
| **Files** | `code.html`, `screen.png` **1002×1600** |
| **Intended route** | `/collections` + create dialog |
| **Composition** | Collections H1 + Create → featured collection → search/sort → 3-col grid → Create Collection dialog (name, description, public toggle) |
| **Mock risk** | “Make collection public” may exceed product model |
| **Screenshot note** | Modal composition error over a card |

### 19. `collection_detail_california_celebration_trip`

| Field | Value |
|---|---|
| **Files** | `code.html`, `screen.png` **1562×1600** |
| **Intended route** | `/collections/[slug]` |
| **Composition** | Breadcrumbs → title + Edit/Share/⋯ → hero image + Collection Progress sidebar → restaurant rows → footer |
| **Mock risk** | Share action may be unsupported |

### 20. `account_settings_profile`

| Field | Value |
|---|---|
| **Files** | `code.html`, `screen.png` **637×1600** |
| **Intended route** | `/account` |
| **Composition** | Settings H1 → sticky 240px aside (Profile / Security / Passport Sync / Data & Export / Notifications / Delete) → section cards → Delete Account modal |
| **Mock risk** | Notifications, export, session management may exceed current AccountPanel |
| **Unclear** | Which sections are visual aspiration vs required for v1 |

### 21. `sign_in_dining_passport`

| Field | Value |
|---|---|
| **Files** | `code.html`, `screen.png` **1600×1280** |
| **Intended route** | `/login` |
| **Composition** | Split auth shell: atmospheric left + Sign In form (password, magic link, Google optional, create account, device-only passport note) |
| **Reusable** | AuthShell, AuthForm |

### 22. `create_account_dining_passport`

| Field | Value |
|---|---|
| **Files** | `code.html`, `screen.png` **1600×1280** |
| **Intended route** | `/signup` |
| **Composition** | Same split shell; Full Name / Email / Password / Confirm |

### 23. `forgot_password_dining_passport`

| Field | Value |
|---|---|
| **Files** | `code.html`, `screen.png` **1600×1280** |
| **Intended route** | `/forgot-password` |
| **Composition** | Split shell + success “Check your email” state |

### 24. `reset_password_dining_passport`

| Field | Value |
|---|---|
| **Files** | `code.html`, `screen.png` **1600×1280** |
| **Intended route** | `/reset-password` |
| **Composition** | New + confirm password; success state in HTML |
| **Note** | Screenshot left image appears tiled (asset bug) |

### 25. `how_michelin_stars_work`

| Field | Value |
|---|---|
| **Files** | `code.html`, `screen.png` **763×1600** |
| **Intended route** | `/about-michelin-stars` |
| **Composition** | Photo hero + independence callout → 3 star education cards → Beyond the Stars → Explore/Map CTAs |
| **Conflicts** | Completely different nav IA — discard; keep page body composition under canonical nav |
| **Unclear** | Bib / Green Star education vs product support |

### 26. `state_california_michelin_guide_discovery`

| Field | Value |
|---|---|
| **Files** | `code.html`, `screen.png` **1223×1600** |
| **Intended route** | `/usa/[stateSlug]` |
| **Composition** | Coastal hero + breadcrumbs → At a Glance copy + stacked star/Bib stats + map placeholder |
| **Mock** | Fake map place names |

### 27. `city_new_york_city_michelin_guide_discovery`

| Field | Value |
|---|---|
| **Files** | `code.html`, `screen.png` **1532×1600** |
| **Intended route** | `/cities/[citySlug]` |
| **Composition** | Photo hero + breadcrumbs → H1 → 2-card bento (Culinary Distinction counts; Dominant Cuisines %) |
| **Mock** | Cuisine percentages illustrative |

### 28. `cuisine_japanese_michelin_guide_discovery`

| Field | Value |
|---|---|
| **Files** | `code.html`, `screen.png` **757×1600** |
| **Intended route** | `/cuisines/[cuisineSlug]` |
| **Composition** | Food hero → filter pills + sort → Culinary Hubs + Featured Establishments + Related Cuisines/Terminology aside |
| **Mock risk** | Global hubs/restaurants beyond US catalog |

### 29. `distinction_three_michelin_stars_discovery`

| Field | Value |
|---|---|
| **Files** | `code.html`, `screen.png` **959×1600** |
| **Intended route** | `/stars/3` (template for `/stars/[starCount]`) |
| **Composition** | Editorial intro → bento featured grid → Two/One Star nav cards |
| **Reusable** | DistinctionHero, BentoRestaurantGrid |

---

## Coverage summary

| Category | Packages |
|---|---|
| Design system / library / states | 3 |
| Homepage | 1 |
| Explore | 2 |
| Map | 2 |
| Restaurant detail + dialogs | 4 |
| Passport / lists | 6 |
| Collections | 2 |
| Auth | 4 |
| Account | 1 |
| Taxonomy / education | 4 |

## Routes with no direct Stitch screen

Documented in [route-design-map.md](./route-design-map.md). Highlights:

- Global 404 / `not-found`
- Network failure / provider unavailable (partially covered by system states + Google unavailable patterns)
- `/stars/1` and `/stars/2` (adapt from three-star template)
- Want-to-visit dedicated list (data exists; no route/design)
- Dev spike pages (out of scope)
