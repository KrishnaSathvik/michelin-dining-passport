# Mockup approval — UI/UX rebuild direction

**Date:** 2026-07-17  
**Branch:** `design/ui-ux-rebuild-spec`  
**Status:** **Approved** — layouts are the implementation direction. No further mockup rounds.

## Approved surfaces

| Surface | File | Verdict |
| --- | --- | --- |
| Homepage desktop | `mockups/mockup-homepage-desktop.png` | Approved |
| Homepage mobile | `mockups/mockup-homepage-mobile.png` | Approved (with production content corrections) |
| Explore desktop | `mockups/mockup-explore-desktop.png` | Approved |
| Explore mobile | `mockups/mockup-explore-mobile.png` | Approved |
| Map desktop | `mockups/mockup-map-desktop.png` | Approved |
| Map mobile | `mockups/mockup-map-mobile.png` | Approved (strongest screen) |

## What is approved

- Layouts, hierarchy, and interaction models for Homepage, Explore, and Map
- Pure-white visual system with deep green primary actions
- Image-led discovery
- Restaurant card system (media, stars, name, cuisine, location, Save, single reservation CTA)
- Explore: large search, horizontal quick filters, All filters drawer/sheet — **no default left sidebar**
- Map: full-viewport workspace, **420px list left / map right**, no footer; mobile full-screen map + bottom sheet

Mockups remain **directional**. Invented mockup content must not be copied literally into production.

## Production corrections (locked)

### Branding

Do **not** ship:

- Michelin’s logo
- Michelin’s flower mark
- A confusingly similar flower symbol
- “MICHELIN” as this product’s official wordmark

Keep the temporary independent text brand configurable via `siteConfig`. Use an original icon or no icon until final branding / trademark review.

Acceptable temporary text: **Dining Passport** or plain **Michelin Dining Passport** (text only).

### Data / counts

Use live dataset values only (do not copy mockup marketing numbers):

- **271** restaurants
- **216** one-star
- **39** two-star
- **16** three-star
- **14** states/districts
- **68** cities
- **35** cuisine labels

Prefer reading counts from application data helpers at runtime rather than hardcoding.

### Star representation

Do **not** implement review-style five-star ratings, numerical scores, or review counts from the mockups.

Use Michelin distinction data only:

- 1 Michelin Star
- 2 Michelin Stars
- 3 Michelin Stars

No “4.0+ stars” filters, recommendation scores, or five-star review graphics without a verified licensed rating provider.

### Restaurant identities

Do not implement invented mockup restaurant names. Use only canonical dataset records.

### Images

Follow [image-strategy.md](./image-strategy.md):

- Generic surfaces → licensed atmospheric / destination / cuisine photography
- Named restaurant → approved restaurant-specific photo **or** premium designed non-photo fallback
- Never unrelated stock on named restaurants
- Do not treat generated mockup images as factual restaurant photography

### Unsupported information

Do not display unsupported:

- Reviews / review counts
- Current availability / party-size availability
- Neighborhood (unless it exists as real data)
- Distance unless computed from approved coordinates + user location
- Real-time recommendation / trending labels

Allowed: name, Michelin stars, cuisine, city/state, price, address, verified reservation action, distance only when truly computed.

### Reservations

Preserve the existing verified reservation resolver and truthful CTA labels:

- Reserve now
- Check availability
- View booking options
- Visit restaurant website

Visual style may follow the mockups; labels must remain truthful. Do not force every button to say “Reserve.”

## Implementation gate

Do **not** open `ui-ux-rebuild` application work until:

1. Final Phase 6 smoke test passes
2. `phase-6-auth-and-accounts` is merged into `main`
3. `main` is clean and pushed

Then create branch **`ui-ux-rebuild`** and implement in controlled batches (foundation → cards → homepage → explore → map → …), stopping after Map for review before detail / Passport / auth / taxonomy.

## Related docs

- [README.md](./README.md)
- [design-principles.md](./design-principles.md)
- [image-strategy.md](./image-strategy.md)
- [homepage-spec.md](./homepage-spec.md)
- [explore-spec.md](./explore-spec.md)
- [map-spec.md](./map-spec.md)
- [mockups/README.md](./mockups/README.md)
