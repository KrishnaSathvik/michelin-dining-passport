# Responsive rules

## Breakpoint tokens

| Name | Width | Intent |
| --- | --- | --- |
| Phone | `0–639px` | One-column discovery; mobile chrome |
| Phablet | `640–767px` | Still one restaurant column |
| Tablet | `768–1023px` | Max **two** restaurant columns; filter sheet |
| Desktop | `1024–1439px` | Full-width explore; map split unlocks |
| Wide | `1440px+` | Design reference canvas; up to 4 explore cards |

**Hard rules**

- At ~673px (rejected audit width): **one** restaurant column, filter button → drawer/sheet — never a permanent sidebar + 3-col grid.
- Tablet restaurant grids: **maximum two columns**.
- Desktop explore: **no permanent left filter sidebar by default**; full-width results; **three** columns from `1024px`; **four** at `≥1440px` when cards stay ≥280px and premium.
- Touch targets: **≥44×44px**.
- Body text: **≥16px** on phone.

## Content width

| Context | Max width |
| --- | --- |
| Marketing / home sections | 1200–1280px content |
| Explore results | Full content width (filters are horizontal + drawer, not a permanent rail) |
| Map | Full viewport width; no `container-editorial` on the workspace |
| Auth (later) | Centered card ~420–480px |

Horizontal page padding: 16px phone / 24px tablet / 32–40px desktop.

## Navigation

### Desktop (`≥1024px`)

- Sticky header ~64–72px tall
- Brand (serif) left; primary nav; search affordance; Account / Sign in
- Clear signed-in vs signed-out treatment (implementation preserves auth; visual state is required)

### Mobile (`<1024px`)

- Purpose-built header: brand + search icon + menu (or Explore / Map shortcuts)
- Do not dump full desktop link list at tiny size
- Menu sheet/drawer with full destinations + Account

## Filter patterns

| Surface | Desktop | Mobile / tablet `<1024` |
| --- | --- | --- |
| Explore | Sticky search + horizontal quick filters; **All filters** → right drawer | Filter button → bottom sheet; no permanent sidebar |
| Map | Filters in **420px left** list panel + floating map controls | Floating Filters → sheet |

Optional Explore “pin filters” left rail: only as explicit expanded mode at large widths — never default first paint.

## Restaurant card grids

| Viewport | Columns |
| --- | --- |
| `<768px` | 1 |
| `768–1023px` | 2 |
| `1024–1439px` | 3 |
| `≥1440px` | **4** preferred when premium; else 3 |

Card media aspect: **4:3**. Min card width before adding a column: **~280px**.

## Map-specific

| Viewport | Layout |
| --- | --- |
| `≥1024px` | `100dvh − header`; **420px list left**; map fills remaining **right**; **no site footer**; no page container |
| `<1024px` | Full-screen map under header; floating search/filters; expandable bottom sheet; map/list toggle; **no site footer** |

See [map-spec.md](./map-spec.md).

## Typography responsive mapping

Follow [design-principles.md](./design-principles.md) scale. Reduce display sizes on phone; do not shrink metadata below 14px or body below 16px.

## Loading and empty (responsive)

- Skeletons mirror final grid column count at the active breakpoint.
- Empty states are full-width within the content column; never a thin sidebar-only message.
