# Testing and Visual QA

## Quality gates (every route PR)

Required before merge:

1. `npm run typecheck`
2. `npm run lint`
3. `npm test` (unit/node scripts)
4. Route-relevant Playwright: `npm run test:e2e` (or filtered project specs)
5. `npm run build`
6. Desktop screenshot **1440px**
7. Intermediate screenshot **1024px or 768px**
8. Mobile screenshot **390px**
9. Side-by-side comparison against Stitch reference PNG/HTML
10. Accessibility check (axe or equivalent + manual)
11. Keyboard navigation check
12. No horizontal overflow at reference widths
13. Existing feature regression check for that route’s capabilities

## Visual-review checklist

Compare implementation to the Stitch reference — **“similar direction” is not sufficient**.

- [ ] Overall silhouette matches reference
- [ ] Header height ≈ 72px
- [ ] Content width ≈ 1280px (or full-bleed hero where designed)
- [ ] Section order matches design
- [ ] Section spacing ≈ 80px rhythm / 8px grid
- [ ] Typography (Literata/Inter scale) matches
- [ ] Image proportions (4:3 cards unless design specifies otherwise)
- [ ] Card dimensions and internal structure
- [ ] Button height ≈ 48px; primary green correct
- [ ] Alignment of columns and baselines
- [ ] Whitespace feels editorial, not cramped utility UI
- [ ] Sticky/fixed elements behave as designed
- [ ] Responsive transformation is intentional (see responsive-plan)
- [ ] Empty/loading states match `dining_passport_system_states` where applicable
- [ ] Modal/drawer placement and width
- [ ] Color accuracy (primary, gold for Michelin only, soft surfaces)
- [ ] Unsupported mockup content removed
- [ ] Independence disclaimer present on footer pages
- [ ] No Michelin official logo/flower
- [ ] No Google content outside UI Kit
- [ ] Reservation labels truthful

## Screenshot baseline convention

```text
docs/stitch-redesign/baselines/
  <route>/
    stitch-reference.png          # copy or symlink note to docs/designs/...
    impl-1440.png
    impl-768.png
    impl-390.png
    notes.md                      # deltas vs design + accepted exceptions
```

## Automated tests to maintain

| Suite | Path | When to update |
|---|---|---|
| Explore data | `scripts/test_explore.mjs` | If URL/query contracts change (avoid) |
| Passport metrics/merge | `scripts/test_passport_*.mjs` | If metrics definitions change |
| Reservations | `scripts/test_reservations.mjs` | Labels/resolver only if intentional |
| Geocodes/map flags | `scripts/test_geocodes.mjs` | Map filter flags |
| Auth redirect | `scripts/test_auth_redirect.mjs` | Redirect allowlist |
| Google places | `scripts/test_google_places*.mjs` | Config/boundaries |
| E2E auth | `e2e/auth.spec.ts` | Auth UI selectors |
| E2E map | `e2e/map.spec.ts` | Workspace selectors |
| E2E reservations | `e2e/reservations.spec.ts` | CTA selectors |
| E2E google | `e2e/google-places.spec.ts` | Section frames |

Prefer accessible selectors (`getByRole`, labels) tied to Stitch copy.

## Accessibility minimums

- Focus visible on all controls
- Skip link to main content
- Dialogs trap focus and restore on close
- Drawers labeled (`aria-modal`, title)
- Star ratings text alternatives (“3 Michelin stars”)
- Map controls keyboard reachable
- Color contrast for text on `#fcf9f8` / primary buttons
- Do not rely on color alone for Saved/Visited

## Feature regression checklist (per surface)

| Surface | Must still work |
|---|---|
| Home | Featured links; totals accurate |
| Explore | Filters, sort, grid/list, pagination, empty |
| Map | Sync, search area, fit/reset, saved/visited filters, Google compact on select |
| Detail | Reserve truthfulness; journey flags; plan/visit dialogs; Google full; related/nearby |
| Passport | Local + cloud paths; empty vs active |
| Lists | Saved/visited(/planned) filtering |
| Collections | CRUD |
| Auth | Login/signup/magic/forgot/reset/callback |
| Account | Session, deletion confirm |
| Taxonomy | Real aggregations |

## Review process

1. Engineer posts screenshots + checklist  
2. Reviewer opens Stitch `screen.png` beside impl  
3. Any structural mismatch fails review (not “fix in follow-up” unless listed in accepted exceptions in `notes.md`)  
4. Open decisions exceptions must cite `open-decisions.md` ID
