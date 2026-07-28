# Stitch Full Visual Rebuild — Implementation Plan

> **Status:** **Phases 1–12 complete** on `stitch-full-redesign` (2026-07-17). Awaiting human merge review.  
> **Branch:** `stitch-full-redesign`  
> **Design source location:** `docs/designs/` (canonical; OD-01).  
> **Final audit:** [final-audit.md](./final-audit.md) · [release-readiness.md](./release-readiness.md) · [final-route-inventory.md](./final-route-inventory.md) · [remaining-debt.md](./remaining-debt.md)

## Purpose

This package is the complete implementation plan for a **full front-end redesign** of Dining Passport. It treats approved Stitch designs as the visual source of truth and the current application as the functional source of truth.

**Approved rule:** Stitch controls the entire visual composition. The existing application only supplies features, data, persistence, and business logic.

This is a **complete presentation rebuild**, not a reskin. Old homepage, Explore, map, detail, Passport, auth, taxonomy, and card structures are marked for **replacement**, not incremental styling.

## Source-of-truth rules (approved)

| Concern | Source of truth |
|---|---|
| Layouts, hierarchy, spacing, typography, composition, cards, drawers, empty/loading states | Stitch designs in `docs/designs/` |
| Design system tokens and editorial rules | `docs/designs/michelin_discovery_system/DESIGN.md` + `dining_passport_component_library` |
| Routes, data, Passport behavior, reservations, auth, Google Places, MapLibre, persistence | Current application under `src/` |
| Product wordmark | **Dining Passport** (OD-02) |
| Prior rebuild docs | `docs/ui-ux-rebuild/` — historical only (OD-18) |

Treat existing UI as disposable presentation code.

## Design folder location

```text
docs/designs/
  michelin_discovery_system/DESIGN.md
  <screen_name>/code.html
  <screen_name>/screen.png
```

**29 screen packages** + **1 design-system document** inspected.

## Non-negotiables

1. Michelin ≠ Google rating.
2. Google content stays inside Places UI Kit (detail + selected map restaurant only).
3. Named restaurant images: first-party or designed fallback only.
4. Truthful reservation labels.
5. Independent **Dining Passport** branding — no Michelin logo/flower; Michelin references only for distinctions/source.
6. No light refresh of current page shells.
7. Star Gold `#B88A2A` only for Michelin marks and selected map ring (OD-13).
8. No paper texture, grain, warm brown cards, or full-page beige blocks.

## Locked product decisions (summary)

Full detail: [open-decisions.md](./open-decisions.md).

- Map: `dining_passport_map_workspace` (420px panel)
- Detail: Benu split hero
- Passport: `personal_passport`; add `/planned`
- Home: strict `explore_feed`
- To Visit: unique wantToVisit ∪ planned, excluding visited
- Account: real settings only; no public collections/share; no bottom nav
- Visited title + “Your dining history” subtitle
- Related + Nearby (Nearby quieter list)

## Document index

| Document | Contents |
|---|---|
| [design-inventory.md](./design-inventory.md) | Every Stitch file inspected |
| [design-token-spec.md](./design-token-spec.md) | Approved `--dp-*` tokens |
| [route-design-map.md](./route-design-map.md) | Route → design → composition |
| [component-architecture.md](./component-architecture.md) | New component system |
| [current-to-new-matrix.md](./current-to-new-matrix.md) | Replacement matrix |
| [data-adaptation.md](./data-adaptation.md) | Mockup → real data |
| [responsive-plan.md](./responsive-plan.md) | Responsive strategy |
| [implementation-phases.md](./implementation-phases.md) | Phased delivery |
| [testing-and-visual-qa.md](./testing-and-visual-qa.md) | Quality gates |
| [deletion-plan.md](./deletion-plan.md) | Obsolete UI removal |
| [open-decisions.md](./open-decisions.md) | **Resolved** OD-01–OD-18 + approval record |
| [aliases.md](./aliases.md) | Compatibility aliases — **closed** Phase 12 |
| [final-route-inventory.md](./final-route-inventory.md) | Final route/state inventory |
| [final-audit.md](./final-audit.md) | Phase 12 audit |
| [release-readiness.md](./release-readiness.md) | Merge checklist (do not auto-merge) |
| [remaining-debt.md](./remaining-debt.md) | Residual non-blocking debt |

## Phase order

0. Design audit *(complete)*  
1. New design foundation *(complete)*  
2. Global application shell *(complete)*  
3. Shared restaurant presentation *(complete)*  
4. Homepage (`explore_feed` only) *(complete)*  
5. Explore *(complete)*  
6. Map (workspace) *(complete)*  
7. Restaurant details (Benu) *(complete)*  
8. Passport + `/saved` `/visited` `/planned` *(complete)*  
9. Collections *(complete)*  
10. Authentication and account *(complete)*  
11. Taxonomy and education *(complete)*  
12. System states and responsive completion *(complete)*  

## Approval gates

| Gate | Status |
|---|---|
| Plan reviewed | **Approved 2026-07-17** |
| OD-01–OD-18 resolved | **Done** |
| Branch `stitch-full-redesign` from functional source | **Done** |
| Phases 1–12 quality gates | **Green on Phase 12** — human merge review pending |

Do not reopen resolved decisions unless a genuine implementation conflict is found.
