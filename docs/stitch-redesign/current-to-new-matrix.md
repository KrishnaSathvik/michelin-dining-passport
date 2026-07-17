# Current → New Replacement Matrix

Many current UI components will be **replaced**, not incrementally styled. Logic columns list what must survive.

Complexity: **L** low · **M** medium · **H** high · **VH** very high

| Current component or page | Current responsibility | Logic to preserve | Visual structure to discard | New component or page | Stitch design reference | Migration complexity | Test coverage affected | Deletion point |
|---|---|---|---|---|---|---|---|---|
| `src/app/page.tsx` + `home/*` | Homepage sections | Totals, featured selection | Multi-section utility homepage | **Done** — `stitch/home/HomepageView` | `explore_feed` | H | `e2e/homepage.spec.ts`, `test_homepage.mjs` | **Phase 4 complete** |
| `SearchHero` | Hero + search | Search GET→explore | Old hero layout | **Deleted** — `MarketingHero` (no in-hero search; header search retained) | `explore_feed` | M | — | **Phase 4 complete** |
| `FeaturedRestaurants` | Featured grid | Restaurant list data | Old cards/spacing | **Deleted** — `HomepageFeaturedSection` + Phase 3 discovery cards | `explore_feed` | M | — | **Phase 4 complete** |
| `BrowseByState` / `BrowseByCuisine` / `MapTeaser` / `MichelinStarsExplained` / `PassportPreview` | Extra home modules | Underlying links/data | Entire modules on home | **Deleted from `/`** — capabilities on dedicated routes | none on Stitch home | L | — | **Phase 4 complete** |
| `explore/page.tsx` + `explore/*` | Directory UX | `lib/data/explore` URL model | Toolbar/drawer/results chrome | New Explore suite | explore grid + list/drawer | H | `test_explore.mjs`; e2e reserve paths | Phase 5 |
| `ExploreResults` / cards wiring | Results render | Pagination, view param | Grid/list presentation | New results + skeletons | explore + system_states | M | e2e | Phase 5 |
| `map/page.tsx` + `RestaurantMap` | Map workspace UI | Query, filters, selection | Panel layout/list/detail | `MapWorkspaceLayout` + rows/panel | `dining_passport_map_workspace` | VH | `e2e/map.spec.ts` | Phase 6 |
| `MapCanvas` | MapLibre render | Clustering, sync, controls hooks | Marker chrome if mismatched | Keep; restyle markers to fork/gold | map workspace | M | map e2e | Phase 6 (adapt) |
| `restaurants/[slug]/page.tsx` | Detail page | Data, related/nearby, notFound | Full page composition | Identity hero + details + Google frame | `restaurant_profile_benu` | VH | reservations + google-places e2e | Phase 7 |
| `RestaurantDetailStickyBar` | Mobile CTA bar | Actions | Visual | Restyled sticky bar | benu mobile transform | M | — | Phase 7 |
| `RestaurantPassportControls` | Journey toggles + dialogs | Passport mutations | Control chrome | `JourneyControls` + dialogs | benu + plan/record dialogs | H | passport unit tests | Phase 7–8 |
| `ReservationButton` | Outbound reserve | Resolver + labels + analytics | Button styling | `ReservationAction` | all CTAs | M | `e2e/reservations.spec.ts`, `test_reservations.mjs` | Phase 3 |
| `SaveRestaurantButton` | Save toggle | Passport save | Button styling | `SaveAction` | cards/detail | L | — | Phase 3 |
| `RestaurantDiscoveryCard` / `Compact` / `Editorial` | Cards | Linking, badges data | Card layout | New card variants | library + explore + home | H | reservations e2e selectors | Phase 3 |
| `RestaurantMedia` / fallbacks | Images | First-party + fallback rules | Visual fallback | Stitch media/fallback | DESIGN.md | M | — | Phase 3 |
| `StarMark` / `PriceMark` / `CuisineLabel` | Meta atoms | Data formatting | Styling | Restyle or replace | library | L | — | Phase 3 |
| `passport/page` + `PassportHome` | Passport hub | Metrics, sections, empty | Dashboard layout | New passport narrative | `personal_passport` + empty | H | `test_passport_*.mjs` | Phase 8 |
| `PassportRestaurantList` | Saved/visited lists | Mode filtering | List chrome | List pages from designs | saved/visited/planned | M | — | Phase 8 |
| `saved/page` / `visited/page` | Personal lists | Data filters | Presentation | Stitch list pages | saved/visited | M | — | Phase 8 |
| `CollectionsManager` / `CollectionDetail` | Collections CRUD UI | Collection store ops | Presentation | New collection components | collections overview/detail | H | — | Phase 9 |
| `(auth)/*` + `AuthForm` | Auth flows | Server actions, redirects | Split shell / forms | `AuthShell` + forms | auth quartet | M | `e2e/auth.spec.ts`, `test_auth_redirect.mjs` | Phase 10 |
| `(auth)/layout.tsx` | Auth aside | — | Current forest aside | Match Stitch atmospheric split | sign_in etc. | M | — | Phase 10 |
| `AccountPanel` | Account mgmt | Session, deletion, sync actions | Settings IA chrome | Account aside + sections | `account_settings_profile` | H | auth e2e | Phase 10 |
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
