# Map specification

**Routes:** `/map`  
**Canvases:** Desktop 1440 · Mobile 390  
**Baseline (rejected):** `current/rejected-map.png`

## Goal

The map is a **full product workspace**, not a demo embed. Immersive, synchronized list ↔ markers, floating controls, no footer, no empty page chrome.

## Content hierarchy

1. Site header only (compact)  
2. Map workspace fills **all remaining viewport**  
3. Floating controls  
4. Results list (desktop panel / mobile sheet)  
5. Selected restaurant preview  
6. **No site footer**

## Functionality to preserve

| Item | Detail |
| --- | --- |
| Map engine | MapLibre (or current stack) |
| Filters | State, stars, cuisine, text search |
| Saved only / Visited only | Passport-driven filters |
| Fit / Reset | Existing camera behaviors |
| List ↔ marker sync | Select either side updates the other |
| Mobile map/list toggle | Preserve capability; restyle |
| Bottom sheet | Selected restaurant; expand/collapse; prev/next |
| Reserve | Same reservation resolve + external open |
| Open restaurant page | Link to detail |
| Geocoded markers | All restaurants with coordinates |
| PassportClientShell | Keep data wiring; restyle chrome |

## Elements to remove / replace

| Remove | Replace with |
| --- | --- |
| Page title/dek inside tall container above a small map | Optional minimal title in floating chrome or omit |
| `h-[min(70vh,40rem)]` capped map | `100dvh - header` workspace |
| `22rem` (~352px) list column on the right | **420px** result panel on the **left** |
| Map-left / list-right orientation | **List left / map right** — locked |
| Site footer on map route | Hidden for `/map` |
| Standard page container / large empty margins | Edge-to-edge workspace under header |
| Desktop-compressed mobile sidebar | Full-screen map + sheet |

---

## Desktop 1440 (locked)

### Layout

```text
┌──────────────────────────────────────────────────────────────┐
│ Header (~72px)                                               │
├────────────────────┬─────────────────────────────────────────┤
│ Result panel       │                                         │
│ 420px LEFT         │     MAP fills remaining RIGHT           │
│                    │                                         │
│ Search             │     Floating: Filters · Fit · …         │
│ Filters summary    │                                         │
│ List (scroll)      │     Markers / clusters                  │
│                    │                                         │
│ Selected preview   │                                         │
│ (in panel)         │                                         │
└────────────────────┴─────────────────────────────────────────┘
         ↑ 100dvh − header — NO FOOTER — NO PAGE CONTAINER
```

| Spec | Value | Negotiable? |
| --- | --- | --- |
| Workspace height | `100dvh - headerHeight` | **No** |
| Result panel width | **420px** | **No** |
| Result panel side | **Left** | **No** |
| Map | Fills **all remaining width on the right** | **No** |
| Site footer | **None** | **No** |
| Standard content container | **None** on workspace | **No** |
| Panel background | `#FFFFFF` | — |
| Panel border | Optional 1px `#E5E7E4` toward map | — |

Do **not** keep map-left/list-right for migration convenience. The redesign orientation is locked: **list 420px left, map right**.

### Floating controls (over map)

- White pills/panels; `--shadow-float`
- Search-this-area / Fit / filter entry as needed
- List panel owns full filters; map gets Fit + optional “Search area”

### Result list rows

```text
★★★  Name
Cuisine · City
[Reserve]
```

- Selected row: soft green tint or left ink bar
- Hover: light `#F5F6F4`
- Click selects marker + updates preview

### Selected preview (desktop)

- Sticky bottom of **left** list panel (preferred — less map occlusion)
- Thumb: approved restaurant image **or** designed fallback (never unrelated stock)
- Name, stars, cuisine, location
- Reserve + Open restaurant + Save

### Markers & clusters

| Element | Spec |
| --- | --- |
| Default marker | `#123B2F` filled; white glyph optional |
| Selected | Scale up; ring `#B88A2A` or white halo |
| Cluster | `#121212` charcoal disc; white count; radius by magnitude |
| Z-index | Selected above clusters |

### Desktop interactions

- Pan/zoom map updates visible set if “search area” mode exists (preserve current behavior)
- Selecting marker scrolls list to row
- Prev/next optional on desktop if already present

---

## Mobile 390 (locked)

### Layout

```text
┌─────────────────────────┐
│ Header                  │
├─────────────────────────┤
│ Floating search         │
│ Floating Filters · List │
│                         │
│      FULL-SCREEN MAP    │
│                         │
│                         │
├─────────────────────────┤
│ Bottom sheet (peek)     │
│ selected / results      │
└─────────────────────────┘
```

| Spec | Value |
| --- | --- |
| Map | Full width × `100dvh - header` |
| Floating search | Top; 16px inset; 44–48px tall |
| Filters | Button → sheet |
| Map / List toggle | Floating; list mode shows scrollable full results |
| Bottom sheet | Peek 120–160px; half; ~85vh expanded |
| Sheet content | Selected restaurant preview with image/fallback, Reserve, Open, Save; swipe prev/next preserved |
| Footer | None |

### Mobile interactions

- Tap marker → sheet peeks with that restaurant
- Swipe sheet up → more detail / list context
- Prev/Next in sheet cycles selection
- List mode: full-screen list with back-to-map control

---

## Typography & chrome

| Element | Size |
| --- | --- |
| List restaurant name | 16–18px semibold/serif |
| Meta | 14px muted |
| Floating control labels | 14–15px |
| Sheet title | 20–22px |

## Empty / loading

- Loading: map gray/skeleton + list skeletons
- No results for filters: panel message + Clear filters; map shows empty bounds gracefully
- No geocode: exclude from map (preserve current); do not show broken pins

## Accessibility

- List selection reflected in `aria-selected`
- Marker focus equivalents via list
- Sheet focus trap when expanded
- Do not rely on color alone for selected state (ring + list highlight)

## Acceptance criteria

- [ ] Map workspace height is `100dvh - header`, not ~40rem cap
- [ ] Desktop result panel is **420px on the left**
- [ ] Map fills all remaining space on the **right**
- [ ] No site footer on `/map`
- [ ] No standard page container around the workspace
- [ ] Floating controls; synchronized list and markers
- [ ] Mobile: full-screen map, floating search/filters, expandable sheet, map/list toggle
- [ ] No permanent desktop-style sidebar on mobile
- [ ] Reserve / passport filters / fit/reset behaviors preserved
- [ ] Marker and cluster styles match `#123B2F` / `#B88A2A` system
- [ ] Named restaurant previews never use unrelated stock photography
