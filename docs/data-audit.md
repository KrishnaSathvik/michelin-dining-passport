# Data audit — USA Michelin-starred restaurants (2026)

**Source file:** `/data/usa_michelin_starred_restaurants_by_state_2026.xlsx`  
**Audit date:** 2026-07-16  
**Scope note in workbook:** Current snapshot through July 2026 · Michelin stars only (Bib Gourmand and Selected restaurants excluded)

---

## Sheets

| Sheet | Purpose |
| --- | --- |
| `Summary` | State-level star totals + coverage notes |
| `All Restaurants` | Canonical restaurant roster (primary source of truth) |
| `State-by-State` | Editorial directory view grouped by state (headers repeated per group) |

### `All Restaurants` layout quirk

- Row 1: title (merged `A1:J1`)
- Row 2: blank
- Row 3: column headers
- Row 4+: restaurant records

Parsers must skip rows 1–2 and treat row 3 as the header.

---

## Columns (`All Restaurants`)

| Column | Type / notes |
| --- | --- |
| `State` | Full state/district name (includes `Washington, D.C.`) |
| `State Code` | 2-letter code (`DC` for D.C.) |
| `City` | City name; D.C. rows use `Washington` |
| `Restaurant` | Display name (unique across the 271 rows) |
| `Stars` | Integer `1`, `2`, or `3` |
| `Cuisine` | Single cuisine label (not multi-tag) |
| `Price` | Michelin-style `$` tiers: `$$`, `$$$`, `$$$$` |
| `Address` | Full street address string |
| `Michelin Guide URL` | Official Guide listing URL (unique per row) |
| `Restaurant Website` | Official site URL; **4 missing** |

---

## Counts

| Metric | Value |
| --- | --- |
| **Total restaurants** | **271** |
| **1-star** | **216** |
| **2-star** | **39** |
| **3-star** | **16** |
| States / districts covered | 14 |
| Unique cities | 68 |
| Unique cuisine labels | 35 |

Summary sheet `TOTAL` row matches: `216 + 39 + 16 = 271`.

### State breakdown

| State / District | Count |
| --- | ---: |
| California | 83 |
| New York | 71 |
| Florida | 26 |
| Washington, D.C. | 22 |
| Illinois | 19 |
| Texas | 18 |
| Colorado | 9 |
| Georgia | 8 |
| South Carolina | 4 |
| Louisiana | 3 |
| Pennsylvania | 3 |
| Tennessee | 3 |
| Massachusetts | 1 |
| North Carolina | 1 |

### Price breakdown

| Price | Count |
| --- | ---: |
| `$$$$` | 236 |
| `$$$` | 28 |
| `$$` | 7 |

### Top cuisine labels

Contemporary (86), Japanese (48), Californian (17), French (15), American (14), Korean (14), Mexican (11), Italian (7), Creative (6), then smaller labels (Indian, Spanish, Barbecue, etc.).

### Top cities (by restaurant count)

New York (62), San Francisco (25), Washington (22), Chicago (19), Los Angeles (15), Miami (9), Denver / Atlanta / Austin (7 each), Brooklyn (6).

---

## Missing or inconsistent values

| Issue | Detail |
| --- | --- |
| Missing websites | 4 rows: Hayato (LA), Shin Sushi (Encino), Sushi Sho (NY), Icca (NY) |
| No lat/lng | Coordinates are absent; required before map features |
| No images | No photography fields in workbook |
| No phone / hours | Not present |
| Cuisine granularity | Single string; labels mix region (`Californian`) and style (`Contemporary`) |
| City naming | Brooklyn listed separately from New York; D.C. city = `Washington` while state = `Washington, D.C.` |
| Coverage gap | Michelin does not inspect every U.S. state; absence ≠ zero stars after review |
| Shared addresses | 7 address pairs share a building (sibling venues / same complex) — not duplicate restaurants |

---

## Possible duplicate records

| Check | Result |
| --- | --- |
| Exact restaurant name duplicates | **None** |
| Exact Michelin Guide URL duplicates | **None** (271 unique URLs) |
| Same name + city duplicates | **None** |
| Shared street addresses | **7 pairs** (legitimate co-located / sibling restaurants) |

### Brand / multi-city variants (not duplicates)

Distinct listings that share a brand stem and should remain separate records:

- `Cote` (NY) vs `Cote Miami`
- `Elcielo Miami` vs `Elcielo Washington DC`
- `Le Jardinier Miami` vs `Le Jardinier Houston`
- `Sushi Nakazawa New York` vs `Sushi Nakazawa Washington DC`

Slug generation should encode city (or state) when names collide after normalization.

### Shared-address pairs (keep both)

1. Mélisse + Citrin — Santa Monica  
2. Kizaki + Margot — Denver  
3. Saga + Crown Shy — New York  
4. bōm + Oiji Mi — New York  
5. Jōji + Le Pavillon — New York  
6. L’Abeille + Muku — New York  
7. Isidore + Nicōsi — San Antonio  

---

## Fields that require enrichment later

| Field | Why |
| --- | --- |
| `slug` | Stable public URL identity |
| `latitude` / `longitude` | Map markers, distance sort, clustering |
| `place_id` (Google / Mapbox) | Geocoding refresh + Places enrichment |
| `hero_image_url` / gallery | Visual discovery (licensed / owned assets only — never Michelin photos) |
| `neighborhood` | Finer browse than city |
| `phone`, `hours` | Practical visit planning |
| `reservation_url` | Booking deep links |
| `chef` / `opened_year` | Editorial detail pages |
| `description` (original copy) | Independent editorial text — do **not** copy Michelin Guide blurbs |
| `last_award_change` | Passport timeline / “newly starred” surfaces |
| `image_status` | Track placeholder vs approved photography |

---

## Import recommendations

1. Treat `All Restaurants` as the only ingestion source for v1.
2. Generate `slug` from `restaurant + city + state_code` (ASCII fold, kebab-case).
3. Normalize D.C. as `state_code = DC`, `state_slug = washington-dc`.
4. Preserve cuisine labels as-is for filters; optionally add a curated cuisine group map later.
5. Store Michelin Guide URLs as external references only; never scrape or republish Guide prose/images.
6. Leave geocoding and image enrichment for a later phase after UI direction is approved.

---

## Verification checklist

- [x] Total restaurants = **271**
- [x] Star breakdown = **216 / 39 / 16**
- [x] Summary sheet TOTAL matches All Restaurants
- [x] No fake restaurant rows generated
- [x] No Supabase / Maps wiring required for this audit
