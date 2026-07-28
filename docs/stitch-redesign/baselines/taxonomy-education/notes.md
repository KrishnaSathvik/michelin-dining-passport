# Phase 11 — Taxonomy & Michelin education baselines

Primary references (copied under `references/`):

- `state_california_michelin_guide_discovery/screen.png`
- `city_new_york_city_michelin_guide_discovery/screen.png`
- `cuisine_japanese_michelin_guide_discovery/screen.png`
- `distinction_three_michelin_stars_discovery/screen.png`
- `how_michelin_stars_work/screen.png`

## Composition decisions

### Shared

- Heroes ~614px desktop where photo-based; soft band for star distinction pages
- Breadcrumbs on hero (photo) or soft band (stars); education has no breadcrumb trail
- Restaurant cards: Phase 3 `RestaurantDiscoveryCard` via `toExploreGridCards(..., "taxonomy")`
- Atmospheric hero uses `/images/homepage-hero.jpg` as generic dining atmosphere — never as a named restaurant
- No Google Places UI Kit mounts
- No Bib Gourmand counts on taxonomy pages

### State

- At a Glance: total, cities, cuisines + star breakdown (no Bib)
- City overview: real city links with counts (map preview omitted — no fake labels)
- Related: Explore filter, peer states, education

### City

- Culinary Distinction bento: live 1/2/3 counts
- Dominant Cuisines: `count / cityTotal` percentages with accessible labels

### Cuisine

- OD-14 hubs: U.S. cities only when ≥2; otherwise omit section
- Terminology glossary omitted (no reviewed first-party content)
- Explore link for advanced filters

### Stars

- Soft editorial hero with star marks + independence framing
- 3★: editorial mosaic of full set
- 2★: dense discovery grid of full set
- 1★: first 24 + Explore CTA for remainder
- Other distinctions nav with `aria-current` on current

### Education

- H1: How Michelin Stars Work
- Canonical AppHeader/Footer only (discard Stitch alternate nav)
- Bib/Green educational-only; not roster filters
- Real roster counts on star cards

## Visual deviations from Stitch

| Area | Deviation |
|---|---|
| State map | City list instead of decorative CA vector map |
| Cuisine hubs | U.S. cities only (no Tokyo/Kyoto/Paris) |
| Cuisine filters | Delegated to Explore (no fake chip engine) |
| Hero photography | Local atmosphere asset / soft band vs Stitch CDN |
| Education nav | Canonical product nav vs Curations/Guides mock |
| Illustrative counts | Replaced with live dataset totals |

## Capture

Run `node scripts/capture_taxonomy_education_baselines.mjs` against a local server (`BASE_URL`).
