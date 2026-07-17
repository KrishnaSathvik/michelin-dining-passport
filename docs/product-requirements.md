# Product requirements — Michelin Dining Passport (working title)

## Vision

An independent discovery and personal tracking website for Michelin-starred restaurants.

**Product feeling:** an editorial dining atlas combined with a personal restaurant passport.

**Initial coverage:** all currently Michelin-starred restaurants in the United States (271 records as of the July 2026 workbook snapshot).

This product is **not** affiliated with Michelin. It must not copy Michelin Guide descriptions, logos, or photography.

---

## Problem

Michelin-starred dining is hard to explore as a personal journey:

- Official Guide browsing is listing-oriented, not passport-oriented.
- Scattered blogs and maps lack a coherent personal tracking layer.
- Travel planning across states/cities/cuisines requires too much tab-switching.
- Diners want to save, visit-log, and collect restaurants without joining a reservation marketplace.

---

## Goals (near-term)

1. Make the full U.S. starred set browsable without signup.
2. Establish a distinctive editorial + practical visual system.
3. Provide clear star education and geographic discovery.
4. Preview a personal passport that motivates later account features.
5. Keep architecture ready for map, auth, and collections — without paying for APIs before UI approval.

## Non-goals (Phase 0–1)

- Authentication / accounts
- Supabase (or any hosted DB) wiring
- Google Maps / Places integration
- Reservations or payments
- Global (non-U.S.) coverage
- Bib Gourmand / Selected restaurants
- Scraping Michelin content
- Generating fake restaurant photography

---

## Primary users

| Persona | Need |
| --- | --- |
| Curious diner | Browse by city, cuisine, stars; understand what stars mean |
| Travel planner | Build a shortlist for a trip (state/city focused) |
| Passport collector | Track visited / saved restaurants over years |
| Editor / admin (later) | Keep the roster accurate after Guide updates |

---

## Core jobs to be done

1. “Show me starred restaurants in a city I’m visiting.”
2. “Filter by stars / cuisine / price quickly.”
3. “Explain Michelin stars without fluff.”
4. “Save restaurants for later without creating an account yet (later: with account).”
5. “Mark restaurants visited and see my passport progress.”
6. “Explore the set on a map when I’m ready for geography.”

---

## Feature scope by horizon

### Horizon A — Foundation (Phase 0, this doc set)

- Dataset audit
- Product architecture
- Design system + homepage direction proposals
- Route map
- Restaurant presentation system (documented)

### Horizon B — Static discovery UI

- Homepage (approved direction)
- Explore with filters (client-side from local data)
- Restaurant detail pages from workbook fields
- State / city / cuisine / star taxonomy pages
- About Michelin stars
- Passport / saved / visited **preview shells** (local-only or mocked)

### Horizon C — Personal layer

- Auth
- Saved / visited / collections persistence
- Passport stats and milestones

### Horizon D — Map + enrichment

- Geocoded map experience
- Optional Places enrichment (hours, phone, photos under proper licensing)

---

## Information architecture (routes)

| Route | Purpose | Auth |
| --- | --- | --- |
| `/` | Homepage: search-led discovery + editorial sections | Public |
| `/explore` | Full directory with filters + sort | Public |
| `/map` | Map + list workspace | Public |
| `/restaurants/[slug]` | Restaurant detail | Public |
| `/usa/[stateSlug]` | State hub | Public |
| `/cities/[citySlug]` | City hub | Public |
| `/cuisines/[cuisineSlug]` | Cuisine hub | Public |
| `/stars/[starCount]` | 1 / 2 / 3 star directories | Public |
| `/about-michelin-stars` | Independent star education | Public |
| `/passport` | Personal dining passport | Public preview → later auth |
| `/saved` | Saved restaurants | Later auth (preview OK) |
| `/visited` | Visited restaurants | Later auth (preview OK) |
| `/collections` | User collections | Later auth (preview OK) |
| `/account` | Account settings | Auth |
| `/admin` | Roster / enrichment admin | Admin |

Temporary product name in repo: `michelin-dining-passport`. Brand name can change without changing route structure.

---

## Functional requirements

### Discovery

- Search by restaurant name, city, state, cuisine.
- Filter by stars, state, city, cuisine, price.
- Sort by name, stars, state, (later) distance.
- No forced signup wall for browsing.

### Restaurant entity (minimum display fields)

From workbook: name, stars, cuisine, price, city, state, address, Guide URL (external), website (when present).

Derived: slug, state slug, city slug, cuisine slug.

Later: images, coordinates, hours, phone, original editorial blurb.

### Personal tracking (later)

- Save / unsave
- Mark visited + optional visit date + notes
- Collections (named lists)
- Passport summary: visited count, star-points, state coverage, cuisine coverage

### Admin (later)

- Import / diff workbook updates
- Edit enrichment fields
- Image approval workflow
- Soft-hide closed restaurants

---

## Content & legal constraints

- Independent product; disclose non-affiliation.
- Link out to Michelin Guide pages; do not republish Guide copy or images.
- Do not use Michelin logos or brand marks.
- Prefer licensed/original photography or neutral placeholders until assets exist.
- Coverage messaging must note Michelin’s incomplete U.S. inspection footprint.

---

## Success metrics (post-launch)

| Metric | Intent |
| --- | --- |
| Explore → detail click-through | Directory usefulness |
| Search success rate | Findability |
| Passport preview → account conversion (later) | Personal layer value |
| Returning visitors with visits logged | Habit formation |
| Time-to-shortlist (< 2 min for a city) | Travel planner job |

---

## Open product decisions

1. Final public brand name.
2. Whether anonymous localStorage saves ship before auth.
3. Star “points” formula for passport gamification (simple count vs weighted).
4. Whether Brooklyn stays a separate city hub or rolls into New York City.
5. Image sourcing strategy (user upload vs licensed stock vs restaurant-provided).

---

## Phase 0 acceptance

Phase 0 is complete when:

1. Dataset audit documents 271 restaurants and star breakdown.
2. Architecture, design system, and implementation plan exist.
3. Three homepage directions are documented with a clear recommendation.
4. No Supabase, Maps, or auth has been connected.
5. No full application UI beyond scaffolding has been built.
