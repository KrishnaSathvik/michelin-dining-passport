# Design system & homepage directions

## Product design principles

**Feel like:** an editorial dining atlas combined with a personal restaurant passport.

**Must not resemble:**

- A generic SaaS dashboard
- A default shadcn template
- An AI-generated travel site
- A restaurant reservation marketplace
- Michelin’s official website
- A black-and-gold luxury cliché
- A grid of repetitive rounded cards

### Visual rules (shared across directions)

| Token idea | Value |
| --- | --- |
| Background | Warm off-white `#F7F3EC` / `#F3EEE5` |
| Surface | `#FFFDF8` |
| Text | Near-black `#141210` |
| Muted text | `#5C564E` |
| Action / links | Deep forest green `#1F3D2F` → hover `#163024` |
| Editorial accent | Muted burgundy `#7A2E3A` |
| Distinction / stars | Restrained warm gold `#B0893F` (lines/marks, not fills everywhere) |
| Borders | `#E4DDD1` subtle 1px |
| Radius | 0–6px (editorial); avoid pill-heavy UI |
| Shadow | Prefer borders; shadows only for floating map chrome |

### Typography

| Role | Family |
| --- | --- |
| Display / editorial | **Instrument Serif** |
| UI / body | **Inter** |

Load via `next/font` (Google). Do not use Inter for hero brand wordmarks — Instrument Serif carries the brand.

### Photography

- Large, authentic restaurant photography when licensed/owned.
- Until then: abstract warm paper textures, typographic star marks, cropped architectural silhouettes — **never fake restaurant-specific images**.
- Full-bleed hero media only when a real asset exists; otherwise typography-led hero with restrained atmosphere.

### Component philosophy

- Cards only when content is individually interactive.
- Strong whitespace and editorial hierarchy.
- Functional search/filters from the first screen.
- Subtle borders > excessive shadows.

---

## Proposed design tokens (CSS variables)

```css
:root {
  --color-bg: #f7f3ec;
  --color-bg-elevated: #fffdf8;
  --color-ink: #141210;
  --color-ink-muted: #5c564e;
  --color-forest: #1f3d2f;
  --color-forest-deep: #163024;
  --color-burgundy: #7a2e3a;
  --color-gold: #b0893f;
  --color-border: #e4ddd1;
  --color-focus: #1f3d2f;

  --font-display: "Instrument Serif", ui-serif, Georgia, serif;
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;

  --radius-sm: 4px;
  --radius-md: 6px;
  --space-section: clamp(4rem, 8vw, 7rem);
  --max-content: 72rem;
}
```

---

## Proposed component system

### Layout

- `SiteHeader` — brand, primary nav (Explore, Map, Passport), compact search
- `SiteFooter` — disclaimer (independent, not affiliated), coverage note, links
- `Section` / `SectionHeader` — editorial section pacing
- `Container`

### Discovery

- `SearchBar` — name / city / cuisine; submits to `/explore?q=`
- `FilterBar` — stars, state, cuisine, price
- `RestaurantDiscoveryCard`
- `RestaurantEditorialCard`
- `RestaurantCompactCard`
- `RestaurantListRow`
- `MapMarkerPreview`
- `StarMark` · `PriceMark` · `CuisineChip` (chip = subtle border, not pill candy)

### Taxonomy

- `StateTile` · `CityLink` · `CuisineLink` · `StarTierPanel`

### Passport

- `PassportPreview` — progress rings / counts without gamified noise
- `VisitBadge` · `SavedToggle` (later)

### Content

- `MichelinExplainer` — 1/2/3 star plain-language panels
- `EmptyState` · `DisclaimerBanner`

---

# Three homepage design proposals

> Conceptual inspiration only — do not copy layouts or assets from Tubik, NoSignups, Openloop, Refero, mapcn, Dimension, Paper.design, Monofactor, etc.

---

## Direction A — Editorial Atlas

**Essence:** Geographic storytelling + Tubik-like whitespace + Monofactor typography leadership.

### Homepage layout

1. Quiet masthead with serif wordmark  
2. Wide editorial hero: atlas headline + short dek (no dashboard widgets)  
3. Secondary search strip under the dek  
4. “Featured across the atlas” — 1 large editorial feature + 2 supporting  
5. “By territory” — state list as typographic index (counts as marginalia)  
6. “By cuisine” — horizontal editorial links, not icon grids  
7. Star explanation as a long-form fold  
8. Passport preview as a closing essay block  

### Hero composition

- Brand name at hero scale  
- One headline (“The United States, mapped by stars”)  
- One supporting sentence  
- One CTA group: Explore · View map  
- Atmosphere via paper texture / line-map suggestion — not a card collage  

### Search experience

Search is present but secondary — a refined under-hero field. Power users go to Explore.

### Featured restaurants

Editorial feature card with large image plane (or placeholder treatment), serif name, city, star mark. Few items, high pause.

### State discovery

Typographic column index: `California — 83` as linked lines. Feels like an atlas legend.

### Cuisine discovery

Sparse linked cuisine names with counts; no emoji, no icon row.

### Michelin-star explanation

Magazine section with three vertical essays (1 / 2 / 3). Burgundy rules as dividers.

### Passport preview

Soft invitation: “Start a dining passport” with sample progress (static). No signup modal.

### Typography / colors / photography

Instrument Serif dominant; Inter for nav/search. Warm off-white, forest links, gold star marks. Photography sparse and large when present.

### Desktop / mobile

Desktop: generous margins, 12-col editorial rhythm.  
Mobile: stacked essays; state index becomes accordion or simple list.

### Strengths

- Strongest brand differentiation  
- Avoids SaaS/template look  
- Excellent for storytelling and trust  

### Weaknesses

- Slower path to utilitarian browsing  
- Risk of feeling too magazine-like if search is underpowered  
- Harder to scan 271 restaurants from the homepage alone  

---

## Direction B — Modern Dining Guide

**Essence:** NoSignups / Openloop usefulness — search-first, efficient, highly browsable (Refero / Component Gallery energy without looking like a component gallery).

### Homepage layout

1. Compact header with persistent search  
2. Search-led hero: large query field + quick filters (stars, state)  
3. Result teaser strip (top matches or featured picks as list rows / few cards)  
4. Browse modules: States · Cuisines · Star tiers as equal utilitarian sections  
5. Compact Michelin explainer  
6. Passport preview as a practical CTA panel  

### Hero composition

- Brand as clear wordmark (serif) but not drowning the search  
- Headline secondary to the search module  
- Supporting sentence: “271 starred restaurants across 14 U.S. regions”  
- CTAs: Search · Browse all  

### Search experience

**Primary.** Instant focus affordance; query + star chips + state select; Enter → `/explore`.

### Featured restaurants

Mix of discovery cards and list rows — browsable, not precious. Limit visual sameness with varied image aspect or list-first for density.

### State discovery

Compact tile/list hybrid: state name + count + star mix micro-text. Entire row clickable.

### Cuisine discovery

Wrapped text links or low-chrome chips with counts.

### Michelin-star explanation

Three short panels with clear definitions; link to `/about-michelin-stars`.

### Passport preview

“Track visits” module with three stats placeholders (Visited · Saved · States).

### Typography / colors / photography

Inter carries density; Instrument Serif for brand + section titles only. Same color tokens. Photography optional thumbnails — placeholders OK.

### Desktop / mobile

Desktop: search hero dominates first viewport.  
Mobile: sticky search; browse modules stack cleanly.

### Strengths

- Immediate usefulness (matches travel-planner job)  
- Best path into Explore  
- Honest about being a directory + passport  

### Weaknesses

- Can slide toward generic “tool” UI if not carefully styled  
- Less emotional “atlas” romance  
- Feature cards can become repetitive if overused  

---

## Direction C — Immersive Discovery

**Essence:** mapcn / Dimension / Paper.design — map-led exploration as the homepage center of gravity.

### Homepage layout

1. Minimal header overlaying a large map stage  
2. Map as the hero (static image or interactive later)  
3. Floating search + filter dock  
4. Side/bottom drawer of compact map-result cards  
5. Below fold: state/cuisine rails, star explainer, passport  

### Hero composition

- Full-bleed map plane  
- Brand + headline as overlay (careful contrast)  
- Search dock floating on map  
- Avoid sticker/badge clutter on the map  

### Search experience

Map-scoped search: typing filters markers/list. High power once geocoded.

### Featured restaurants

Driven by map selection; editorial cards appear on pin focus.

### State discovery

Clickable regions / state chips that fly the map camera (later).

### Cuisine discovery

Filter chips on the map dock.

### Michelin-star explanation

Collapsed below the immersive stage — secondary.

### Passport preview

Paper.design-like personal shelf preview below the map.

### Typography / colors / photography

UI-heavy Inter on chrome; serif for brand. Map becomes the photography.

### Desktop / mobile

Desktop: split map + list.  
Mobile: map-first with bottom sheet (harder to execute well).

### Strengths

- Memorable, differentiated exploration  
- Perfect eventual home for `/map` patterns  
- Strong “discovery” metaphor  

### Weaknesses

- **Blocked on geocoding + map provider** (out of Phase 0/1 scope)  
- Weak without real coordinates  
- Homepage becomes empty/awkward with a fake map  
- Accessibility and performance risk if over-immersive  

---

# Recommended combined direction

## **Modern Dining Guide structure + Editorial Atlas visual identity + Immersive map page**

| Surface | Direction |
| --- | --- |
| Homepage | **B structure** (search-led, browsable modules) |
| Visual identity | **A system** (Instrument Serif, warm paper, forest/burgundy/gold, whitespace) |
| `/map` | **C patterns** (map + list workspace) as a dedicated route — not the homepage hero until geocodes exist |

### Why this combination

1. Users get utility on first paint (search + counts + browse).  
2. The brand still feels like an editorial atlas, not a SaaS dashboard.  
3. Immersive map work proceeds without forcing a hollow map homepage.  
4. Matches the product line: *editorial dining atlas + personal passport*.

### Homepage section order (approved intent)

1. Header (serif brand, Explore / Map / Passport, compact search)  
2. Search-led hero with real counts (271 / star split / 14 regions)  
3. Featured restaurant composition (1 editorial + 2–3 discovery — placeholders for images)  
4. State browsing  
5. Cuisine browsing  
6. Michelin-star explanation  
7. Passport preview  
8. Footer with independence/coverage disclaimer  

### Explicitly reject for homepage

- Dashboard stat cards as the hero  
- Black-and-gold luxury skin  
- Dense rounded card grids  
- Forced signup walls  
- Fake restaurant photography  
- Full interactive map hero before enrichment  

---

## Motion (when implementing)

Ship 2–3 intentional motions only:

1. Hero search focus ring / soft elevation  
2. Section fade/rise on scroll (subtle)  
3. Star mark draw or opacity settle on featured cards  

No ambient particle noise, no glow stacks.
