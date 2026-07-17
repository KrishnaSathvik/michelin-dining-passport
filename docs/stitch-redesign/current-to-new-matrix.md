# Current → New Replacement Matrix

Many current UI components will be **replaced**, not incrementally styled. Logic columns list what must survive.

Complexity: **L** low · **M** medium · **H** high · **VH** very high

| Current component or page | Current responsibility | Logic to preserve | Visual structure to discard | New component or page | Stitch design reference | Migration complexity | Test coverage affected | Deletion point |
|---|---|---|---|---|---|---|---|---|
| `src/app/page.tsx` + `home/*` | Homepage sections | Totals, featured selection | Multi-section utility homepage | **Done** — `stitch/home/HomepageView` | `explore_feed` | H | `e2e/homepage.spec.ts`, `test_homepage.mjs` | **Phase 4 complete** |
| `SearchHero` | Hero + search | Search GET→explore | Old hero layout | **Deleted** — `MarketingHero` (no in-hero search; header search retained) | `explore_feed` | M | — | **Phase 4 complete** |
| `FeaturedRestaurants` | Featured grid | Restaurant list data | Old cards/spacing | **Deleted** — `HomepageFeaturedSection` + Phase 3 discovery cards | `explore_feed` | M | — | **Phase 4 complete** |
| `BrowseByState` / `BrowseByCuisine` / `MapTeaser` / `MichelinStarsExplained` / `PassportPreview` | Extra home modules | Underlying links/data | Entire modules on home | **Deleted from `/`** — capabilities on dedicated routes | none on Stitch home | L | — | **Phase 4 complete** |
| `explore/page.tsx` + `explore/*` | Directory UX | `lib/data/explore` URL model | Toolbar/drawer/results chrome | **Done** — `stitch/explore/ExplorePageView` | explore grid + list/drawer | H | `test_explore.mjs`, `test_explore_ui.mjs`, `e2e/explore.spec.ts` | **Phase 5 complete** |
| `ExploreResults` / cards wiring | Results render | Pagination, view param | Grid/list presentation | **Deleted** — `ExploreGrid` / `ExploreList` + Phase 3 cards | explore + system_states | M | e2e | **Phase 5 complete** |
| `map/page.tsx` + `RestaurantMap` | Map workspace UI | Query, filters, selection | Panel layout/list/detail | **Done** — `stitch/map/MapWorkspaceView` (+ controller) | `dining_passport_map_workspace` | VH | `e2e/map.spec.ts`, google-places map | **Phase 6 complete** |
| `MapCanvas` | MapLibre render | Clustering, sync, controls hooks | Marker chrome if mismatched | **Kept**; selected marker gold-ring restyle | map workspace | M | map e2e | **Phase 6 complete** |
| `restaurants/[slug]/page.tsx` | Detail page | Data, related/nearby, notFound | Full page composition | **Done** — `stitch/restaurant-detail/RestaurantDetailView` | `restaurant_profile_benu` | VH | reservations + google-places + restaurant-detail e2e | **Phase 7 complete** |
| `RestaurantDetailStickyBar` | Mobile CTA bar | Actions | Visual | **Deleted** — stitch sticky bar | benu mobile transform | M | — | **Phase 7 complete** |
| `RestaurantPassportControls` | Journey toggles + dialogs | Passport mutations | Control chrome | **Deleted** — `JourneyControls` + dialogs | benu + plan/record dialogs | H | passport unit tests | **Phase 7 complete** |
| `ReservationButton` | Outbound reserve | Resolver + labels + analytics | Button styling | `ReservationAction` | all CTAs | M | `e2e/reservations.spec.ts`, `test_reservations.mjs` | Phase 3 |
| `SaveRestaurantButton` | Save toggle | Passport save | Button styling | `SaveAction` | cards/detail | L | — | Phase 3 |
| `RestaurantDiscoveryCard` / `Compact` / `Editorial` | Cards | Linking, badges data | Card layout | New card variants | library + explore + home | H | reservations e2e selectors | Phase 3 |
| `RestaurantMedia` / fallbacks | Images | First-party + fallback rules | Visual fallback | Stitch media/fallback | DESIGN.md | M | — | Phase 3 |
| `StarMark` / `PriceMark` / `CuisineLabel` | Meta atoms | Data formatting | Styling | Restyle or replace | library | L | — | Phase 3 |
| `passport/page` + `PassportHome` | Passport hub | Metrics, sections, empty | Dashboard layout | **Done** — `stitch/passport/PassportPageView` (`PassportHome` deleted) | `personal_passport` + empty | H | `test_passport_*.mjs`, `e2e/passport.spec.ts` | **Phase 8 complete** |
| `PassportRestaurantList` | Saved/visited/planned lists | Mode filtering | List chrome | **Done** — `PassportListPage` + mode cards (`PassportRestaurantList` deleted) | saved/visited/planned | M | e2e passport + reservations | **Phase 8 complete** |
| `saved/page` / `visited/page` / **`planned/page`** | Personal lists | Data filters | Presentation | **Done** — Stitch list pages; `/planned` added (OD-07) | saved/visited/planned | M | e2e | **Phase 8 complete** |
| `CollectionsManager` / `CollectionDetail` | Collections CRUD UI | Collection store ops | Presentation | **Done** — `stitch/collections/*` (old presentation deleted) | collections overview/detail | H | `test_collections_phase9.mjs`, `e2e/collections.spec.ts` | **Phase 9 complete** |
| `(auth)/*` + `AuthForm` | Auth flows | Server actions, redirects | Split shell / forms | **Done** — `stitch/auth/*` (`AuthForm` deleted) | auth quartet | M | `e2e/auth.spec.ts`, `test_auth_redirect.mjs`, `test_auth_phase10.mjs` | **Phase 10 complete** |
| `(auth)/layout.tsx` | Auth aside | — | Current forest aside | **Done** — atmospheric AuthShell | sign_in etc. | M | e2e shell/auth | **Phase 10 complete** |
| `AccountPanel` | Account mgmt | Session, deletion, sync actions | Settings IA chrome | **Done** — `stitch/account/*` (`AccountPanel` deleted) | `account_settings_profile` | H | auth e2e | **Phase 10 complete** |
| `TaxonomyPageShell` + taxonomy pages | Hubs | Aggregations, listings | Shared shell layout | Taxonomy heroes/bentos | state/city/cuisine/stars | H | — | Phase 11 |
| `about-michelin-stars` | Education | Copy/content | Layout + bad nav if any | Education composition | `how_michelin_stars_work` | M | — | Phase 11 |
| `SiteHeader` / `SiteFooter` | Chrome | Nav hrefs, disclaimer text | Layout/type | `AppHeader` / `SiteFooter` | library | M | many e2e | Phase 2 |
| `Container` / `Section` | Layout primitives | — | Old spacing | `PageContainer` + section tokens | DESIGN.md | L | — | Phase 1–2 |
| `Button` / `FilterChip` | Primitives | Variants API if useful | Visual | Stitch Button/Chip | library | M | — | Phase 1 |
| `Breadcrumbs` | Nav trail | Item model | Styling | Restyle | detail/taxonomy | L | — | Phase 2 |
| Google Places wrappers | Live Google UI | Loader, flags, place IDs, boundaries | Outer frames | Keep kits; new frames | benu + map + library | M | `e2e/google-places.spec.ts`, `test_google_places*.mjs` | Phase 6–7 |
| `globals.css` tokens | Theme | a11y base, reduced motion | Old token values | New `--dp-*` tokens | DESIGN.md | H | visual | Phase 1 |
| `GooglePlacesSpikeClient` / `/dev/google-places-spike` | Spike | None for product | Entire surface | — | — | L | spike-only | After Google prod paths stable |
| `.paper-texture` | Deprecated alias | None | Utility | Delete | — | L | — | Phase 1 |
| Missing `not-found.tsx` / `error.tsx` | Defaults | — | — | New system states | derive from system_states | M | — | Phase 12 |

## Classification reminder

| Bucket | Examples |
|---|---|
| **Preserve logic** | Passport provider/store/merge; reservation resolver; Google config/loader/UI Kit; MapLibre/query/geocodes; auth actions/session; explore data layer; SEO |
| **Adapt UI** | Thin wrappers where behavior is correct but chrome is wrong (Google section frame, sticky bar) |
| **Replace UI** | Almost all presentational components listed above |
| **Delete after migration** | Old home modules unused elsewhere; old cards; old explore chrome; spike; obsolete CSS |

## Selector / test risk

Playwright specs that target old class names or button copy must be updated **with** each route migration, not deferred to the end. Prefer role/label selectors aligned to Stitch copy (`Reserve now`, `Search this area`, etc.) while preserving truthful reservation labels from the resolver.
