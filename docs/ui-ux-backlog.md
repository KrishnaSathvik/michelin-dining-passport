# UI/UX backlog

Nonblocking visual issues deferred until the consolidated `ui-ux-polish` pass after Phases 2–7.

Record issues that do not break functionality, accessibility, or testability.

| Route | Component | Viewport | Problem | Suggested improvement | Priority |
| --- | --- | --- | --- | --- | --- |
| `/` | Homepage sections | Desktop / mobile | Spacing, imagery, and motion not finalized | Full visual audit in polish phase | Low |
| `/explore` | Filter sidebar / drawer | Desktop / mobile | Functional filters; spacing and density not finalized | Polish filter ergonomics in UI pass | Medium |
| `/explore` | Result grid / list | Desktop / mobile | Neutral placeholders and card density temporary | Refine card proportions and imagery later | Low |
| `/map` | Map workspace | Desktop / mobile | Functional MapLibre shell with filters, search-this-area, and mobile sheet; visual density/motion not finalized | Refine overlays, sheet chrome, and marker styling in polish pass | Medium |
| `/map` | Search this area control | Desktop / mobile | Control is functional but visually plain | Elevate control hierarchy and motion without clutter | Low |
| `/map` | Result list | Mobile | List/map toggle works; spacing and sticky header polish deferred | Align with Explore mobile patterns | Medium |
| `/restaurants/[slug]` | Detail layout | Desktop / mobile | Neutral placeholder imagery; spacing temporary | Polish imagery and detail hierarchy later | Medium |
| Shared | `ReservationButton` | Desktop / mobile | Compact vs full density and provider secondary line not finalized | Refine CTA hierarchy in polish pass without weakening truthful labels | Medium |
| `/map` | Result row + sheet reserve actions | Desktop / mobile | Functional; spacing beside select control temporary | Align touch targets and density with Explore cards | Low |
| Taxonomy hubs | Collection grids | Desktop / mobile | Shared shell density not finalized | Align with Explore polish | Low |
| `/login`, `/signup` | Auth forms | Desktop / mobile | Functional dual forms; spacing and hierarchy temporary | Consolidate into a single composed auth surface in polish pass | Medium |
| `/account` | Account panel | Desktop / mobile | Functional sections; bordered blocks feel utilitarian | Soften section rhythm without cards-as-decoration | Medium |
| Shared | Site header Account link | Desktop / mobile | Always visible; no signed-in state treatment yet | Show avatar/initials or Sign in CTA once polish lands | Low |
| Legal pages | Document layouts | Desktop / mobile | Functional launch drafts; typography rhythm temporary | Align legal prose spacing with editorial pages | Low |
| `/corrections` | Correction form | Desktop / mobile | Functional; utilitarian field styling | Soften form hierarchy without card clutter | Medium |

## Next phase recommendation

After Phase 7 merges and launch verification passes, open `ui-ux-polish` and work the backlog top-down (Medium first). Do not mix polish commits into data-maintenance or auth branches.

## Priority guide

- **High** — noticeable inconsistency or weak hierarchy once core flows exist
- **Medium** — polish that improves clarity but does not block use
- **Low** — fine typography, decorative motion, final imagery
