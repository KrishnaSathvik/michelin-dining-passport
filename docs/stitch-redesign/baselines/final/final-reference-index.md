# Final reference index

Cross-route Phase 12 baselines under `docs/stitch-redesign/baselines/final/`.  
Captured from Dining Passport on dedicated port **3112** (`next start`) unless noted.

| Screenshot | Route / state | Viewport | Stitch source | Earlier notes | Accepted deviations |
|---|---|---|---|---|---|
| home-1440.png | `/` | 1440 | `explore_feed` | `baselines/homepage/` | Featured roster only |
| home-390.png | `/` | 390 | `explore_feed` | homepage | Stats 2×2 |
| explore-grid-1440.png | `/explore` grid | 1440 | explore designs | `baselines/explore/` | — |
| explore-grid-390.png | `/explore` | 390 | explore | explore | 1-col |
| explore-list-1440.png | `/explore?view=list` | 1440 | explore list | explore | — |
| explore-drawer-390.png | Explore filters open | 390 | explore drawer | explore | — |
| map-selected-1440.png | `/map` selected | 1440 | map selected | `baselines/map/` | Compact Google when flagged |
| map-mobile-expanded-390.png | Map mobile sheet | 390 | map mobile | map | — |
| restaurant-detail-1440.png | `/restaurants/[slug]` | 1440 | detail | `baselines/restaurant-detail/` | — |
| restaurant-detail-390.png | detail | 390 | detail | restaurant-detail | Sticky bar |
| passport-active-1440.png | `/passport` with data | 1440 | passport | `baselines/passport/` | Seeded store |
| passport-empty-390.png | `/passport` empty | 390 | passport empty | passport | — |
| saved-1440.png | `/saved` | 1440 | lists | passport | — |
| planned-390.png | `/planned` | 390 | lists | passport | — |
| visited-1440.png | `/visited` | 1440 | lists | passport | — |
| collections-index-1440.png | `/collections` | 1440 | collections | `baselines/collections/` | — |
| collection-detail-390.png | `/collections/[slug]` | 390 | collection detail | collections | Seeded |
| login-1440.png | `/login` | 1440 | auth | `baselines/auth-account/` | No global chrome |
| login-390.png | `/login` | 390 | auth | auth-account | Form-first |
| account-1440.png | `/account` redirect | 1440 | account | auth-account | Unauthenticated → login |
| account-390.png | `/account` redirect | 390 | account | auth-account | Same |
| state-1440.png | `/usa/california` | 1440 | taxonomy | `baselines/taxonomy-education/` | — |
| city-390.png | `/cities/new-york` | 390 | taxonomy | taxonomy-education | — |
| cuisine-1440.png | `/cuisines/japanese` | 1440 | taxonomy | taxonomy-education | U.S. hubs only |
| stars-1-390.png | `/stars/1` | 390 | stars | taxonomy-education | — |
| stars-2-1440.png | `/stars/2` | 1440 | stars | taxonomy-education | — |
| stars-3-1440.png | `/stars/3` | 1440 | stars | taxonomy-education | — |
| education-390.png | `/about-michelin-stars` | 390 | education | taxonomy-education | — |
| not-found-1440.png | unknown path | 1440 | `system_states` | Phase 12 | Shared NotFoundState |
| not-found-390.png | unknown path | 390 | `system_states` | Phase 12 | — |
| route-error-1440.png | RouteErrorState | 1440 | `system_states` | Phase 12 | Captured from `/dev/stitch-foundation` (dev); identical to `error.tsx` |
| provider-unavailable.png | Google section fallback | detail | Google boundary | google e2e | Kit disabled / fallback copy |
