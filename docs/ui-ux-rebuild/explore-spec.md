# Explore specification

**Routes:** `/explore` (+ query params)  
**Canvases:** Desktop 1440 · Mobile 390  
**Baseline (rejected):** `current/rejected-explore-a.png`, `current/rejected-explore-b.png`

## Goal

Feel **modern and shoppable/discoverable** — large photo cards, clear hierarchy, one primary reservation CTA, sticky search + horizontal filters. Not an old e-commerce sidebar marketplace.

## Content hierarchy

1. Header  
2. Page title + result count  
3. Large sticky search  
4. Horizontal quick filters + **All filters**  
5. Active filter chips  
6. Sort · Grid/List  
7. Full-width result grid or list  
8. Pagination  
9. Footer (allowed on explore)

## Functionality to preserve

| Item | Detail |
| --- | --- |
| Filters | `q`, `stars`, `state`, `city`, `cuisine`, `price` via GET |
| Sort | Existing sort param / `ExploreSortSelect` |
| View | Grid / list URL toggle |
| Pagination | Existing page semantics |
| Reservation | `ReservationButton` labels and external links |
| Guide / website | Available on **restaurant detail**, not required on cards |
| Clear filters | Reset to `/explore` |
| Mobile filters | Bottom sheet — no permanent sidebar |

## Elements to remove / replace

| Remove | Replace with |
| --- | --- |
| Permanent left filter sidebar (16rem or 280px) as default | Sticky search + horizontal quick filters + right **All filters** drawer |
| 3-col grid at tablet/phone widths | 1 col phone / 2 tablet / 3–4 desktop |
| Guide + Website on every card | Reserve + Save only |
| Loud placeholders / fake stock on named cards | Approved image or premium designed fallback |
| Tiny metadata and competing links | Larger type; single CTA |
| Non-sticky awkward filter UX on mobile | Sticky search + filter bottom sheet |

---

## Desktop 1440 (locked default)

### Page frame

```text
┌────────────────────────────────────────────────────────────┐
│ Header (72px)                                              │
├────────────────────────────────────────────────────────────┤
│ Title · “N restaurants”                                    │
│ Large sticky search                                        │
│ Quick filters: Stars · State · Cuisine · Price · All filters│
│ Active filter chips                                        │
│ Sort · Grid | List                                         │
│                                                            │
│ Full-width card grid: 3–4 cols (gap 24–28px)               │
│                                                            │
│ Pagination                                                 │
└────────────────────────────────────────────────────────────┘
│ Footer                                                     │
```

| Region | Dimension |
| --- | --- |
| Search | Full content width; height 52–56px; sticky under header |
| Quick filters | Horizontal row; wrap allowed; min control height 40px |
| Results | Full width (no permanent filter rail); gap 24–28px |
| Card min width | ~280px |
| Columns at 1440 | **4** preferred when cards stay premium; otherwise **3** |
| Content horizontal pad | 32–40px |
| Max content | ~1280–1440px (use the width — do not leave a dead sidebar column) |

### Quick filters (desktop)

- Inline controls for the most common facets: **Stars · State · Cuisine · Price**
- **All filters** opens a **right-side drawer** with the complete set (including city and any advanced fields)
- Drawer: white surface, ~360–400px wide, Apply + Clear sticky at bottom
- Active selections appear as **removable chips** under the quick-filter row

### Optional expanded filter rail

- A persistent left filter rail is **not** the default.
- It may appear only as an **optional expanded mode** on large widths (`≥1440px`) if the user explicitly opens “Pin filters” / similar — never the first paint default.

### Toolbar

- Sort control ≥40px height
- Grid/List toggle ≥40px hit targets
- Sit on the same band as or directly under active chips

### Grid cards

Use **RestaurantDiscoveryCard** per [component-system.md](./component-system.md):

- Image 4:3 dominant (approved photo or designed fallback — never unrelated stock)
- Save overlay
- Stars, name, cuisine, location (+ price)
- One Reserve CTA
- Entire card (except Reserve/Save) clickable to detail

### List view

- Rows: optional 72–88px thumb | name + meta | Reserve | Save
- Generous row padding 16–20px; hairline dividers only
- No multi-link spaghetti

### Pagination

- Centered or end-aligned under grid
- 40–44px page buttons; clear current page (primary green or ink weight)

---

## Mobile 390

```text
┌─────────────────────────┐
│ Header                  │
│ Sticky: Search + Filters│
│ Title + count           │
│ Active chips (scroll)   │
│ Sort · View             │
│                         │
│ [ Card 1 full width ]   │
│ [ Card 2 ]              │
│ …                       │
│ Pagination              │
│ Footer                  │
└─────────────────────────┘
```

### Sticky mobile chrome

- Full-width search field (min 44px)
- **Filters** button opens **bottom sheet** with all fields + Apply / Clear
- No permanent left sidebar at any width `<1024px`

### Grid

- **Exactly one column**
- Card image large (min height ~200px)
- Reserve full-width or prominent block button
- Save 44×44 overlay on image

### Filter sheet

- Snap to ~85vh max
- Fields stacked; 16px gaps
- Sticky Apply bar at bottom of sheet

---

## Tablet 768–1023

- Two-column grid maximum
- Filters via bottom sheet / drawer (no permanent sidebar)
- Sticky search + compact quick filters where space allows

---

## Interactions

| Action | Behavior |
| --- | --- |
| Quick filter change | Updates URL params; may auto-apply or require Apply — preserve truthful GET semantics |
| All filters drawer | Opens right; Apply commits; Clear resets |
| Chip dismiss | Removes that facet from URL |
| Clear all | `/explore` |
| Sort / view | URL updates; results refresh |
| Save | Passport toggle; respect auth |
| Reserve | External; unchanged resolve rules |
| Card body | Push `/restaurants/{slug}` |

## Empty state

- Message: no restaurants match
- CTA: Clear filters
- Optional suggestion chips (3★, California, …)

## Loading state

- Count shows “Loading…” or skeleton
- 6–8 skeleton cards at current column count

## Acceptance criteria

- [ ] Default desktop has **no** permanent left filter sidebar
- [ ] Sticky search + horizontal quick filters + All filters right drawer
- [ ] Active filter chips visible when filters applied
- [ ] Phone: 1 column; tablet: ≤2; wide desktop: up to 4 premium cards
- [ ] Filters are bottom sheet below `lg`
- [ ] Cards show image/fallback, stars, name, cuisine, location, Reserve, Save
- [ ] No Guide/Website on cards
- [ ] No unrelated stock photos on named restaurant cards
- [ ] All filter/sort/view/pagination params still work
- [ ] White page background — no cream/beige wash
