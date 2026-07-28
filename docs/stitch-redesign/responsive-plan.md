# Responsive Plan

Stitch screens are primarily desktop. Responsive work must **preserve approved desktop composition** while producing deliberate tablet and mobile layouts — not merely shrinking the desktop UI.

**Approved (OD-12):** No app-wide mobile bottom navigation. Use the canonical sticky header with a collapsed menu on small viewports.

## Reference widths

| Width | Role |
|---|---|
| **1440px** | Desktop acceptance / screenshot baseline |
| **1280px** | Design content max; primary desktop |
| **1024px** | Tablet landscape / small desktop |
| **768px** | Tablet portrait |
| **390px** | Mobile acceptance |

## Global rules

- Content max **1280px** with **64px** margins ≥1024; **20px** margins ≤767
- Header **72px** sticky; collapse nav links into menu ≤767; keep logo + search + account
- Touch targets ≥44×44px (prefer 48px controls)
- Drawers full-screen ≤767
- Dialogs → bottom sheets ≤767 where height-heavy (plan/visit)
- No horizontal overflow at any reference width
- Typography: `display-lg` → `display-lg-mobile` ≤767

## By major route

### `/` Homepage

| Width | Behavior |
|---|---|
| 1440/1280 | Full-bleed hero; stats 4-col; featured 3-col |
| 1024 | Featured 3→2; stats remain 4 or 2×2 |
| 768 | Stats 2×2; featured 2-col; hero height reduced |
| 390 | Single column; hero text padded 20px; CTAs full width |

**Reorder:** Do not insert browse modules Stitch omitted.  
**Sticky:** Header only.

### `/explore`

| Width | Behavior |
|---|---|
| 1440/1280 | 4-col grid; toolbar single row; drawer 360–420px from right |
| 1024 | 3-col or 2-col grid |
| 768 | 2-col; toolbar wraps; drawer full-screen |
| 390 | 1-col; list mode stacked rows; filters via full-screen drawer |

**Overflow:** Active filter chips scroll horizontally with fade, not wrap into chaos.

### `/map` (OD-04)

| Width | Behavior |
|---|---|
| 1440/1280 | **420px** left panel + MapLibre; no footer |
| 1024 | Panel may shrink to ~360px or overlay |
| 768 | Map full stage; list as drawer; selected as sheet |
| 390 | Map primary; **bottom sheet** for list/detail; compact Google in sheet |

**Sticky:** Header; map controls anchored; Search this area top-center.  
**Preserve:** List↔marker sync across all breakpoints.

### `/restaurants/[slug]`

| Width | Behavior |
|---|---|
| 1440/1280 | ~58/42 identity split; details + Google side-by-side; related 3-col |
| 1024 | Split may become 50/50 or stacked media-first |
| 768 | Stack: media → identity → details → Google → related 2-col |
| 390 | Stack; sticky action bar; dialogs as sheets; related 1-col |

### `/passport` and lists

| Width | Behavior |
|---|---|
| Desktop | Summary 3-col; progress 2-col; collection 3-col |
| 768 | Summary 3→1 or scroll; progress stack; cards 2-col |
| 390 | All single column; large serif numbers retained |

### Collections

| Width | Behavior |
|---|---|
| Desktop | Featured + 3-col grid; detail hero + progress sidebar |
| 768 | Sidebar stacks under hero |
| 390 | Single column; create dialog full-screen |

### Auth

| Width | Behavior |
|---|---|
| ≥1024 | Split atmospheric \| form |
| ≤768 | Hide atmospheric panel; form full width with compact logo |

### Account

| Width | Behavior |
|---|---|
| ≥768 | 240px sticky aside + sections |
| ≤767 | Aside becomes horizontal subnav or select list; sections stack |

### Taxonomy / education

| Width | Behavior |
|---|---|
| Desktop | Hero + bento/grids as designed |
| Mobile | Stack bentos; education star cards 1-col |

## Map mobile action pattern

1. Default: map canvas with filter entry button  
2. Open list sheet (handle + results)  
3. Select → expand detail sheet with reserve + details + Google compact  
4. Close returns to map with selection retained  

## Dialog → bottom sheet

| Dialog | Desktop | Mobile |
|---|---|---|
| Plan visit | Center modal ~520px | Bottom sheet ≥60vh |
| Record visit | Center modal | Bottom sheet |
| Create collection | Center modal | Full-screen |
| Delete confirm | Center small modal | Center or sheet |

## Typography changes by breakpoint

| Token | Desktop | Mobile |
|---|---|---|
| display-lg | 48px | 36px |
| headline-md | 32px | 28px |
| headline-sm | 24px | 22px |
| body | 16–18 | 16 |

## QA matrix

For every major route, capture screenshots at **1440, 1024 or 768, and 390** and check:

- Column changes intentional  
- Content reordering matches this plan  
- Sticky elements do not obscure CTAs  
- Header collapse correct  
- Drawer/sheet behavior  
- Card/image ratios hold  
- Map usable with one hand on 390  
- Min touch targets  
- No type overflow/truncation bugs on long restaurant names
