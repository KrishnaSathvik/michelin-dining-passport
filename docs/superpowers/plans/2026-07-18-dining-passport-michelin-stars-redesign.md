# Dining Passport Michelin Stars Educational Page Redesign Specification

**Stage:** 5 — Michelin Stars educational page redesign  
**Date:** 2026-07-18  
**Status:** Approved product specification  
**Route:** `/about-michelin-stars`  
**Scope:** Specification only. This document does not authorize production implementation, MapTiler configuration, media ingestion, commits, or pushes.

## Executive direction

Turn the page into a concise editorial guide built around a progressive `Stop → Detour → Special journey` reading path. The recommended hero headline is **“What One, Two, and Three Michelin Stars Mean.”** Use verified ingredient-and-craft photography in a split editorial hero, with a restrained abstract route motif as the no-media fallback.

The educational core should not be three interchangeable cards. Use three horizontal editorial bands that move from one to three stars while keeping each distinction equally legible. Follow them with a five-principle explanation, a short section about consistency and annual reassessment, three clearly separate non-Star distinctions, and a focused continuation into Dining Passport discovery.

Dining Passport currently catalogs Michelin-starred U.S. restaurants only. Bib Gourmand, Green Star, and Michelin Selected remain educational content without local counts, filters, or unsupported discovery links.

---

## 1. Current-state findings

### Evidence reviewed

- Fresh Stage 1 full-page captures from 2026-07-18:
  - `output/playwright/stage1-foundation/michelin-stars-1440.png`
  - `michelin-stars-1280.png`
  - `michelin-stars-1024.png`
  - `michelin-stars-768.png`
  - `michelin-stars-430.png`
  - `michelin-stars-390.png`
  - `michelin-stars-375.png`
- Current/reference images:
  - `docs/ui-ux-rebuild/current/rejected-about-michelin-stars.png`
  - `docs/designs/how_michelin_stars_work/screen.png`
  - `docs/stitch-redesign/baselines/taxonomy-education/education/*`
- Current route and presentation:
  - `src/app/about-michelin-stars/page.tsx`
  - `src/app/about-michelin-stars/loading.tsx`
  - `src/components/stitch/education/*`
  - `src/components/stitch/taxonomy/models.ts`
  - `src/lib/data/restaurants.ts`
  - `src/config/site.ts`
  - `src/components/shell/SiteFooter.tsx`
  - `e2e/education.spec.ts`

### Measured screenshot evidence

| Viewport | Current full-page capture |
| --- | ---: |
| 1440px | 1440×2778 |
| 1280px | 1280×2778 |
| 1024px | 1024×2836 |
| 768px | 768×2990 |
| 430px | 430×3713 |
| 390px | 390×3880 |
| 375px | 375×3945 |

The mobile page is long but not rich: the same card pattern stacks repeatedly, then repeated qualification/disclaimer copy expands the footer.

### Working foundations to preserve

1. Canonical shared header and footer are already used.
2. The page is server-rendered.
3. No Google Places or MapLibre client bundle is mounted.
4. Star counts come from `getTotals()` rather than literal JSX.
5. `/stars/1`, `/stars/2`, `/stars/3`, and `/explore?stars={n}` already exist.
6. One-, two-, and three-star meanings already use the published stop/detour/journey vocabulary.
7. The current page distinguishes Bib Gourmand and Green Star from Star levels.
8. The local 2400×1600 atmospheric image is decorative and not tied to a named restaurant.
9. Canonical color and typography tokens—forest, ivory, gold, Literata, and Inter—are available.
10. Existing education tests verify canonical chrome, the star links, and the absence of Google UI.

### Current catalog evidence

The canonical restaurant source currently reports:

- 216 one-star restaurants;
- 39 two-star restaurants;
- 16 three-star restaurants;
- 271 starred restaurants total.

These values are evidence for the current design, not editorial constants. Rendering must continue to derive them.

---

## 2. Functional and content defects

1. **Hero image treatment is washed out.** The image is rendered at 30% opacity beneath a 70% soft overlay, removing texture and focal interest while still paying the image cost.
2. **Hero copy begins defensively.** The introduction explains independence before explaining what the visitor will learn.
3. **No concise introduction to the Guide exists.** The route jumps directly from hero/disclaimer into star cards.
4. **Independence language is repeated.** It appears in the hero, a dedicated “Independent platform” callout, the continuation copy, and multiple footer lines.
5. **Internal vocabulary leaks into customer copy.** `roster`, `dataset`, and imported-source dates appear in education/footer surfaces.
6. **The main educational model is three generic cards.** Visual equality becomes visual sameness and provides no narrative progression.
7. **Three-star receives dark featured styling.** It reads as a Dining Passport recommendation or promoted tier rather than an explanation of Michelin’s hierarchy.
8. **The cards explain meanings only in one sentence.** They do not help a newcomer understand the difference in practical terms.
9. **Evaluation principles are missing.** Ingredients, technique, harmony, personality, and consistency are not explained.
10. **Consistency is underdeveloped.** The page does not explain consistency across a menu/visits, reassessment, or changing distinctions.
11. **The page does not separate public facts from unknown inspector detail.**
12. **Michelin Selected is missing.**
13. **Bib Gourmand is framed mainly as excluded from local totals.** Its consumer meaning is secondary.
14. **Green Star is framed mainly as unsupported locally.** The public sustainability meaning needs a clearer explanation.
15. **No explicit current-catalog scope statement covers all other distinctions.**
16. **The source link goes only to the Michelin Guide homepage.** It does not direct readers to the relevant explanation pages.
17. **The continuation section presents three near-peer buttons.** It does not establish one primary next step.
18. **The star CTAs embed counts in labels.** Count changes alter action labels and create unnecessary verbosity for assistive technology.
19. **The route loading state is a generic taxonomy hero/bento/card skeleton.** It does not match the educational layout.
20. **Hero uses a raw `<img>` path without a responsive variant contract.**
21. **The footer remains inconsistent with the approved shared-shell plan.** It repeats primary navigation, account, totals, dates, roster language, coverage caveats, and disclaimers.
22. **Current tests encode the existing weak hierarchy.** They require “Independent platform” and “Beyond the Stars” rather than verifying evaluation principles, Selected, source quality, or controlled disclaimer repetition.

---

## 3. Product goal

Help a visitor understand Michelin restaurant distinctions in a few minutes, then make a confident transition into Dining Passport discovery.

The page must feel:

- editorial rather than institutional;
- factual without pretending to know confidential methods;
- visually composed rather than card-generated;
- useful to a first-time reader;
- clearly independent without leading with legal defense;
- connected to the Passport idea of stops, detours, and journeys;
- respectful of Michelin’s terminology without imitating Michelin’s identity.

The page must not:

- imply Dining Passport awards or verifies distinctions;
- imply online ratings, popularity, price, décor, or formality determine Stars;
- imply all Guide distinctions are a single quality ladder;
- advertise unsupported Bib/Green/Selected filters;
- reproduce Michelin logos, star artwork, the Michelin Man, or red-guide styling;
- use fake inspector or anonymous-review imagery.

---

## 4. Final information architecture

Final order:

1. Shared header
2. Editorial hero
3. Concise introduction to the Michelin Guide
4. One-, two-, and three-star progressive story
5. Evaluation principles
6. Consistency and changing distinctions
7. Other distinctions: Bib Gourmand, Green Star, Michelin Selected
8. Explore-by-star continuation
9. Sources and scope
10. Shared footer

### Why this order

- The visitor learns what the Guide is before decoding its symbols.
- Star meanings remain the first major educational task.
- Evaluation criteria follow the hierarchy rather than interrupting it.
- Consistency gets its own explanation because it covers both menu breadth and repeat visits.
- Other distinctions come after Stars so they are not misread as levels four through six.
- Discovery comes after understanding, not before.
- Independence/source information appears once near the end and once in the approved shared footer.

### Combined/removed sections

- Remove the standalone independence callout near the top.
- Combine source links, current Dining Passport scope, and the contextual independence sentence into one restrained Sources and scope section.
- Remove a separate coverage-limitation section from this educational route; regional coverage belongs on Source information and relevant discovery pages.
- Do not add an inspector biography, timeline of Michelin corporate history, FAQ accordion, or global distinction totals.

---

## 5. Recommended editorial direction

### Approaches evaluated

| Approach | Strength | Risk | Decision |
| --- | --- | --- | --- |
| Large editorial dining photograph | Immediate atmosphere | Repeats current image-led hero and can overpower education | Supporting device, not the structure |
| Typographic star-level storytelling | Clear hierarchy and brand independence | Can become austere without texture | **Primary structural direction** |
| Custom route/journey illustration | Connects Stop/Detour/Journey to Passport | Can feel like a theme-park map | Approved fallback motif only |
| Ingredient and craft imagery | Reinforces food-focused criteria | Rights coverage and sourcing required | **Primary visual material** |

### Final recommendation

Use **typographic progression supported by verified ingredient-and-craft photography**.

- Hero: editorial split between teaching copy and one verified close crop of ingredients, hands plating, cooking technique, or a table detail.
- Star story: three broad horizontal bands with a quiet route line and `01 / 02 / 03` distinction index.
- Evaluation: text-first definition list with small material/craft crops or abstract textures, never vague icon tiles.
- Other distinctions: editorial glossary rows separated by thin dividers.

Primary photography must be licensed, source-verified, non-branded, and not presented as an inspector or named Michelin representative. If no approved media exists, use an abstract Dining Passport route motif made from lines, waypoints, subtle paper texture, and restrained gold—not generated luxury-restaurant imagery.

---

## 6. Hero copy options

### Option A — recommended

**Headline:** What One, Two, and Three Michelin Stars Mean

**Supporting copy:** A concise guide to how the Michelin Guide describes its Stars, the cooking principles it publishes, and the other distinctions diners may encounter.

Why: says exactly what the visitor will learn, supports search intent, and avoids claiming insider access.

### Option B

**Headline:** From a Stop to a Special Journey

**Supporting copy:** Understand the published meaning behind each Michelin Star—and how inspectors describe quality, craft, personality, and consistency.

Why: strongest Passport connection, but the headline alone is less explicit for an unfamiliar visitor.

### Option C

**Headline:** How Michelin Stars Are Evaluated—and How They Change

**Supporting copy:** Learn the five public cooking principles, the difference between one, two, and three Stars, and how annual reassessment works.

Why: strong factual framing, but it underplays Bib Gourmand, Green Star, and Michelin Selected.

### Final copy decision

Recommend Option A as H1. Use `Worth a stop → Worth a detour → Worth a special journey` as a supporting line beneath the introduction, explicitly attributed as Michelin’s published travel-language progression.

---

## 7. Final hero specification

### Content

- Eyebrow: `A guide to the distinctions`
- H1: `What One, Two, and Three Michelin Stars Mean`
- Supporting copy from Option A
- Small supporting line: `Michelin describes the progression as worth a stop, worth a detour, and worth a special journey.`
- No primary discovery CTA in the hero.
- Optional text anchor: `Explore the distinctions`, linking to `#star-meanings`.

The hero teaches before it asks the visitor to leave.

### Visual composition

- Desktop: 12-column split, seven columns copy and five columns media.
- Media: one 4:5 or 3:4 craft/ingredient image with an intentional crop.
- Do not use the image as a low-opacity full-bleed background.
- Add one thin gold route line connecting three small Dining Passport waypoints; no official star icons.
- Forest headline on ivory/paper.
- Gold is an accent, not a metallic gradient.
- No Michelin red.

### Height

- 1440: approximately 480–520px below header.
- 1280: approximately 460–500px.
- 1024: approximately 420–460px.
- 768 and below: content-driven; do not force a tall viewport hero.

### Contrast and semantics

- Text sits on a solid surface, not directly over photography.
- H1 contrast meets WCAG AA.
- Decorative route motif is `aria-hidden`.
- Image is decorative when it does not teach a specific fact; use `alt=""`.
- If a meaningful craft image is selected, alt describes the action, not a mood or unnamed restaurant identity.

### Loading/fallback

- Reserve media geometry before load.
- Hero copy server-renders immediately.
- Responsive AVIF/WebP/JPEG variants use intrinsic dimensions.
- Image failure swaps to the abstract route motif without changing hero height.
- No blur overlay that leaves text contrast dependent on image completion.

---

## 8. One-star specification

### Public meaning

**Label:** One Michelin Star  
**Travel label:** Worth a stop  
**Plain-language meaning:** High-quality cooking

### Editorial copy

> Michelin describes One-Star restaurants as using high-quality ingredients and preparing distinctive dishes to a consistently high standard. For a diner, it signals a restaurant worth making part of the plan when the journey passes nearby.

This is a Dining Passport paraphrase of Michelin’s published description, not an independent assessment.

### Visual treatment

- Index `01`.
- One Dining Passport distinction mark plus full text `One Michelin Star`.
- Quiet ivory field with a small ingredient/craft crop.
- Route begins at the first waypoint.
- Equal text scale and CTA treatment with the other levels.

### Discovery

- Contextual CTA: `Explore one-star restaurants`
- Destination: `/stars/1`
- Supporting filtered-directory link may use `/explore?stars=1`.
- Dynamic count appears as small supporting text, for example:

  `216 one-star restaurants in the current U.S. Dining Passport collection`

  The number is derived; the sentence is a presentation template.

### Accessibility

- Visible text contains the complete meaning.
- Any repeated star glyph is decorative.
- Link accessible name remains `Explore one-star restaurants`; do not force the count into the link label.

---

## 9. Two-star specification

### Public meaning

**Label:** Two Michelin Stars  
**Travel label:** Worth a detour  
**Plain-language meaning:** Excellent cooking

### Editorial copy

> Michelin describes Two-Star restaurants as places where personality and talent are evident in expertly made, refined, and inspired dishes. The distinction suggests a meal worth adjusting the route to experience.

### Visual treatment

- Index `02`.
- Two Dining Passport distinction marks plus complete text.
- Reverse the desktop band’s media/text position to create editorial rhythm.
- Route line bends gently toward the second waypoint; avoid literal roads, cars, or theme-park graphics.
- Slightly deeper forest tint is allowed, but information weight remains equal.

### Discovery

- CTA: `Explore two-star restaurants`
- Destination: `/stars/2`
- Optional direct directory link: `/explore?stars=2`
- Dynamic current-U.S.-collection count uses the shared count template.

### Accessibility

- Complete text alternative: `Two Michelin Stars — excellent cooking, worth a detour`.
- Color and two visual marks are supplementary only.

---

## 10. Three-star specification

### Public meaning

**Label:** Three Michelin Stars  
**Travel label:** Worth a special journey  
**Plain-language meaning:** Exceptional cuisine

### Editorial copy

> Michelin presents Three Stars as its highest restaurant distinction, recognizing superlative cooking at an exceptional level of craft and expression. Its travel-language meaning is a restaurant worth planning a special journey around.

### Visual treatment

- Index `03`.
- Three Dining Passport distinction marks plus complete text.
- A controlled deep-forest band may close the progression, but it must not resemble a promoted Dining Passport recommendation.
- Use high-contrast ivory text and restrained gold.
- Do not make the Three-Star band substantially taller than the others.

### Discovery

- CTA: `Explore three-star restaurants`
- Destination: `/stars/3`
- Optional directory link: `/explore?stars=3`
- Dynamic count uses the same current-U.S.-collection label.

### Accessibility

- Complete visible text: `Three Michelin Stars — exceptional cuisine, worth a special journey`.
- Never communicate highest level only through darkness, gold, or three glyphs.

---

## 11. Evaluation-principles specification

### Heading

**What Michelin says inspectors consider**

### Introductory copy

> Michelin publicly describes five universal cooking principles. Dining Passport summarizes those published principles here; Michelin does not disclose every detail of individual inspections or deliberations.

### Five principles

Use a semantic ordered list or definition list:

1. **Ingredients**  
   The quality and suitability of the ingredients used.

2. **Technique**  
   Mastery of cooking and culinary methods—how precisely the kitchen handles preparation and execution.

3. **Harmony**  
   How flavors work together across a dish rather than competing or feeling disconnected.

4. **Personality**  
   The distinctive point of view expressed through the cuisine, not celebrity, décor, or marketing.

5. **Consistency**  
   Whether the standard holds across the menu and over time, including repeat visits.

### Visual structure

- Desktop: editorial two-column section.
  - Left: heading, intro, small food-focused note.
  - Right: numbered list with dividers and 2–3 sentence explanations.
- Do not use five generic icon cards.
- A small relevant crop may accompany Ingredients/Technique, but every principle remains understandable without it.
- At 768/mobile, the numbered rail persists and provides a visual reading path.

### What Stars do not directly measure

Include one clearly separated note:

> Michelin states that Stars concern the cooking on the plate. Décor, table setting, luxury, and formality do not determine a Star. Popularity, Google ratings, and Dining Passport activity are not part of this explanation.

Do not generalize this statement to every non-Star symbol or every aspect of the wider Guide.

---

## 12. Consistency/change explanation

### Heading

**A distinction can change**

### Copy direction

- Michelin says it reassesses Starred restaurants annually.
- Michelin says inspectors dine as many times as needed to understand a restaurant and resolve uncertainty.
- Consistency covers both the menu and different visits.
- A restaurant may gain, retain, or lose a distinction as published selections change.
- A displayed distinction represents a published Guide selection for a particular edition/period; it is not a permanent property.

Recommended copy:

> Michelin’s published process emphasizes repeat understanding rather than a single snapshot. Starred restaurants are reassessed, and inspectors may return as often as needed to reach a complete view. That means distinctions can be gained, retained, or lost when a new selection is published.

### Visual treatment

Use a restrained three-step editorial sequence:

```text
Visit and assess → Compare for consistency → Publish or update the selection
```

This is an explanatory summary, not a claim about confidential workflow or a guarantee that every restaurant follows an identical visit count.

### Freshness boundary

- This educational page explains the concept only.
- Restaurant detail pages should later show a concise source/freshness label tied to the canonical distinction record.
- Source information should explain collection update practices.
- Do not expose workbook, import, scrape, ingestion, or pipeline terminology.
- Do not turn this page into a live audit table.

---

## 13. Bib Gourmand specification

### Meaning

> Bib Gourmand recognizes restaurants offering good-quality cooking at a comparatively good value. Michelin’s price threshold varies by place because local costs differ.

### Boundaries

- Bib Gourmand is not a Michelin Star.
- It is not “below one star” in a linear hierarchy.
- It concerns the relationship between quality and local value criteria.
- Do not use the Bibendum/Michelin Man artwork or a copied Bib icon.

### Dining Passport status

> Dining Passport currently catalogs Michelin-starred U.S. restaurants only. Bib Gourmand restaurants are not currently included as a filter or local count.

No local discovery CTA appears until the catalog supports the distinction.

### Visual treatment

- Editorial glossary row with label `Good quality, good value`.
- Dining Passport text/abstract mark only.
- Same hierarchy as Green Star and Selected; no star-count styling.

---

## 14. Green Star specification

### Meaning

> Michelin describes the Green Star as an annual distinction highlighting restaurants at the forefront of sustainable practices. Public examples include ingredient sourcing, seasonality, waste reduction, resource management, and wider environmental or ethical commitments.

### Boundaries

- It is not a higher or lower cooking-quality tier.
- A restaurant may hold a Green Star alongside another Guide distinction.
- Michelin says there is no single formula because practices depend on the restaurant and region.
- Dining Passport does not independently audit sustainability claims.
- Do not use Michelin’s Green Star artwork.

### Dining Passport status

> Dining Passport does not currently model Green Star status as a filter, badge, or local count.

### Visual treatment

- Editorial glossary row labeled `Sustainability practices`.
- Forest/leaf color may support the text, but do not rely on green alone.

---

## 15. Michelin Selected specification

### Meaning

> Michelin Selected restaurants are included in the Guide without receiving a Star or Bib Gourmand distinction. Inclusion means Michelin’s inspectors consider the restaurant worthy of recommendation; it is not a zero-star or lower-star category.

### Boundaries

- Do not label it `0 Stars`.
- Do not present it as equivalent to Bib Gourmand.
- Do not imply all restaurants without a Star are Selected.
- Do not create a Selected filter or route before canonical support exists.

### Dining Passport status

> Dining Passport currently catalogs Michelin-starred U.S. restaurants only. Michelin Selected restaurants are not currently included in local counts or discovery filters.

Future support may be considered only after a canonical source, rights review, route/filter design, and product approval. The educational page must not promise it.

### Visual treatment

- Editorial glossary row labeled `Included in the Guide`.
- Neutral forest/ivory treatment with no star glyph.

---

## 16. Explore-continuation behavior

### Contextual links

Each Star band owns one clear contextual action:

- `/stars/1` — Explore one-star restaurants
- `/stars/2` — Explore two-star restaurants
- `/stars/3` — Explore three-star restaurants

The Star route provides the editorial distinction overview; its existing Explore link can continue to the complete filtered directory.

### Final continuation section

Heading: **Find your next restaurant**

Primary action:

- `Explore all restaurants` → `/explore`

Supporting text links:

- `Open the Map` → `/map`
- `Return to the Star levels` → `#star-meanings`

Do not place five equal buttons in one row. The three Star links are already contextual; the final section needs one primary action and two quieter links.

### State preservation

- Star links use the existing route architecture.
- Direct directory links use canonical `stars=1|2|3`.
- Map links may add a star parameter only when invoked from a specific Star context; the general bottom link opens `/map`.
- All links remain normal URLs that work without client JavaScript.

---

## 17. Counts and data behavior

### Decision

Show star-level counts as restrained supporting text because they help the visitor understand Dining Passport’s current U.S. collection. Do not make counts the headline or imply they are global Michelin totals.

### Source

- Derive counts server-side from the canonical restaurant summary.
- Do not ship all restaurant records to calculate three numbers.
- Use a server helper that returns only:

```ts
type StarCountSummary = {
  one: number;
  two: number;
  three: number;
  total: number;
};
```

This is a conceptual contract, not implementation authorization.

### Label

Use:

> {count} {star-level} restaurants in the current U.S. Dining Passport collection

Do not use:

- global Michelin total;
- roster;
- dataset;
- imported total;
- all U.S. Michelin restaurants unless coverage supports that claim.

### Change/loading/failure

- Counts update automatically when the canonical source changes.
- Count changes do not require editorial-copy edits.
- Server-render counts with the page when available.
- If count retrieval fails, omit the count line and keep the educational copy and CTA.
- Do not render `0` as a loading placeholder.
- Reserve a small optional line-height only if streaming causes visible transition.
- If a valid distinction truly has zero local results, say `No restaurants are currently listed in this U.S. collection` and replace its contextual CTA with `Explore all restaurants`.

---

## 18. Source and independence treatment

### One restrained section

Heading: **Sources and scope**

Body:

> This guide paraphrases Michelin’s publicly stated descriptions of its restaurant distinctions and evaluation principles. Michelin does not publicly disclose every detail of individual inspections. Restaurant distinctions shown in Dining Passport are based on published Michelin Guide information.

Current-catalog statement:

> Dining Passport currently catalogs Michelin-starred restaurants in its U.S. collection. Bib Gourmand, Green Star, and Michelin Selected are explained here but are not currently available as local filters or counts.

### Official links

Show a compact Learn more list near the end, not links in every paragraph:

- [What is a MICHELIN Star?](https://guide.michelin.com/en/article/features/what-is-a-michelin-star)
- [The MICHELIN Guide 101](https://guide.michelin.com/en/article/features/the-michelin-guide-101)
- [Everything You Want to Know About the MICHELIN Guide Inspectors](https://guide.michelin.com/us/en/article/features/everything-you-want-to-know-about-the-michelin-guide-inspectors)
- [What is a MICHELIN Green Star?](https://guide.michelin.com/ae-du/en/article/features/what-is-a-michelin-green-star-dubai)

Each link says it opens the official Michelin Guide source in a new tab.

### Independence

Use the approved shared-footer disclaimer once:

> Dining Passport is an independent discovery platform and is not affiliated with the Michelin Guide.

Do not repeat it in the hero, Star bands, principles, other distinctions, and continuation.

### Consumer vocabulary

The route and footer must not display:

- dataset;
- roster;
- workbook;
- import;
- ingestion;
- scrape;
- pipeline.

---

## 19. Desktop layout

### 1440px

- Content maximum: 1280px.
- Outer gutters: 64px.
- Hero: 12-column 7/5 split, approximately 500px.
- Guide introduction: 8-column reading block, maximum 760px.
- Star story: three full-width editorial bands, 220–280px each.
- Alternating media/text placement creates rhythm; all meanings remain in consistent positions relative to the index rail.
- Travel route line occupies a narrow left rail and never crosses text.
- Principles: 5/7 split, sticky intro permitted only when it does not create excessive blank space.
- Consistency: full-width paper panel with three textual steps.
- Other distinctions: three horizontal glossary rows or a 3-column text layout with equal heading/body rhythm; no generic cards.
- Continuation: centered primary button with two text links.
- Sources: maximum 840px, thin top divider.
- Footer uses the approved simplified shared footer.
- Section spacing: 96–112px major, 48–64px internal.

### 1280px

- Outer gutters: 48px.
- Hero: 7/5 split, approximately 480px.
- Star bands remain horizontal.
- Principles remain 5/7.
- Other distinctions may use three columns if each stays at least 280px; otherwise use one full-width row per distinction.
- Section spacing: 80–96px.

### 1024px

- Outer gutters: 32px.
- Hero: 6/6 split, approximately 440px.
- Headline maximum 48px.
- Star bands use a 96px distinction/index rail plus flexible text/media.
- Principles use 4/8 or stack heading above the definition list if lines become cramped.
- Other distinctions use one row each with heading in a 4-column lead and body in eight columns.
- CTA group remains one primary plus text links.

---

## 20. Tablet layout

### 768px

- Outer gutters: 24px.
- Hero stacks copy above a 260px media crop; the route motif bridges them.
- H1: 40–44px with balanced line breaks.
- Introduction stays under 68 characters per line.
- Star story does not become three full cards. Use one vertical narrative with:
  - 72px index/route rail;
  - distinction label and meaning;
  - compact optional image crop;
  - contextual link.
- Alternate crops may move above/below text, but the reading order remains identical.
- Principles: heading, intro, then a numbered definition list.
- Consistency steps become three columns only if each supports readable text; otherwise use a connected vertical sequence.
- Other distinctions: full-width glossary rows.
- Final CTA stacks primary full-width above two inline/stacked text links.
- Sources use one column.
- Footer remains the canonical shared footer; no education-specific duplicate.
- Section spacing: 72–80px.

### Orientation

- Tablet landscape may retain the 1024-style star band.
- Orientation changes do not change content order or hide any distinction.
- No fixed decorative element creates overflow.

---

## 21. Mobile layout

Applies to 430px, 390px, and 375px.

### Hero

- Text first.
- H1:
  - 430: 36–38px;
  - 390: 34–36px;
  - 375: 34px minimum target, allowed to wrap naturally.
- Supporting copy: 16px, comfortable leading.
- Media crop:
  - 430: approximately 220px;
  - 390: approximately 200px;
  - 375: approximately 184–200px.
- Route motif remains behind/alongside the image, never behind body text.

### Star story

- One connected vertical sequence, not three stacked bordered cards.
- Left rail: `01`, `02`, `03` plus subtle line/waypoints.
- Body: label, travel phrase, explanation, optional count, text action.
- Three-Star may use a forest band but keeps the same internal spacing and text scale.
- Images become narrow 16:9/3:2 crops between heading and body or are omitted; do not add three tall 4:3 images.

### Principles

- Semantic numbered definition list.
- One principle per divided row.
- Short visible label plus complete explanatory text.
- No horizontal icon strip.

### Other distinctions

- Always-visible glossary sections; do not hide core education in accordions.
- Each has a complete label, meaning, boundary, and current Dining Passport status.

### Actions/source/footer

- Contextual Star actions are full-width text/button targets of at least 44px.
- Final Explore action is full-width primary.
- Map and return-to-stars are text links with 44px hit areas.
- Sources stack.
- External-link context is visible or available to assistive technology.
- Footer uses the simplified one-column mobile layout.

### Overflow

- No horizontal document overflow at 430, 390, or 375px.
- Route/index rails use fixed internal width inside the content box.
- Long source URLs are never rendered as visible bare URLs.
- Focus outlines and decorative lines are contained within the viewport.

---

## 22. Component tree

```text
AppChrome
├── AppHeaderClient
├── MichelinEducationPage
│   ├── MichelinEducationHero
│   │   ├── HeroCopy
│   │   └── EditorialMedia | JourneyMotifFallback
│   ├── MichelinGuideIntroduction
│   ├── StarMeaningStory
│   │   ├── StarMeaningBand (one)
│   │   ├── StarMeaningBand (two)
│   │   └── StarMeaningBand (three)
│   ├── EvaluationPrinciples
│   │   └── EvaluationPrinciple × 5
│   ├── DistinctionChangeNote
│   ├── OtherDistinctions
│   │   ├── BibGourmandExplanation
│   │   ├── GreenStarExplanation
│   │   └── MichelinSelectedExplanation
│   ├── EducationContinuation
│   ├── EducationSources
│   └── EducationAnalytics (optional minimal client island)
└── SiteFooter
```

The page and content components are server components. Only restrained analytics observation, if approved and consent-compatible, needs a client boundary.

---

## 23. Content architecture

### V1 recommendation

Use a **typed content configuration in React/TypeScript**, merged with dynamic server-derived counts.

Recommended location:

`src/content/michelin-education.ts`

Conceptual shape:

```ts
type MichelinEducationSource = {
  id: string;
  title: string;
  url: string;
  publisher: "Michelin Guide";
  reviewedAt: string;
};

type MichelinEducationContent = {
  contentOwner: string;
  reviewedAt: string;
  hero: {
    eyebrow: string;
    headline: string;
    introduction: string;
  };
  guideIntroduction: string[];
  starLevels: Record<1 | 2 | 3, {
    label: string;
    travelMeaning: string;
    plainMeaning: string;
    body: string;
    href: `/stars/${1 | 2 | 3}`;
  }>;
  principles: Array<{
    id: "ingredients" | "technique" | "harmony" | "personality" | "consistency";
    label: string;
    body: string;
  }>;
  otherDistinctions: Array<{
    id: "bib-gourmand" | "green-star" | "selected";
    label: string;
    body: string;
    catalogStatus: string;
  }>;
  sources: MichelinEducationSource[];
};
```

### Why typed configuration

- One controlled editorial page does not justify a CMS.
- Copy changes receive code review.
- Source links, review dates, owners, CTA routes, and forbidden terms are testable.
- Server code can merge counts without shipping the catalog.
- Type checking prevents missing star levels/principles.
- Content stays separate from layout components.

### Why not MDX/CMS in V1

- MDX adds a rendering/plugin surface without providing meaningful authoring benefit for one structured page.
- A CMS adds authentication, preview, schema, caching, and failure modes disproportionate to the need.
- Revisit only when multiple non-engineering editors or a broader editorial library requires it.

### Governance

- Required owner role: Product/content owner.
- Required fact review: on source change and at least annually.
- Store `reviewedAt` in content metadata but do not expose an internal audit date as prominent page copy.
- Tests reject forbidden consumer terms and unsupported local routes.
- Source URLs are reviewed manually; the page never depends on live scraping or runtime source availability.

---

## 24. Loading states

### Normal path

The editorial copy and counts should server-render together. A mostly static educational page should not show a long loading skeleton during normal navigation.

### Route transition

- Render a page-specific skeleton matching:
  - split hero;
  - one introduction block;
  - three horizontal bands;
  - principles list;
  - sources/footer.
- Preserve the final hero/media geometry.
- Use no grid of fake restaurant cards.
- One polite `Loading Michelin Stars guide` status is sufficient.

### Media

- Hero/media wrapper reserves its ratio.
- Below-fold crops lazy-load.
- Abstract fallback is available immediately.
- No shimmer behind body text.

### Counts

- Prefer server inclusion.
- If later streamed, reserve one optional metadata line.
- Do not announce each count separately.
- Do not block educational text or links while counts load.

---

## 25. Error and partial-data states

| Failure | Behavior |
| --- | --- |
| Dynamic counts fail | Omit count lines; keep all explanations and valid Star links |
| Hero media fails | Replace with abstract route motif at the same dimensions |
| Below-fold media fails | Use quiet paper/route fallback; do not show broken-image UI |
| One Star level has zero local matches | Explain the distinction; say none are currently listed; link to Explore all |
| Catalog temporarily unavailable | Render full education and sources; omit all local counts |
| Source link later becomes unavailable | Page copy remains; do not perform a blocking runtime availability check; flag during scheduled content review |
| Editorial config is invalid at build | Fail build/type validation rather than ship partial or invented copy |
| Route-level rendering fails unexpectedly | Focused page error with Retry and links to Explore/Home; do not blame Michelin or the catalog |
| Footer/source-information route unavailable | Preserve this page’s Sources section; shared-shell work must add the approved route before release |

A count or image failure never replaces the whole page with an error screen.

---

## 26. Accessibility requirements

- One H1; H2s follow the final section order; H3s label Star levels, principles only when semantically nested, and other distinctions.
- Star meanings are complete visible text.
- Star glyphs, indices, route lines, gold, and dark backgrounds are supplementary.
- Use semantic ordered/definition lists for principles and source links.
- Do not use a custom listbox/card role for normal links.
- Link labels identify the destination: `Explore two-star restaurants`, not `Learn more`.
- External official-source links announce new-tab behavior.
- Decorative media uses empty alt; meaningful media has action-specific alt.
- No fake inspector imagery or alt language implying official access.
- Focus styles are visible, at least 2px, and not clipped by route rails.
- Contrast meets WCAG AA in forest/ivory/gold combinations.
- Touch targets are approximately 44×44.
- Reduced motion removes route-line drawing, image parallax, and content reveals.
- No autoplaying video.
- Screen readers encounter the criteria in the same order as sighted readers.
- Count updates, if streamed, use one quiet group status rather than three competing live regions.
- At 200% zoom/effective 320px, all content remains available without two-dimensional scrolling.

---

## 27. Performance requirements

- Server-render editorial content and count summary.
- No shipment of the full restaurant catalog for counts.
- No MapLibre bundle on this route.
- No Google Places script/UI.
- Minimal or zero client JavaScript for the page body.
- If analytics needs intersection observation, use one tiny client island and fire each section event once.
- Responsive image variants with intrinsic width/height.
- Hero image is the only potential priority image.
- Below-fold media lazy-loads.
- Stable image and skeleton dimensions prevent CLS.
- Cache the public `StarCountSummary` with the canonical source version.
- Do not make runtime requests to Michelin.
- Source content is reviewed/published locally.
- Avoid three separate count queries.
- Route-level error/loading surfaces match the page.
- Measure LCP, CLS, INP, total JS, image bytes, and count payload at all required widths.
- Target zero layout shift from media/counts and no client hydration for static paragraphs.

---

## 28. Analytics events

Use restrained events:

| Event | Allowed properties |
| --- | --- |
| `michelin_education_opened` | viewport class, referrer route family |
| `michelin_star_explore_selected` | level `1|2|3`, destination route |
| `michelin_principles_viewed` | once per page view |
| `michelin_other_distinctions_viewed` | once per page view |
| `michelin_source_opened` | source ID, not full URL |
| `michelin_explore_all_selected` | destination |
| `michelin_map_selected` | destination |

Rules:

- Do not record every paragraph, scroll percentage, hover, dwell time, or route-line interaction.
- Do not log private Passport state.
- Do not log exact user location.
- Do not capture arbitrary external URLs.
- Section-view events fire only when the section becomes meaningfully visible and at most once.
- Respect the site’s analytics consent/privacy architecture.

---

## 29. Files likely to change

This is a forecast for a later implementation plan, not authorization.

### Route/content

- `src/app/about-michelin-stars/page.tsx`
- `src/app/about-michelin-stars/loading.tsx`
- likely `src/app/about-michelin-stars/error.tsx`
- likely new `src/content/michelin-education.ts`
- `src/config/site.ts` only for approved shared copy cleanup
- `src/lib/data/restaurants.ts` or a focused count-summary helper

### Education presentation

- `src/components/stitch/education/MichelinEducationPage.tsx`
- `EducationHero.tsx`
- `EducationStarCards.tsx`
- `EducationStarCard.tsx`
- `BeyondTheStars.tsx`
- `EducationCtas.tsx`
- `IndependenceCallout.tsx`
- `adapters.ts`
- `models.ts`
- `index.ts`
- likely new introduction, progressive-story, principles, consistency, glossary, sources, fallback, and analytics components

### Shared

- `src/components/stitch/PageContainer.tsx`
- `src/components/stitch/restaurant/MichelinDistinction.tsx` only if its independent distinction treatment is reused without official artwork
- `src/components/shell/SiteFooter.tsx` after the approved shared-footer plan
- shared responsive media/fallback components after the media foundation
- `src/app/globals.css` only for approved tokens/layout utilities

### Tests/evidence

- `e2e/education.spec.ts`
- likely focused unit/content-contract tests
- `scripts/capture_taxonomy_education_baselines.mjs`
- screenshot verification artifacts under a new Stage 5 evidence directory

Exact filenames are not binding until an implementation plan inspects the then-current tree and the bundled Next.js guides.

---

## 30. Components to reuse

- `AppChrome`
- `AppHeaderClient`
- approved simplified `SiteFooter`
- `PageContainer`
- Literata/Inter and existing Dining Passport tokens
- `getTotals()` or a smaller derived count helper
- `/stars/{1|2|3}` routes
- `/explore?stars={n}` query contract
- `MichelinDistinction` text utilities, provided official artwork is not introduced
- shared responsive image/media registry foundation
- shared loading/error primitives after geometry is adapted
- SEO metadata helper

Reuse preserves truthful data and canonical shell behavior; it does not require keeping the current cards or repeated disclaimer structure.

---

## 31. Components to retire

- Current washed full-bleed `EducationHero` image treatment
- Top-of-page `IndependenceCallout`
- Three-identical-card `EducationStarCards` composition
- Dark “featured” Three-Star card treatment
- Count-in-CTA labels
- `BeyondTheStars` two-card layout
- Education copy that leads with exclusions/local roster status
- Current `EducationCtas` three-peer-button layout
- Education use of `roster`, `dataset`, and coverage/import language
- Generic `TaxonomyLoadingState` on the education route
- Map/Google-related dependencies if any later enter the education bundle
- Tests that require the `Independent platform` heading or accept missing Selected/principles content
- Repeated footer totals, dates, primary/account navigation, coverage caveat, and second disclaimer

Component names may be deleted, renamed, or repurposed only in a separately authorized implementation.

---

## 32. Risks and dependencies

| Risk/dependency | Severity | Response |
| --- | --- | --- |
| Educational copy overstates confidential inspection methods | High | Limit claims to reviewed official sources and label Dining Passport paraphrases |
| Michelin terminology changes | High | Typed sources, content owner, review date, annual review |
| Design imitates Michelin visual identity | High | Forest/ivory/gold system, numbered route, no red guide/logo/Michelin Man |
| Hero uses unverified/generated luxury imagery | High | Rights-verified craft media or abstract fallback |
| Counts imply global completeness | High | Label current Dining Passport U.S. collection; derive counts |
| Other-distinction sections imply unsupported filters | High | Explicit current starred-only scope; no local CTAs/counts |
| Footer cleanup is not implemented first | High | Treat shared-footer foundation as release dependency |
| `/source-information` or legal routes are missing | Medium | Complete shared-shell routes before final release |
| Content configuration becomes layout code | Medium | Keep typed content separate and merge counts in a server adapter |
| Page remains too long on mobile | Medium | Connected sequence, shallow media, definition rows, one primary continuation |
| Three-Star visual emphasis becomes product endorsement | Medium | Equal information/CTA weight and no promotional copy |
| Source availability changes | Medium | Scheduled validation; no runtime dependency |
| Section-view analytics adds unnecessary JS | Low | One optional minimal island or omit until analytics foundation exists |
| Star route pages still contain roster/import language | Medium | Track as a linked taxonomy dependency; do not expand Stage 5 into a full route redesign |

---

## 33. Acceptance criteria

### Product/content

- [ ] H1 is an approved explicit learning promise, not `The World of Michelin Stars`.
- [ ] Page explains what the Michelin Guide is before the Star hierarchy.
- [ ] One, Two, and Three Stars each include label, plain meaning, travel phrase, explanation, local discovery action, optional dynamic count, and text alternative.
- [ ] Stop/Detour/Special journey is clearly Michelin’s published meaning.
- [ ] Page explains Ingredients, Technique, Harmony, Personality, and Consistency in text.
- [ ] Consistency covers both menu breadth and repeat visits.
- [ ] Page explains annual reassessment and changing distinctions without inventing visit counts/workflow.
- [ ] Page says Stars concern cooking rather than décor/formality/popularity/Google ratings.
- [ ] Bib Gourmand, Green Star, and Michelin Selected are separate and not represented as Star levels.
- [ ] Current Dining Passport starred-only scope is explicit.
- [ ] No unsupported Bib/Green/Selected routes, filters, badges, or local counts appear.

### Editorial/visual

- [ ] Hero uses a split composition, verified craft/ingredient media, or approved abstract fallback.
- [ ] Hero is not a washed low-opacity background.
- [ ] Star levels use progressive editorial bands rather than three generic cards.
- [ ] Three-Star styling does not look like paid/personal promotion.
- [ ] Route motif is restrained and not a theme-park map.
- [ ] No Michelin logo, Michelin Man, red-guide imitation, or copied official star artwork appears.
- [ ] No fake inspector imagery appears.
- [ ] Forest, ivory, restrained gold, Literata, Inter, dividers, and whitespace remain coherent.

### Counts/actions

- [ ] 216/39/16 are derived from the canonical source in current test evidence and are not hardcoded in editorial content.
- [ ] Counts are labeled as Dining Passport’s current U.S. collection, not global Michelin totals.
- [ ] Count failure leaves education and CTAs intact.
- [ ] `/stars/1`, `/stars/2`, `/stars/3`, `/explore`, `/map`, and optional `/explore?stars={n}` links are valid and testable.
- [ ] One final primary continuation is visually dominant; five equal buttons do not appear.

### Source/independence/governance

- [ ] Official sources support the Star meanings, five criteria, reassessment, Bib, Green, and Selected copy.
- [ ] Michelin’s public statements and Dining Passport paraphrases are distinguishable.
- [ ] Sources appear in one restrained section.
- [ ] Contextual scope sentence appears once.
- [ ] Footer uses exactly the approved concise independence disclaimer.
- [ ] Hero, Star bands, principles, other distinctions, and CTA do not repeat the disclaimer.
- [ ] Customer-facing page/footer contain no dataset, roster, workbook, import, ingestion, scrape, or pipeline language.
- [ ] Content has typed source IDs, owner, review date, and testable CTA links.
- [ ] No CMS or runtime Michelin dependency is introduced in V1.

### Responsive/accessibility

- [ ] Explicit layouts pass at 1440, 1280, 1024, 768, 430, 390, and 375px.
- [ ] No horizontal overflow at any required width or 200% zoom.
- [ ] Mobile is a redesigned reading flow, not a naïve stack of desktop cards.
- [ ] Heading hierarchy, lists, links, source context, and alt/decorative handling are semantic.
- [ ] Every Star meaning is available as visible text.
- [ ] No information depends on icon count, line, color, image, or animation alone.
- [ ] Touch targets are approximately 44px.
- [ ] Focus is visible and unclipped.
- [ ] Reduced motion is honored.
- [ ] Contrast meets WCAG AA.

### Performance/error

- [ ] Editorial content server-renders.
- [ ] Count summary does not ship the restaurant catalog.
- [ ] No MapLibre or Google Places bundle loads.
- [ ] Images use responsive variants and stable dimensions.
- [ ] Below-fold media lazy-loads.
- [ ] CLS from media/counts is effectively zero.
- [ ] Count, media, source, and catalog failures remain distinct and non-blocking.
- [ ] Route loading/error surfaces match the educational composition.
- [ ] Analytics are restrained and omit invasive reading telemetry.

---

## 34. Screenshot verification plan

### Baseline set

Compare the redesign with the fresh 2026-07-18 Stage 1 captures and:

- `docs/ui-ux-rebuild/current/rejected-about-michelin-stars.png`
- `docs/designs/how_michelin_stars_work/screen.png`
- existing taxonomy/education baselines.

### Required captures

1. 1440 full page
2. 1440 hero
3. 1440 complete Star progression
4. 1440 principles
5. 1440 other distinctions
6. 1440 Sources and scope
7. 1280 full page
8. 1024 full page
9. 768 portrait full page
10. 768 landscape critical sections
11. 430 full page
12. 390 full page
13. 375 full page
14. hero-media failure at desktop/mobile
15. count failure with all copy/actions intact
16. zero-result Star level
17. route loading
18. route error
19. keyboard focus sequence
20. reduced-motion state
21. 200% zoom/effective 320px

### Measurements

- viewport and document widths;
- full-page height;
- header/hero/content/footer bounding boxes;
- H1 width/line count/size;
- hero and below-fold image dimensions/crops;
- Star band heights and route-rail containment;
- principle row dimensions;
- CTA and touch target dimensions;
- source link/focus geometry;
- footer copy and link set;
- horizontal overflow;
- LCP, CLS, INP;
- total/transferred JavaScript and image bytes;
- requests proving no MapLibre/Google load;
- console errors and failed requests;
- automated accessibility scan plus manual heading/keyboard review.

### Blocking comparison

The final review must prove:

- the hero photograph is intentional or replaced by the approved fallback, not washed out;
- education—not independence—is the first message;
- all five principles and three other distinctions are present;
- Star levels read as a connected progression rather than generic cards;
- mobile is materially shorter/clearer than the current 3880–3945px repetitive composition where content allows;
- counts remain truthful and secondary;
- no internal vocabulary/repeated disclaimer remains;
- discovery continuation is focused;
- no overflow exists;
- no MapLibre/Google bundle appears.

---

## 35. Approved decision log

The product owner approved these binding Stage 5 decisions on 2026-07-18:

1. **Hero headline:** use `What One, Two, and Three Michelin Stars Mean.`
2. **Visual direction:** use typographic progression supported by verified ingredient, kitchen-craft, or dining photography. Use the abstract Stop/Detour/Journey motif when approved photography is unavailable.
3. **Star layout:** use three connected horizontal editorial bands with a restrained `01 / 02 / 03` progression on desktop and one connected vertical reading sequence on mobile.
4. **Hero action:** do not place discovery CTAs in the hero. The only optional action is `Explore the distinctions`, linking to the Star meanings anchor.
5. **Counts:** allow small dynamically derived counts in each Star section and scope every count as `{count} {star-level} restaurants in the current U.S. Dining Passport collection`. Never hardcode them or imply Michelin global totals.
6. **Other distinctions:** keep Bib Gourmand, Michelin Green Star, and Michelin Selected as three always-visible glossary rows. Do not place them in accordions by default or add unsupported local routes/counts.
7. **Content architecture:** use typed TypeScript configuration in V1 with section IDs, headings, body copy, source references, content review date, content owner, CTA destinations, and optional dynamic-count keys. Do not introduce MDX or a CMS for this page.
8. **Analytics:** track page and intentional CTA events. Add section-view events only when the existing analytics layer supports one lightweight observer without hydrating the editorial page or introducing new analytics infrastructure.

No Stage 5 product decision remains open.

## Hard stop

Stage 5 ends with this approved specification. Do not implement the Michelin Stars redesign, modify production components, configure MapTiler, ingest media, create a CMS, commit, or push. Its next action requires a separately authorized implementation plan. Stage 6 is the Restaurant Detail redesign specification.
