# Component Architecture

## Principles

1. **Controllers stay; views rebuild.** Hooks, providers, resolvers, and server actions feed new presentational components.
2. **Adapters / view models** sit between domain types and Stitch-shaped props (e.g. `toDiscoveryCardModel(restaurant)`).
3. **No “close enough” reuse** of visually incorrect components.
4. **Google boundary preserved:** only existing UI Kit wrappers render Google content.
5. Prefer `src/components/stitch/` or rebuild in-place by family during migration — pick one nesting strategy in Phase 1 and stick to it. Recommendation: rebuild under existing folders but **new file names** for Stitch components, deleting old files at deletion points.

## Separation pattern

```text
Route page (RSC where possible)
  → data loaders / searchParams parsers (preserve)
  → view-model mappers (new)
  → Stitch presentational components (new)
  → domain hooks for client islands (preserve: usePassport, map state, auth)
```

---

## Shell

| Component | Role | Design ref |
|---|---|---|
| `AppHeader` | 72px sticky TopAppBar; logo; nav; search; account | component library + all screens |
| `AuthChrome` | Optional minimal header on auth routes if split shell hides global nav | auth screens |
| `SiteFooter` | Soft `#F5F6F4` footer; links; independence disclaimer | all marketing pages |
| `SiteFooterGate` | Hide footer on `/map` | preserve behavior |
| `MapWorkspaceLayout` | Header + 420px panel + map stage | map workspace |
| `PageContainer` | 1280 max; 64/20 margins | DESIGN.md |
| `SectionHeader` | Serif title + meta + optional View All | homepage/explore |
| `Breadcrumbs` | Restyle existing | taxonomy/detail |

---

## Discovery

| Component | Role |
|---|---|
| `HeroSearch` / `MarketingHero` | Homepage full-bleed hero |
| `StatsStrip` | 271 / star breakdown |
| `DiscoveryToolbar` | Search + filters + sort + view toggle |
| `QuickFilter` | Chip/pill quick facets |
| `ActiveFilterChip` | Removable applied filters |
| `AllFiltersDrawer` | Full filter IA |
| `SortControl` | Sort select |
| `ViewToggle` | Grid / list |
| `Pagination` | Explore pagination |
| `ExploreEmptyState` | From system states |
| `ExploreSkeletonGrid` | From system states |

---

## Restaurant presentation

| Component | Role |
|---|---|
| `RestaurantDiscoveryCard` | Grid card; 4:3; star badge; meta; reservation CTA |
| `RestaurantEditorialCard` | Larger editorial treatments (distinction bento, featured) |
| `RestaurantListRow` | Explore list |
| `RestaurantMapRow` | Map panel list row (text-forward) |
| `RestaurantIdentityHero` | Detail split media/identity |
| `MichelinDistinction` | Star gold badge (not Google) |
| `RestaurantMedia` | First-party image |
| `RestaurantFallback` | Designed fallback system |
| `ReservationAction` | Wraps resolver; truthful labels |
| `SaveAction` | Save control |
| `RestaurantStatusControl` / `JourneyControls` | Save / Want / Visited / Favorite circular set |
| `RelatedRestaurantCard` | Related discovery |
| `NearbyRestaurantRow` | Nearby list |
| `RestaurantDetailStickyBar` | Mobile actions — restyle |

---

## Google (preserve provider boundary)

| Component | Action |
|---|---|
| `GooglePlacesUiKitProvider` | Preserve |
| `GooglePlaceDetails` | Preserve; restyle **outer chrome only** |
| `GooglePlaceDetailsCompact` | Preserve for map selection |
| `RestaurantGooglePlacesSection` | Rebuild section frame to match “Live from Google” card |
| `MapSelectedGooglePlace` | Rebuild frame; keep kit |
| `GooglePlaceSkeleton` / `GooglePlaceUnavailable` / `GooglePlaceErrorBoundary` | Restyle to Stitch empty/error |

---

## Passport

| Component | Role |
|---|---|
| `PassportHero` | Title / empty hero |
| `PassportJourneySummary` | Visited / To Visit / Favorites |
| `PassportMap` | Optional progress map (from overview design if approved) |
| `RecentlyVisited` / `SavedNext` / `PlannedAgenda` | Section modules |
| `StateProgress` / `StarsProgress` / `CuisineProgress` | Progress cards |
| `YearlyTimeline` | Only if data supports — otherwise defer |
| `PassportEmptyState` | New user |
| `PlanningDetailsDialog` | From plan dialog |
| `VisitDetailsDialog` | From record dialog |
| `DeviceSaveNotice` | Preserve behavior; restyle |

Domain: keep `PassportProvider`, store, merge, metrics.

---

## Collections

| Component | Role |
|---|---|
| `CollectionEditorialCard` | Featured |
| `CollectionGridCard` | Grid |
| `CollectionHero` | Detail hero |
| `CollectionProgress` | Sidebar progress |
| `CollectionRestaurantRow` | Detail list |
| `CollectionEditorDialog` | Create/edit |
| `DeleteCollectionDialog` | Confirm |

---

## Authentication & account

| Component | Role |
|---|---|
| `AuthShell` | Split atmospheric + form |
| `AuthForm` | Rebuild presentation; keep actions |
| `PasswordField` | With show/hide if designed |
| `MagicLinkFlow` | Login panel mode |
| `AuthSuccessState` / `AuthErrorState` | Forgot/reset/login feedback |
| `AccountLayout` | Aside + sections |
| `AccountSectionCard` | Profile/security/sync/danger |
| `DeleteAccountDialog` | Confirm |

---

## Feedback / overlays

| Component | Role |
|---|---|
| `Drawer` | Filters / mobile map panel |
| `Dialog` | Plan/visit/collections |
| `ConfirmationDialog` | Destructive |
| `EmptyState` | Shared |
| `InlineError` | Forms / panels |
| `Toast` | If used; restyle |
| `NotFoundState` | 404 |
| `Skeleton*` | Match real layouts |

---

## Map-specific

| Component | Role |
|---|---|
| `MapFilterBar` | Stars/State/Cuisine/Saved/Visited |
| `MapSelectedPanel` | Selected restaurant detail in panel |
| `MapControls` | Zoom, locate, fit, search this area |
| `MapEmptyState` | System states |
| `MapCanvas` | **Preserve** MapLibre implementation |

---

## Taxonomy

| Component | Role |
|---|---|
| `TaxonomyHero` | Photo + breadcrumbs + title |
| `TaxonomyStatsBento` | Counts / cuisine mix |
| `DistinctionBentoGrid` | Stars pages |
| `CuisineHubGrid` | US hubs only |
| `EducationStarCards` | About page |

Replace `TaxonomyPageShell` composition entirely.

---

## View-model adapters (new)

Suggested location: `src/lib/view-models/` or `src/components/**/mappers.ts`

| Mapper | Input | Output |
|---|---|---|
| `toDiscoveryCardModel` | Restaurant + reservation resolution + passport flags | Card props |
| `toMapRowModel` | Restaurant + selection state | Map row props |
| `toIdentityHeroModel` | Restaurant + reservation + passport | Hero props |
| `toPassportSummaryModel` | Passport metrics | Summary cards |
| `toCollectionCardModel` | Collection + restaurants | Grid props |

---

## Icons

Use Material Symbols Outlined to match Stitch HTML, or map to an existing icon set with equivalent glyphs. Do not introduce Michelin flower icons.

## What not to build

- Parallel duplicate app tree
- Second design-system package living forever beside the old one
- Custom Google photo carousels
- Public sharing stacks without product support
- Mobile bottom nav unless open decision approves (only one design shows it)
