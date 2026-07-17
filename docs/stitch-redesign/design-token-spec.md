# Design Token Specification

Derived from `docs/designs/michelin_discovery_system/DESIGN.md`, `dining_passport_component_library/code.html`, and recurring values across screen HTML. **Do not blindly reuse** current `src/app/globals.css` tokens.

**Approved 2026-07-17** with color clarification: `#fcf9f8` is canvas only; cards/headers/panels are white; no paper/beige identity.

## Token philosophy

- Flat editorial surfaces with tonal separation (not heavy shadows)
- Deep green primary actions; gold reserved for Michelin distinction accents (OD-13)
- Soft radii (4–8px); avoid pill shapes except status chips
- 8px spacing rhythm
- Content max width **1280px**
- **Reject:** paper textures, grain overlays, warm brown cards, full-page beige blocks, cream-on-cream panels

## Color tokens

### Canonical approved core

| Token | Value | Usage |
|---|---|---|
| `--dp-bg` | `#fcf9f8` | Page canvas only |
| `--dp-surface` | `#ffffff` | Cards, header, forms, panels, primary content surfaces |
| `--dp-soft` | `#f5f6f4` | Selected secondary sections only |
| `--dp-ink` | `#1c1b1b` | Primary text |
| `--dp-ink-secondary` | `#414845` | Secondary body |
| `--dp-ink-muted` | `#717975` | Meta, captions |
| `--dp-primary` | `#123b2f` | Buttons and brand actions |
| `--dp-primary-deep` | `#00251b` | Dark accents / pressed states |
| `--dp-primary-hover` | `#0a2b21` | Primary hover |
| `--dp-star-gold` | `#b88a2a` | Michelin distinctions + selected map ring only |
| `--dp-border` | `#e5e7e4` | Borders and hairlines |

### Extended surfaces (Material YAML mates)

| Token | Value | Usage |
|---|---|---|
| `--dp-surface-low` | `#f6f3f2` | Subtle containment |
| `--dp-surface-container` | `#f0edec` | Soft modules (sparingly) |
| `--dp-surface-high` | `#ebe7e7` | Hover/selected soft fill |
| `--dp-surface-highest` | `#e5e2e1` | Stronger containment |
| `--dp-surface-dim` | `#dcd9d9` | Dimmed overlay mates |

### Text

| Token | Value | Usage |
|---|---|---|
| `--dp-ink` / `on-surface` | `#1c1b1b` | Primary text |
| `--dp-ink-secondary` / `on-surface-variant` | `#414845` | Secondary body |
| `--dp-ink-muted` / `outline` | `#717975` | Meta, captions, disabled-ish |
| `--dp-on-primary` | `#ffffff` | Text on primary buttons |
| `--dp-on-soft` | `#1c1b1b` | Text on soft backgrounds |

### Borders

| Token | Value | Usage |
|---|---|---|
| `--dp-border` | `#E5E7E4` | Cards, inputs, header rule (prose) |
| `--dp-outline` | `#717975` | Stronger outline |
| `--dp-outline-variant` | `#c0c8c3` | Dividers in Material YAML |

### Accents (non-gold UI)

| Token | Value | Usage |
|---|---|---|
| `--dp-burgundy` | `#7A1F2B` | Progress / special highlights (not Michelin stars) |
| `--dp-secondary` | `#7c5800` | Non-Michelin secondary accent (chips/warnings) — not star marks |
| `--dp-secondary-container` | `#ffc964` | Soft highlight fills — never as Michelin distinction |

### Feedback

| Token | Value | Usage |
|---|---|---|
| `--dp-error` | `#ba1a1a` | Errors |
| `--dp-error-container` | `#ffdad6` | Error backgrounds |
| `--dp-warning` | `#7c5800` | Warning |
| `--dp-success` | `#123b2f` | Success |
| `--dp-focus` | `#123b2f` | Focus ring |

## Typography

### Fonts

| Role | Family | Notes |
|---|---|---|
| Display / headlines | **Literata** | OD-03 approved — only display font |
| UI / body | **Inter** | Functional UI |
| Icons | Material Symbols Outlined or equivalent | Prefer consistency; no Michelin flower |

**Resolved (OD-03):** Literata replaces Instrument Serif. Do not load both display fonts.

### Type scale

| Token | Size | Weight | Line height | Letter spacing | Font |
|---|---|---|---|---|---|
| `display-lg` | 48px | 400 | 1.1 | -0.02em | Literata |
| `display-lg-mobile` | 36px | 400 | 1.1 | -0.01em | Literata |
| `headline-md` | 32px | 400 | 1.2 | — | Literata |
| `headline-sm` | 24px | 500 | 1.3 | — | Literata |
| `body-lg` | 18px | 400 | 1.6 | — | Inter |
| `body-md` | 16px | 400 | 1.5 | — | Inter |
| `meta` | 14px | 400 | 1.4 | — | Inter |
| `label-caps` | 12px | 600 | 1 | 0.08em | Inter |
| `nav` | 14px | 500–600 | 1 | — | Inter |
| `button` | 14px | 600 | 1 | — | Inter |

## Spacing scale

| Token | Value |
|---|---|
| `--dp-space-1` | 4px |
| `--dp-space-2` | 8px (unit) |
| `--dp-space-3` | 12px |
| `--dp-space-4` | 16px |
| `--dp-space-5` | 24px (gutter) |
| `--dp-space-6` | 32px |
| `--dp-space-7` | 40px |
| `--dp-space-8` | 48px |
| `--dp-space-9` | 64px (desktop margin) |
| `--dp-space-10` | 80px (section padding) |
| `--dp-margin-mobile` | 20px |
| `--dp-margin-desktop` | 64px |
| `--dp-gutter` | 24px |
| `--dp-section` | 80px |

## Layout / content width

| Token | Value | Usage |
|---|---|---|
| `--dp-content-max` | 1280px | Standard pages |
| `--dp-content-wide` | 1440px | Component library / map header span |
| `--dp-header-height` | 72px | Sticky TopAppBar |
| `--dp-footer-pad-y` | 48–64px | Soft footer |
| `--dp-map-panel-width` | 420px | Canonical map workspace |
| `--dp-map-panel-width-alt` | 400px | Superseded by 420 |
| `--dp-account-aside-width` | 240px | Account settings |
| `--dp-drawer-width` | ~360–420px | Explore filters drawer |
| `--dp-modal-width` | ~480–560px | Plan/visit dialogs |
| `--dp-auth-form-max` | ~440–560px | Auth form column |

## Radii

| Token | Value | Usage |
|---|---|---|
| `--dp-radius-sm` | 2px (0.125rem) | Micro |
| `--dp-radius-md` | 4px (0.25rem) | Inputs, chips base |
| `--dp-radius-lg` | 8px (0.5rem) | Cards, buttons |
| `--dp-radius-xl` | 12px (0.75rem) | Rare large panels |
| `--dp-radius-full` | 9999px | Status pills only |

**Replace current** `6/10/12` radii with Stitch soft architectural radii.

## Shadows / elevation

| Token | Value | Usage |
|---|---|---|
| `--dp-shadow-none` | none | Default |
| `--dp-shadow-hover` | `0 4px 20px rgba(0,0,0,0.04)` | Interactive card hover |
| `--dp-shadow-drawer` | soft ambient (define as `0 8px 32px rgba(0,0,0,0.08)`) | Drawers/modals |

**Remove** current `--shadow-float: 0 8px 28px rgba(18,18,18,0.1)` as default card elevation.

## Image ratios

| Context | Ratio |
|---|---|
| Discovery / editorial cards | **4:3** (system) |
| Homepage featured (observed) | ~3:2 acceptable if design shows it — prefer 4:3 for consistency |
| Restaurant identity hero (Benu) | ~16:10 / landscape media pane |
| Collection hero | Wide landscape ~16:9–2:1 |
| Auth atmospheric panel | Full column bleed |
| Taxonomy heroes | Wide landscape |

## Grid

| Viewport | Columns | Behavior |
|---|---|---|
| ≥1280 / 1440 | 12 | Fixed in 1280 content |
| 1024 | 8–12 | Collapse featured 3→2; explore 4→3 or 2 |
| 768 | 4–8 | Stack sidebars; explore 2-col |
| 390 | 4 | Single column; drawers full-screen |

Explore desktop: **4-col** discovery grid.  
Saved/Visited/Collections: **3-col**.  
Homepage featured: **3-col**.

## Controls

| Control | Spec |
|---|---|
| Primary button | 48px height; bg `primary-container`; text white; radius lg; 14px semibold |
| Secondary button | 48px; 1px border `#E5E7E4`; primary text |
| Ghost / text | Primary text; no fill |
| Input | 48px; 1px border; 4px radius; label-caps above |
| Chip | 24px height; soft green/gold; 4px radius |
| Quick filter | Pill or chip per screen — prefer chip language from system; map uses pill toggles |
| Focus ring | 2px `primary-container`, 3px offset |

## Z-index layers

| Layer | Token | Suggested |
|---|---|---|
| Base | `--z-base` | 0 |
| Sticky header | `--z-header` | 50 |
| Map controls | `--z-map-controls` | 40 |
| Drawer backdrop | `--z-drawer-backdrop` | 60 |
| Drawer | `--z-drawer` | 70 |
| Modal backdrop | `--z-modal-backdrop` | 80 |
| Modal | `--z-modal` | 90 |
| Toast | `--z-toast` | 100 |
| Skip link | `--z-skip` | 110 |

## Motion

| Token | Value |
|---|---|
| `--dp-duration-fast` | 150ms |
| `--dp-duration` | 200ms |
| `--dp-duration-slow` | 300ms |
| `--dp-ease` | `cubic-bezier(0.2, 0, 0, 1)` |
| Reduced motion | Disable non-essential transitions (keep focus states) |

## Old tokens to remove after migration

From current `src/app/globals.css`:

| Old token | Why remove |
|---|---|
| `--color-bg: #ffffff` as default canvas | Stitch canvas is `#fcf9f8` |
| `--color-ink: #121212` | Replace with `#1c1b1b` |
| `--font-display` → Instrument Serif | Replace with Literata |
| `--radius-sm/md/lg` 6/10/12 | Replace with Stitch 2/4/8 |
| `--shadow-float` heavy float | Conflicts with flat editorial |
| `--max-content: 80rem` utility coupling to old container | Rebuild as `--dp-content-max` + new PageContainer |
| `.paper-texture` no-op | Delete with callers |
| `.container-editorial` / `.section-space` as old rhythm | Replace with Stitch margin/section tokens |

Keep semantic mapping during Phase 1 with temporary aliases only if needed for incremental route migration; delete aliases by end of Phase 12.

## Implementation note

Introduce tokens in a new CSS layer (e.g. `:root` `--dp-*` + `@theme inline`) before rebuilding shell components. Do not try to “nudge” existing forest/gold variables into visual parity — redefine the token set from Stitch.
