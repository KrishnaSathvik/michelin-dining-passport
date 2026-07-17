# Design principles

## Product feel

This is a **modern premium Michelin restaurant discovery product**.

It should feel:

- clean, sharp, image-led
- elevated and contemporary
- appetizing and trustworthy
- highly usable (search, filter, reserve, save, map)

It must not feel:

- beige-heavy or paper-like
- old-fashioned editorial document
- flat, low-contrast wireframe
- placeholder-driven prototype
- SaaS analytics dashboard
- compressed desktop layout on mobile

**Reference blend:** Resy clarity + Notion cleanliness + Apple-level spacing + premium dining photography.

## Color system (locked)

### Base

| Token | Hex | Use |
| --- | --- | --- |
| `--color-bg` | `#FFFFFF` | **Default page background** — pure white |
| `--color-surface` | `#FFFFFF` | Cards, panels, header, sheets |
| `--color-surface-soft` | `#F5F6F4` | Selected section separation only (cool gray-green, not warm) |
| `--color-ink` | `#121212` | Primary text |
| `--color-ink-secondary` | `#4A4A4A` | Secondary text |
| `--color-ink-muted` | `#737373` | Metadata, captions |
| `--color-border` | `#E5E7E4` | Soft cool border — use sparingly |

### Primary action

| Token | Hex | Use |
| --- | --- | --- |
| `--color-primary` | `#123B2F` | Primary buttons, key links, focus |
| `--color-primary-hover` | `#0A2B21` | Hover / pressed |

### Accents (restrained)

| Token | Hex | Use |
| --- | --- | --- |
| `--color-gold` | `#B88A2A` | Star marks, rare highlights |
| `--color-burgundy` | `#7A1F2B` | Occasional editorial accent only |

**Rules**

- White (`#FFFFFF`) is the default page background — not near-white, ivory, cream, or warm off-white.
- Soft surface `#F5F6F4` may only separate **selected** sections; never wash the full page.
- Do not create a full-page warm, cream, ivory, or beige appearance.
- Do not let gold or burgundy dominate UI chrome.
- Prefer section rhythm via white ↔ soft cool surface, not borders.

## Typography (locked)

| Role | Family | Notes |
| --- | --- | --- |
| Display | Instrument Serif | Hero + major section titles; selected restaurant names in premium contexts |
| UI / body | Inter | Nav, buttons, filters, metadata, body, forms |

### Scale (minimums)

| Role | Desktop | Mobile |
| --- | --- | --- |
| Hero display | 56–72px | 36–44px |
| Section display | 36–44px | 28–32px |
| Restaurant name (card) | 20–22px | 18–20px |
| Body | 16–18px | 16px min |
| Metadata | 14–15px | 14px min |
| Nav | 15–16px | 16px |
| Button label | 15–16px | 15–16px |

Avoid tiny nav, tiny metadata, and tiny button text. Serif is not a document body font.

## Layout principles

1. **Whitespace over boxes** — group by proximity and background shift, not thin borders everywhere.
2. **Image-led** — photography carries emotion; UI chrome stays quiet.
3. **One primary CTA** per interactive card or hero.
4. **Progressive disclosure** — hide secondary links (Guide, website) behind detail/overflow.
5. **Custom mobile** — purpose-built shells, not compressed desktop.
6. **Strong hierarchy** — brand, search, and reserve actions must be obvious within one glance.

## Section rhythm

Use background shifts to create pace:

| Zone | Background |
| --- | --- |
| Hero / primary discovery | `#FFFFFF` |
| Featured / editorial | `#F5F6F4` |
| Browse grids | `#FFFFFF` |
| Teasers (map / passport) | `#F5F6F4` or white with one large image |
| Footer | `#F5F6F4` (not on map workspace) |

## Shadows and radius

- Radius: 8–12px for media cards; 6–8px for controls; avoid pill-heavy chrome.
- Shadows: soft, single-layer elevation for floating map controls and sheets only.
- Prefer no shadow on static content cards; use image and spacing for separation.

## Motion

- 2–3 intentional motions max per primary page (hero fade/rise, card hover lift, sheet expand).
- Respect `prefers-reduced-motion`.
- Motion supports hierarchy; it is not decoration noise.

## Explicit rejects (carry into implementation review)

- Full cream/beige/ivory/warm near-white site backgrounds (`#F7F3EC`, `#FAFAF7`, `#F6F6F2`, paper texture gradients)
- Document-style paper lines / repeating paper textures as brand identity
- Placeholder blocks as the main visual identity
- Unrelated stock food/interior photos on named restaurant cards
- Repetitive bordered card grids with tiny multi-link footers
- Permanent e-commerce filter sidebars as the default Explore layout
- Three-column restaurant grids near phone widths (~673px)
- Tiny embedded maps with large empty margins and site footer inside the map product
- Dashboard metric walls as primary Passport empty state (later batch)
- Exposing every filter and utility control at equal visual weight
