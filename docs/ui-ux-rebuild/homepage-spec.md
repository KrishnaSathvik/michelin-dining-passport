# Homepage specification

**Routes:** `/`  
**Canvases:** Desktop 1440×900+ · Mobile 390×844+  
**Baseline (rejected):** `current/rejected-homepage.png`

## Goal

First viewport must communicate: **this is the best modern way to discover Michelin restaurants in the US** — image-led, searchable, premium.

## Content hierarchy

1. Header  
2. Hero (brand moment + search + chips + CTAs + stats + imagery)  
3. Featured restaurants  
4. Browse by destination (visual)  
5. Browse by cuisine (visual)  
6. Map teaser  
7. Michelin stars explained (compact visual comparison + link)  
8. Passport teaser (aspirational)  
9. Footer  

## Functionality to preserve

- Search submits into explore (same query semantics as today)
- Star quick links → `/explore?stars=1|2|3`
- State quick links → explore or state hubs (CA, NY, IL, FL, TX — keep coverage)
- CTAs → `/explore`, `/map`
- Featured restaurants from `homepageConfig.featuredRestaurantSlugs`
- State / cuisine aggregates and links to taxonomy routes
- Link to `/about-michelin-stars`
- Passport CTA → `/passport`
- Live totals / region counts (not fake marketing numbers)

## Elements to remove / replace

| Remove | Replace with |
| --- | --- |
| Cream paper hero and textures | Pure white page + atmospheric hero photography |
| Quiet small hero | Large display headline + dominant image plane |
| Text-only state/cuisine directories | Visual destination & cuisine cards |
| Placeholder-led featured grid | Editorial flagship (approved photo or designed fallback) + secondary cards |
| Unrelated stock on named restaurants | Forbidden — see image-strategy |
| Passport “example dashboard” boxes | Aspirational journey teaser |
| Tiny type / low-contrast chips | Larger chips and CTAs |

---

## Desktop 1440

### Header

- Full width; 72px; white; brand left; nav; account

### Hero — layout

```text
┌──────────────────────────────────────────────────────────────┐
│ Header                                                       │
├────────────────────────────┬─────────────────────────────────┤
│  Brand / H1 / dek          │                                 │
│  Search (full width col)   │     Large hero photography      │
│  Quick chips               │     (dining / destination)      │
│  [Explore] [Map]           │                                 │
│  Stats row                 │                                 │
│  ~560–640px content col    │     ~50% width image            │
└────────────────────────────┴─────────────────────────────────┘
```

**Alternative allowed if stronger:** full-bleed atmospheric image background with scrim and search centered — pure white page below. Prefer split or full-bleed; **reject** tiny inset media card.

| Element | Spec |
| --- | --- |
| H1 | Instrument Serif 56–64px; charcoal |
| Dek | 18px secondary; one sentence |
| Search | 56–64px tall; primary discover control |
| Chips | Stars + top states; wrap with 8–12px gap |
| Primary CTA | Explore — filled green |
| Secondary CTA | Map — secondary button |
| Stats | 3 items only (e.g. restaurants · 3★ count · regions); 14–15px; not a dashboard |
| Image | Min height ~480px; object-cover; honest alt |

Hero vertical padding: 48–64px. Content max width ~1280px centered.

### Featured restaurants

- Section on `#F5F6F4`
- Title (serif 36–40px) + short dek + “View all” → `/explore`
- **1 flagship** editorial card (~7–8 cols) + **2–3** secondary discovery cards
- Flagship media min-height 360px — **named restaurant rule:** verified photo or premium designed fallback only (never unrelated stock)
- Card actions: Reserve + Save only

### Browse by destination

- White background
- Title + dek
- Grid: 4 cards at 1440 (e.g. California, New York, Chicago/Illinois, Florida); optional + more
- Each card: image 3:2 or 4:3, state name, restaurant count
- Links preserve `/usa/{stateSlug}` (or current taxonomy targets)

### Browse by cuisine

- Soft surface or white (alternate from destinations)
- Visual cards (image + cuisine + count); preview limit retained (~12) with “View all”
- Links preserve `/cuisines/{slug}`

### Map teaser

- Large preview panel (static map image or live mini-map **at least 360px tall**, full content width)
- Headline + one sentence + CTA “Open map”
- Not a tiny decorative thumbnail

### Michelin stars explained (home module)

- Three visual comparison tiles (1★ / 2★ / 3★) — not only paragraphs
- CTA to `/about-michelin-stars`
- Keep educational accuracy; visual structure over essay

### Passport teaser

- Aspirational copy: journey framing
- Single progress-style preview or sample “saved / visited” imagery row — **not** eight zeroed metric boxes
- Update copy: accounts/cloud sync **exist** (remove “cloud sync arrives later” if still present)
- CTA Open Passport

### Footer

- Soft surface; condensed

---

## Mobile 390

### Hero

```text
┌─────────────────────┐
│ Header              │
│ Full-bleed or tall  │
│ image (~280–320px)  │
│ H1                  │
│ Dek                 │
│ Search (full width) │
│ Chips (wrap)        │
│ Explore / Map stack │
│ Stats (3 inline)    │
└─────────────────────┘
```

- One column throughout
- Featured: flagship full width, then secondary cards stacked (1 col)
- Destination / cuisine: horizontal scroll **or** 1-col stack — prefer 1.5-card peek horizontal scroll for destinations
- Map teaser full width ≥240px tall
- Section padding 40–56px vertical; 16px horizontal

### Touch

- Search and CTAs ≥44px tall
- Chips ≥36px tall

---

## Typography & spacing (home)

| Token | Desktop | Mobile |
| --- | --- | --- |
| Section title | 36–44px serif | 28–32px |
| Section dek | 17–18px | 16px |
| Section gap | 80–112px | 56–72px |

---

## Interactions

- Chip → navigate with filters
- Search submit → explore results
- Card image/name → restaurant detail
- Reserve → external reservation (unchanged)
- Save → passport save (optimistic; auth rules unchanged)
- Hover (desktop): subtle image scale 1.02 / shadow — reduced motion safe

## Empty / loading

- Featured loading: skeleton flagship + 2 card skeletons
- If featured slugs missing: hide section (preserve current null behavior) or show Explore CTA empty state

## Acceptance criteria

- [ ] Default page background is `#FFFFFF` — no cream/beige/warm near-white wash
- [ ] Hero search is the clearest control on first viewport
- [ ] Destinations and cuisines are visual, not text directories
- [ ] Named featured restaurants never use unrelated atmospheric stock
- [ ] Stats ≤3 and non-dashboard
- [ ] Passport teaser is aspirational, not analytics
- [ ] All existing home navigation targets still work
