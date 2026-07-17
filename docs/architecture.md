# Architecture — Michelin Dining Passport

## Principles

1. **UI before infrastructure** — prove discovery UX with local data before Supabase/Maps spend.
2. **Canonical restaurant identity** — one slugbed restaurant record; personal data references it by id/slug.
3. **Public read path stays cheap** — starred roster is largely static; personal data is per-user.
4. **No irreversible vendor lock-in in Phase 0** — document intended providers; do not wire them yet.
5. **Legal boundaries as architecture** — Guide URLs are outbound references only; never store scraped Guide prose/images as first-party content.

---

## Current stack (Phase 0)

| Layer | Choice |
| --- | --- |
| Framework | Next.js App Router (`src/`), TypeScript |
| Styling | Tailwind CSS v4 |
| Lint | ESLint (Next config) |
| Data (now) | `/data/*.xlsx` → future `/data/*.json` import |
| Auth / DB / Maps | **Not connected** |

Import alias: `@/*` → `./src/*`

---

## Proposed target stack (later phases)

| Layer | Proposed choice | Deferred until |
| --- | --- | --- |
| Hosting | Vercel | First deploy |
| Database | Supabase Postgres | Personal layer / admin |
| Auth | Supabase Auth | `/account`, persistence |
| Storage | Supabase Storage | Approved images |
| Maps | MapLibre (Phase 5 complete) | `/map` + geocodes |
| Geocoding | Batch offline job → store lat/lng | Phase 5 |
| Reservations | Verified outbound URLs only (no partner booking APIs) | Phase 5.5 |
| Search | Client filter (271 rows) → optional Typesense/Meilisearch later | Only if scale demands |

**Decision note:** At 271 restaurants, full-text search and filters can remain in-memory on the client or via a thin server loader. Do not add a search SaaS in Phase 1.

---

## Application routes

```text
/                               Homepage
/explore                        Directory + filters
/map                            Map + list workspace
/restaurants/[slug]             Restaurant detail
/usa/[stateSlug]                State hub
/cities/[citySlug]              City hub
/cuisines/[cuisineSlug]         Cuisine hub
/stars/[starCount]              Star tier hub (1|2|3)
/about-michelin-stars           Star education
/passport                       Personal passport
/saved                          Saved list
/visited                        Visited list
/collections                    Collections index (+ /collections/[id] later)
/account                        Account settings
/admin                          Internal roster tools
```

Route groups (suggested, not created yet):

```text
src/app/
  (marketing)/          # /, about, maybe passport preview
  (discover)/           # explore, map, taxonomy pages, restaurants
  (passport)/           # passport, saved, visited, collections
  (account)/            # account
  (admin)/              # admin
```

---

## Data flow (Phase 1 — no backend)

```text
xlsx (workbook)
  → scripts/import-restaurants.ts (later)
  → data/restaurants.json (+ taxonomies)
  → src/lib/data/restaurants.ts
  → Server Components / client filter hooks
  → UI
```

Phase 0 may read the xlsx only in audit scripts; the app can keep the default Next scaffold until homepage implementation.

### Reservation enrichment (Phase 5.5)

```text
official website
  → scripts/discover_reservations.py (local only)
  → data/reservation-candidates.json
  → manual review / auto-approve high confidence
  → data/reservations.json + data/reservation-overrides.json
  → src/lib/reservations/* → ReservationButton (outbound only)
```

Runtime never reads candidate JSON. Booking availability APIs are out of scope until authorized partner access exists.

---

## Recommended database model (future Supabase)

### `restaurants`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `slug` | text unique | `restaurant-city-state` |
| `name` | text | |
| `stars` | smallint | 1–3 check |
| `cuisine` | text | raw label |
| `cuisine_slug` | text | |
| `price` | text | `$$`–`$$$$` |
| `city` | text | |
| `city_slug` | text | |
| `state` | text | |
| `state_code` | char(2) | |
| `state_slug` | text | |
| `address` | text | |
| `michelin_guide_url` | text | external |
| `website_url` | text null | |
| ` lat` / `lng` | float null | enrichment |
| `place_id` | text null | enrichment |
| `hero_image_url` | text null | owned/licensed only |
| `neighborhood` | text null | |
| `phone` | text null | |
| `reservation_url` | text null | |
| `editorial_blurb` | text null | original copy |
| `is_published` | bool | admin |
| `source_updated_at` | timestamptz | workbook snapshot |
| `created_at` / `updated_at` | timestamptz | |

Indexes: `(state_slug)`, `(city_slug)`, `(cuisine_slug)`, `(stars)`, `(slug)`.

### `profiles`

| Column | Type |
| --- | --- |
| `id` | uuid pk (= auth.users.id) |
| `display_name` | text |
| `avatar_url` | text null |
| `created_at` | timestamptz |

### `saved_restaurants`

| Column | Type |
| --- | --- |
| `user_id` | uuid fk |
| `restaurant_id` | uuid fk |
| `created_at` | timestamptz |
| PK | `(user_id, restaurant_id)` |

### `visited_restaurants`

| Column | Type |
| --- | --- |
| `user_id` | uuid fk |
| `restaurant_id` | uuid fk |
| `visited_on` | date null |
| `notes` | text null |
| `created_at` | timestamptz |
| PK | `(user_id, restaurant_id)` |

### `collections` / `collection_items`

Standard list + join tables for named collections.

### `admin_audit_log` (optional)

Track roster edits and import diffs.

**RLS sketch:** public read on published restaurants; personal tables restricted to `auth.uid()`.

---

## Restaurant presentation system

Reusable UI contracts (implement in Phase 1+):

| Variant | Use | Contents |
| --- | --- | --- |
| **Discovery card** | Explore grids, taxonomy pages | Image/placeholder, name, stars, cuisine, city/state, price; whole card clickable |
| **Editorial feature card** | Homepage features, state heroes | Large photo plane, serif name, short dek, star mark, CTA |
| **Compact map-result card** | Map list pane | Name, stars, cuisine, distance/neighborhood; dense |
| **Restaurant list row** | Dense directories, saved/visited | Name · stars · city · cuisine · price; optional quick actions |
| **Map marker preview** | Map popup / hover | Name, stars, cuisine, “View” link |

Shared primitives: `StarMark`, `PriceMark`, `CuisineLabel`, `LocationLine`, `ExternalGuideLink`.

Cards are used **only** when the unit is individually interactive. Prefer bordered surfaces over heavy shadows.

---

## Slug rules

- ASCII fold / strip diacritics (`Mélisse` → `melisse`)
- kebab-case
- Restaurant: `{name}-{city-slug}-{state-code}` when needed for uniqueness
- State: `washington-dc`, `new-york`, `california`, …
- City: `{city}-{state-code}` when city names collide nationally
- Cuisine: kebab of label (`american-contemporary`)
- Stars: `/stars/1`, `/stars/2`, `/stars/3`

---

## Image policy

1. Phase 1 homepage: **neutral placeholders** (gradient/texture/typography treatments) — not fake restaurant photos.
2. Later: licensed, restaurant-provided, or original photography only.
3. Never hotlink or redistribute Michelin Guide imagery.

---

## Security / privacy (forward-looking)

- No secrets in client bundles.
- External Guide links use `rel="noopener noreferrer"`.
- Personal notes are private by default.
- Admin routes require role claim.

---

## Irreversible choices — deferred

Do **not** lock without a short ADR:

- Google Maps vs MapLibre/Mapbox
- Whether anonymous localStorage passport syncs into accounts
- Monorepo vs single app (stay single app)
- CMS vs admin UI for editorial blurbs

---

## Phase 0 status

- Next.js scaffolding present
- Workbook present at `/data/...xlsx`
- Docs define routes, model, and presentation system
- **No** Supabase project, env vars, or Maps SDK installed
