# Open Decisions — Resolved

**Status:** All OD-01 through OD-18 are **resolved**. Do not reopen unless a genuine implementation conflict is found.

---

## Approval record

| Field | Value |
|---|---|
| **Approval date** | 2026-07-17 |
| **Package** | `docs/stitch-redesign/` |
| **Approved source-of-truth rules** | Stitch designs (`docs/designs/`) control entire visual composition. The existing application supplies features, data, persistence, and business logic only. Prior `docs/ui-ux-rebuild/` is historical and must not influence new layouts. |
| **Branch strategy** | Create `stitch-full-redesign` from the branch that contains the complete functional application (including Google Places UI Kit and all 271 reviewed Place IDs) — not blindly from `main` if `main` lags. Route-by-route presentation replacement; preserve domain logic. |
| **Implementation gate** | Phases 1–12 complete on `stitch-full-redesign`. See `final-audit.md` / `release-readiness.md`. |

### Decision list (approved)

| ID | Choice | Summary |
|---|---|---|
| OD-01 | **A** | `docs/designs/` remains canonical; do not move/duplicate |
| OD-02 | **A** | UI wordmark **Dining Passport** (not Michelin Dining Passport) |
| OD-03 | **A** | Literata only for display; Inter for UI; remove Instrument Serif |
| OD-04 | **A** | `dining_passport_map_workspace` canonical (420px panel, MapLibre, compact Google on selection) |
| OD-05 | **A** | `restaurant_profile_benu` split detail; no full-bleed alternate |
| OD-06 | **A** | `personal_passport` active Passport; no alternate brand / bottom nav |
| OD-07 | **A** | Add real `/planned` route beside `/saved` and `/visited` |
| OD-08 | **A** | Strict Stitch `explore_feed` homepage; remove old home modules |
| OD-09 | **D** | To Visit = unique union of wantToVisit ∪ planned, excluding visited |
| OD-10 | **A** | Account shows only real supported settings |
| OD-11 | **A** | Omit public collections and sharing (no placeholders) |
| OD-12 | **A** | No app-wide mobile bottom navigation |
| OD-13 | **A** | `#B88A2A` only for Michelin marks + selected map ring |
| OD-14 | **A** | Cuisine hubs: real U.S. cities only if ≥2; else omit section |
| OD-15 | **C** | Title `Visited`; optional subtitle `Your dining history` |
| OD-16 | **A** | Derive 404/error from Stitch EmptyState system |
| OD-17 | **A** | Related cards + Nearby quieter list beneath |
| OD-18 | **A** | `docs/ui-ux-rebuild/` historical only |

---

## Locked “To Visit” formula (OD-09)

```ts
toVisitCount = uniqueRestaurantIds(
  restaurants where
    (wantToVisit === true || planned === true)
    && visited !== true
).length;
```

A restaurant marked both Want to Visit and Planned counts once.

Supporting UI copy:

```text
To Visit
18
Want to visit or currently planned
```

---

## Resolved decision detail

### OD-01 — Design folder path

**Resolved: A.** Use `docs/designs/` as the canonical Stitch design location. Do not move or duplicate the design files.

### OD-02 — Product display name

**Resolved: A.** Use `Dining Passport` as the visible application wordmark everywhere. Do not use `Michelin Dining Passport` as the UI brand. Preserve the independence disclaimer and Michelin references only where describing restaurant distinctions or source.

### OD-03 — Display font

**Resolved: A.** Literata is the canonical display font. Inter for UI, forms, controls, navigation, metadata, and body. Remove Instrument Serif after no remaining route depends on it. Do not load both display fonts.

### OD-04 — Map canonical design

**Resolved: A.** Use `docs/designs/dining_passport_map_workspace`. Lock: 420px left panel; MapLibre right; full remaining viewport height; no footer; Search this area; Fit and Reset; Saved and Visited filters; compact Google Places UI Kit only for deliberately selected restaurant; mobile bottom-sheet transformation. `map_view` is secondary reference only.

### OD-05 — Restaurant detail

**Resolved: A.** Use `docs/designs/restaurant_profile_benu`: split media/identity hero; circular journey controls; factual details; Google UI Kit section; related cards; nearby list; plan and visit dialogs. Do not use the full-bleed alternate.

### OD-06 — Passport active design

**Resolved: A.** Use `personal_passport`. Overview may inform an optional progress-map visualization only. Do not use its alternate product name, Journal navigation, or mobile bottom navigation.

### OD-07 — Planned route

**Resolved: A.** Add `/planned` beside `/saved` and `/visited`. Reuse existing planned status and persistence. Do not add a new database concept merely for the route.

### OD-08 — Homepage

**Resolved: A.** Strict Stitch `explore_feed` composition. Remove old Browse by State/Cuisine, Map teaser, Michelin explanation preview, and Passport dashboard preview from the homepage. Those capabilities remain on dedicated routes.

### OD-09 — To Visit metric

**Resolved: D** as locked above.

### OD-10 — Account settings depth

**Resolved: A.** Stitch settings layout with only real supported functions. No fake notifications, session management, sync statistics, provider controls, or import/export unless genuinely supported.

### OD-11 — Collections public/share

**Resolved: A.** Omit. No disabled or coming-soon placeholders.

### OD-12 — Mobile bottom nav

**Resolved: A.** Do not implement. Use canonical responsive header/menu.

### OD-13 — Star Gold

**Resolved: A.** `#B88A2A` exclusively for Michelin distinction marks, selected map marker ring, and rare distinction-specific accents. Not for general buttons, cards, filters, or navigation.

### OD-14 — Cuisine hubs

**Resolved: A.** Real U.S. city hubs only when at least two exist for the cuisine; otherwise remove the hubs section. Never show Tokyo, Kyoto, Paris, or other non-U.S. illustrative hubs.

### OD-15 — Visited title

**Resolved: C.** Page title `Visited`; optional subtitle `Your dining history`.

### OD-16 — System error visuals

**Resolved: A.** Derive 404, network error, and missing-result visuals from the Stitch EmptyState system. No additional Stitch generation required.

### OD-17 — Related and Nearby

**Resolved: A.** Preserve both. Related as primary card section; Nearby as quieter list beneath Related.

### OD-18 — Prior rebuild docs

**Resolved: A.** `docs/ui-ux-rebuild/` is historical context only. It must not influence new page layouts, component compositions, typography, or responsive behavior.
