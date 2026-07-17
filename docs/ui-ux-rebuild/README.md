# UI/UX rebuild — design specification

**Branch:** `design/ui-ux-rebuild-spec`  
**Status:** Spec corrections applied — pending mockup approval before `ui-ux-rebuild` code.  
**Date:** 2026-07-17

## Purpose

The current cream/beige editorial UI is rejected as not launchable. This folder locks the replacement visual system and the first three product surfaces before any `ui-ux-rebuild` implementation branch is opened.

## Gate order

1. **Phase 6 → `main`** after final smoke test (`phase-6-auth-and-accounts`).  
   As of 2026-07-17, Phase 6 is **not** yet an ancestor of `main`. Do not start implementation until that merge lands and feature work is frozen.
2. **Approve this specification** and the six visual mockups.
3. Open implementation branch **`ui-ux-rebuild`** — preserve all functionality; replace presentation only.

## Scope of this batch

| In scope (design) | Out of scope until later |
| --- | --- |
| Homepage | Passport rebuild |
| Explore | Auth / account |
| Map | Restaurant detail |
| Global tokens, type, cards, responsive rules, imagery strategy | Admin, data pipelines, new features |

## Documents

| File | Contents |
| --- | --- |
| [design-principles.md](./design-principles.md) | Product feel, color, type, what to reject |
| [image-strategy.md](./image-strategy.md) | Photography rules, legal bounds, fallbacks |
| [responsive-rules.md](./responsive-rules.md) | Breakpoints, grids, mobile shells |
| [component-system.md](./component-system.md) | Shared components for the three screens |
| [homepage-spec.md](./homepage-spec.md) | Homepage desktop 1440 / mobile 390 |
| [explore-spec.md](./explore-spec.md) | Explore desktop 1440 / mobile 390 |
| [map-spec.md](./map-spec.md) | Map workspace desktop / mobile |
| [current/](./current/) | Rejected baseline screenshots |

## Rejected baseline (`current/`)

Screenshots from the cream paper UI (evidence of what must never ship):

- `rejected-homepage.png`
- `rejected-explore-a.png` / `rejected-explore-b.png`
- `rejected-map.png` — tiny embedded map, unused margins, footer chrome (primary map rejection evidence)
- `rejected-restaurant-detail.png` (context only — detail not redesigned in this batch)
- `rejected-passport.png` (context only)
- `rejected-login.png` (context only)
- `rejected-about-michelin-stars.png` (context only)

## Locked decisions (2026-07-17 corrections)

1. **Pure white** page background (`#FFFFFF`); soft `#F5F6F4` only for selected sections.
2. **Named restaurants:** verified image or designed non-photo fallback — never unrelated stock.
3. **Explore desktop:** sticky search + horizontal quick filters + right **All filters** drawer — no permanent left sidebar by default.
4. **Map desktop:** **420px list left**, map fills remaining **right**, `100dvh − header`, no footer.

## Next after approval

1. Produce six high-fidelity mockups (home/explore/map × desktop/mobile).
2. Only then implement on `ui-ux-rebuild` (after Phase 6 → main as well).

## Non-negotiable for implementers

- Do not change discovery data, filters, reservation resolution, Passport logic, auth, or Supabase behavior.
- Do not scrape or republish Michelin Guide imagery.
- Do not ship cream/beige/warm near-white paper systems again.
- Do not put atmospheric stock photos on named restaurant cards.
- Do not default Explore to a permanent filter sidebar.
- Do not ship map-left/list-right or a capped embed map.
