# Component system

Shared building blocks for Homepage, Explore, and Map. Passport, auth, and restaurant detail components are deferred.

## Design tokens

Implement via CSS variables in `globals.css` (implementation branch only):

```css
--color-bg: #FFFFFF;
--color-surface: #FFFFFF;
--color-surface-soft: #F5F6F4;
--color-ink: #121212;
--color-ink-secondary: #4A4A4A;
--color-ink-muted: #737373;
--color-border: #E5E7E4;
--color-primary: #123B2F;
--color-primary-hover: #0A2B21;
--color-gold: #B88A2A;
--color-burgundy: #7A1F2B;
--font-display: /* Instrument Serif */;
--font-sans: /* Inter */;
--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 12px;
--shadow-float: /* map chrome / sheets only */;
```

Deprecate cream / warm near-white tokens (`#f7f3ec`, `#fafaf7`, `#f6f6f2`, paper-texture as brand identity).

## SiteHeader

| Property | Spec |
| --- | --- |
| Height | 64px mobile / 72px desktop |
| Background | `#FFFFFF` with hairline bottom border `#E5E7E4` or soft shadow |
| Brand | Instrument Serif, ≥20–24px, high contrast |
| Nav | Inter 15–16px; Explore, Map, Stars, Passport, Account |
| Search | Icon or compact field → `/explore` (home also has hero search) |
| Mobile | Brand + icon actions; menu sheet |

**Preserve:** all current nav destinations and auth entry points.  
**Remove:** tiny low-contrast nav treatment.

## SiteFooter

| Property | Spec |
| --- | --- |
| Default | Soft surface `#F5F6F4`; clearer hierarchy; shorter legal stack |
| On `/map` | **Do not render** (map is a workspace) |

**Preserve:** policy links, independence/disclaimer meaning.  
**Remove:** footer duplication bugs on auth (fix in later auth batch); footer inside map viewport.

## Button

| Variant | Look |
| --- | --- |
| Primary | Fill `#123B2F`, text white, hover `#0A2B21`, height 44–48px |
| Secondary | White surface, 1px border `#E5E7E4`, ink text |
| Ghost | Text-only / underline sparingly |
| Destructive | Later (account) |

Min padding 16px horizontal. No pure black primary that clashes with green system.

## SearchField

- Large hero / explore sticky variant: height 52–64px; rounded 10–12px; subtle border; clear icon; submit CTA in primary green
- Compact / floating map variant: height 44–48px; white surface; float shadow

**Preserve:** query → explore/map filter behavior.

## FilterChip / QuickFilter

- Soft surface or white; selected = primary green fill or green outline + weight
- Used under hero search, Explore horizontal quick filters, and map filters
- Min height 36–40px; not micro-pills with 10px type
- Explore: Stars · State · Cuisine · Price as quick filters; **All filters** opens right drawer (desktop) or bottom sheet (mobile)

## ExploreFiltersDrawer

- Desktop: **right-side** drawer ~360–400px; full advanced filter set; Apply + Clear sticky
- Not a permanent left sidebar by default
- Optional “pin filters” rail only as explicit expanded mode at large widths

## RestaurantDiscoveryCard (rebuild)

Primary explore / home secondary card.

```text
┌─────────────────────────────┐
│  [ 4:3 image / fallback ]   │
│                    (Save ♡) │
├─────────────────────────────┤
│  ★★★                        │
│  Restaurant Name            │
│  Cuisine                    │
│  City, State · $$$$         │
│  [ Reserve now ↗ ]          │
└─────────────────────────────┘
```

| Element | Spec |
| --- | --- |
| Media | Approved restaurant photo **or** premium designed non-photo fallback — **never** unrelated stock |
| Stars | Gold star mark `#B88A2A`; clear 1/2/3 distinction |
| Name | Serif or strong sans 20–22px; links to detail |
| Meta | Cuisine; location; price — secondary ink |
| Primary CTA | `ReservationButton` only (verified labels unchanged) |
| Save | Passport save/heart — **new on card** (behavior already exists on detail; surface on card) |
| Guide / Website | **Removed from card**; live on detail / overflow only |

**Preserve:** reservation resolve labels and external `_blank` behavior; restaurant slug routing; analytics surface names if already used.  
**Remove:** Guide listing + Website link row on every card; loud Placeholder branding; fake atmospheric stock on named cards.

## RestaurantEditorialCard (flagship)

Homepage featured hero card: larger media (min height ~360px desktop), serif name, short dek optional, stars, single Reserve + Save.

Media rule: same as named restaurant surfaces — real approved image or designed fallback only.

## DestinationCard / CuisineCard

Visual tiles (image + title + count). Atmospheric / category photography OK (generic surfaces). Not plain text directory links.

## StarMark

Restrained gold `#B88A2A`. Sizes: sm (cards), md (detail later), lg (education later).

## MapMarker / Cluster

| State | Spec |
| --- | --- |
| Default | `#123B2F` pin / dot; readable at zoom |
| Selected | Larger; gold `#B88A2A` or white ring; elevates above peers |
| Cluster | Soft dark disc + white count; expand on click/zoom |
| Saved / visited (optional tint) | Subtle; do not rainbow the map |

## Map floating chrome

Search, Filters, Fit, Saved/Visited toggles as floating white controls with `--shadow-float`. Not a second page header.

Desktop map workspace: **420px list panel left**, map fills remaining **right**.

## BottomSheet (mobile map / filters)

- Grab handle; snap points: collapsed peek (~120–160px), half, expanded (~85vh)
- White surface; 16px padding; 44px controls
- Used for: map selection preview, explore filters, map filters

## Pagination / Load more

Explore: prefer **numbered pagination preserved** if already URL-based; visually modernize (larger hit targets, clearer current page). Optional “Load more” is not required if pagination remains functional — do not invent a second paradigm without need.

## EmptyState

Centered, generous padding, one sentence, one primary CTA (e.g. Clear filters / Explore restaurants). No empty metric grids on these three screens.

## Skeleton

Image block + 3 text lines matching card layout; soft `#F5F6F4` pulse.

## Functionality preservation checklist (shared)

| Capability | Must remain |
| --- | --- |
| Explore filters | `q`, `stars`, `state`, `city`, `cuisine`, `price`, sort, view |
| Reservation actions | Verified provider links; truthful labels; no invented URLs |
| Passport data | Local + cloud sync behavior unchanged |
| Map filters | State, stars, cuisine, search, saved/visited, fit/reset |
| List ↔ marker sync | Selecting list item selects marker and vice versa |
| Auth gates | Existing account requirements unchanged |
| Map orientation | Desktop list **left** 420px / map **right** (locked) |
