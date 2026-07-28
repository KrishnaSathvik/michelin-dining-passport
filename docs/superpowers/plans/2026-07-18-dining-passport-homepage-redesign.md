# Dining Passport Homepage Redesign Specification

> **For agentic workers:** REQUIRED SUB-SKILL for any later implementation: use `superpowers:writing-plans` to create an implementation plan from this approved specification, then use `superpowers:subagent-driven-development` or `superpowers:executing-plans`. This Stage 2 document authorizes no production implementation.

**Goal:** Make the Homepage a premium, image-led entry into Michelin-starred restaurant discovery and the personal Dining Passport, with immediate paths to Explore and Map and restrained personalization for returning users.

**Architecture:** The page remains a server-rendered App Router route for public discovery content. It receives bounded, purpose-built view models for hero media, curated restaurants, three-star destinations, cities, and cuisines. One small client island reads identifier-based Passport activity and sync state after hydration; it never receives the restaurant catalog. All named-restaurant imagery resolves through the approved Stage 1 media registry.

**Tech Stack:** Next.js 16.2.10 App Router, React 19.2.4, TypeScript, Tailwind CSS 4, existing Literata/Inter typography, Supabase Storage ingestion-generated media variants, identifier-based Passport state, and Playwright 1.61.

## Global constraints

- This is a design and behavior specification, not production implementation.
- Do not modify production source, ingest assets, create migrations, commit, or push during Stage 2.
- The approved Stage 1 journey, media, shell, data-boundary, sync, and accessibility decisions are prerequisites.
- Do not reintroduce Want or restaurant-level Favorite.
- Do not pass the complete restaurant catalog into the Homepage or Passport provider.
- Do not scrape or imply rights to restaurant photography.
- Do not make a named restaurant appear with unrelated photography.
- Homepage hero photography must be a verified, licensed atmospheric dining image without recognizable restaurant branding; it must not represent a named restaurant.
- Do not require all 271 restaurants to have media before the Homepage is useful.
- Do not imitate Michelin branding, marks, layout, or visual language.
- Do not use internal words such as dataset, roster, import, ingestion, or workbook in consumer copy.
- Do not turn the Homepage into a duplicate Explore page, Map page, or Passport dashboard.

---

## 1. Current homepage findings

### Evidence reviewed

The current Homepage was inspected in the Stage 1 full-page captures at all required widths:

| Width | Evidence |
| --- | --- |
| 1440px | `output/playwright/stage1-foundation/home-1440.png` |
| 1280px | `output/playwright/stage1-foundation/home-1280.png` |
| 1024px | `output/playwright/stage1-foundation/home-1024.png` |
| 768px | `output/playwright/stage1-foundation/home-768.png` |
| 430px | `output/playwright/stage1-foundation/home-430.png` |
| 390px | `output/playwright/stage1-foundation/home-390.png` |
| 375px | `output/playwright/stage1-foundation/home-375.png` |
| Cross-width contact sheet | `output/playwright/stage1-foundation/contact-home.png` |

The fresh Stage 1 map captures were also considered because the redesigned Hero promotes Map:

- `output/playwright/stage1-foundation-2026-07-18/map-viewport-1440.png`
- `output/playwright/stage1-foundation-2026-07-18/map-production-1440.png`

They confirm that the current blank desktop map comes from an approximately 31,969px-tall container, not a MapLibre renderer failure. The Homepage may specify the Map CTA now, but production promotion depends on the approved container fix, MapTiler configuration, and truthful failure state.

Relevant implementation files were also inspected:

- `src/app/page.tsx`
- `src/components/stitch/home/HomepageView.tsx`
- `src/components/stitch/home/MarketingHero.tsx`
- `src/components/stitch/home/HomepageStatsStrip.tsx`
- `src/components/stitch/home/HomepageFeaturedSection.tsx`
- `src/components/stitch/home/adapters.ts`
- `src/components/stitch/restaurant/RestaurantDiscoveryCard.tsx`
- `src/components/stitch/restaurant/RestaurantMedia.tsx`
- `src/components/shell/AppHeaderClient.tsx`
- `src/components/shell/SiteFooter.tsx`
- `src/config/homepage.ts`
- `e2e/homepage.spec.ts`

### Verified strengths

- The current page has one clear H1, a stable global header, a bounded hero, and no duplicate page-level shell.
- Its hero crop and overlay remain legible across the seven widths.
- The featured grid correctly changes from three columns to two and then one.
- Save controls and reservation labels already use shared restaurant primitives.
- The current 390px test verifies no horizontal overflow.
- The page is server-rendered from bounded featured slugs rather than loading all restaurants specifically for its own content.

### Verified problems

1. **The first viewport has no action.** The hero contains a headline and supporting sentence but no Explore or Map CTA, so it does not answer what the visitor should do next.
2. **The headline is descriptive but not product-defining.** “America’s Michelin-starred tables” says what the catalog contains but not what Dining Passport enables.
3. **The hero image has no recorded media provenance in the approved contract.** It is a 2400×1600 local atmospheric JPEG, but the existing component treats it as decorative and does not connect it to verified source, usage basis, credit, verification date, focal point, or ingestion variants.
4. **The page leads with statistics instead of discovery.** The four-stat strip presents 271 / 216 / 39 / 16 as a data summary. Star-tier inventory is accurate but not a compelling next action.
5. **Every named restaurant currently renders as initials.** The source records have no image fields, so the three featured cards are guaranteed to fall back until the Stage 1 media registry and pilot assets exist.
6. **Featured selection is static but not editorially explained.** Three configured slugs provide geographic and star-level variety, but the user sees “Featured Restaurants” without a stated selection lens or update cadence.
7. **The page does not introduce the personal Passport.** Save icons appear without explaining Save → Plan → Visit or the privacy/local-versus-synced model.
8. **There is no city or cuisine entry point.** Visitors who do not know a restaurant name must jump to Explore before seeing familiar browsing dimensions.
9. **The current page does not adapt for returning users.** An upcoming visit, recent save, or sync failure is invisible.
10. **The footer repeats developer-facing source language and disclaimers.** “Dataset current,” “roster,” and multiple independence/source paragraphs conflict with the approved shared-shell copy.
11. **Mobile is honest but long and visually repetitive.** Three full initials cards plus full-width reservation buttons dominate the page without adding photographic or editorial variety.
12. **Current tests encode the weak information architecture.** They require the statistics strip and assert the absence of city, cuisine, and Passport modules; those assertions must be replaced rather than carried forward.

### Root-cause distinction

The Homepage problem is not primarily component polish. It is a dependency and hierarchy problem:

- named media cannot improve until verified media exists;
- personalization cannot be truthful until the journey/outbox model exists;
- shell copy cannot be final until the shared footer work lands;
- the current component tree contains only Hero → Stats → Featured, so essential product meaning is structurally absent.

---

## 2. Homepage product goal

The Homepage should feel like the opening spread of an editorial dining atlas with a personal bookmark already tucked inside it. Its job is to orient and invite, not to expose every filter or every Passport metric.

Within the first viewport, the visitor must understand:

1. Dining Passport covers Michelin-starred restaurants across the United States.
2. It helps people discover restaurants, save them, plan meals, and remember visits.
3. Explore is the primary path and Map is the geographic alternative.
4. The product is independent, without borrowing Michelin’s branding.

### Primary user jobs

1. “Show me restaurants worth considering.”
2. “Let me browse somewhere I am going.”
3. “Help me keep track of where I want to eat.”
4. “Bring me back to the next thing in my Passport.”

### Success definition

The redesign succeeds when a new visitor can choose Explore or Map without scrolling, a returning visitor can continue one meaningful Passport action without entering a dashboard, and every visible named-restaurant image is rights-safe and truthful.

### Design direction

Adopt an **Editorial Atlas with a Personal Bookmark**:

- asymmetrical split hero rather than a generic centered stock-photo banner;
- Literata for editorial hierarchy and Inter for controls/body;
- existing forest, paper, burgundy, and restrained gold tokens;
- large media planes only when verified assets exist;
- hairline atlas rules and one narrow vertical “Save · Plan · Remember” spine as the signature device;
- no literal passport stamps, Michelin-red mimicry, black-and-gold luxury styling, glassmorphism, or card wall.

The deliberate aesthetic risk is the narrow vertical journey spine between hero copy and photography on wide screens. It creates a recognizable Dining Passport motif without becoming decorative noise. At tablet/mobile widths it becomes a horizontal three-part line below the copy.

---

## 3. Final section order

| Order | Section | Decision | Why it earns its place |
| --- | --- | --- | --- |
| 1 | Shared header | Keep | Establishes brand, navigation, global search, and account state. Uses the approved shared shell. |
| 2 | Editorial hero | Keep and redesign | Must explain the product and expose Explore/Map actions immediately. |
| 3 | Curated featured restaurants | Keep; use one of three fixed adaptive compositions | Provides concrete discovery proof without allowing media availability to create arbitrary layouts. |
| 4 | Adaptive Passport module | Combine two requested ideas | Serves as the Passport value explanation for new users and restrained continuation for returning users in the same stable slot. |
| 5 | Three-star destinations | Keep, but make editorial rather than another card grid | Communicates the high-distinction end of coverage and supports destination planning. |
| 6 | Browse your way in | Combine major city and cuisine browsing | City and cuisine both earn a place, but two separate full sections would lengthen and fragment the page. |
| 7 | Coverage and source line | Keep, reduce to one sentence | Gives scale and transparency without a statistics dashboard. |
| 8 | Shared footer | Keep and simplify | Supplies approved identity, disclaimer, legal, contact, and source links once. |

### Removed standalone sections

- **Statistics strip:** retire. Inventory by star tier does not help the visitor decide what to do next.
- **Separate returning-user dashboard:** do not create. Returning behavior belongs in the adaptive Passport module.
- **Standalone city image grid:** do not create. Most cities do not yet have verified photography, and geographic links are more useful as an editorial index.
- **Standalone cuisine card grid:** do not create. Cuisine imagery would be generic and risk misrepresenting restaurants; linked typography is more truthful.
- **Homepage map preview:** do not add. The primary Map CTA provides a direct path, and a second live map would duplicate work, add JavaScript, and inherit map failure modes.
- **Michelin-star explainer:** keep on the dedicated Michelin Stars page. The Homepage needs distinctions, not a second educational essay.
- **Reservation marketplace module:** do not add. Reservation, official website, planning, and visit-recording actions belong on restaurant detail or Passport surfaces.

---

## 4. Content hierarchy

### Level 1: product promise

Hero headline, two-sentence product explanation, Explore primary CTA, Map secondary CTA.

### Level 2: discovery proof

Curated restaurants with verified imagery and an explicit editorial lens.

### Level 3: personal value

One adaptive Passport module that explains Save → Plan → Remember or resumes the user’s single most relevant activity.

### Level 4: distinctive and geographic entry points

Three-star destinations, then city and cuisine links.

### Level 5: coverage and trust

One concise collection-coverage line, source-information link, and the approved shared footer.

### Action priority

1. Explore restaurants
2. Explore the map
3. Open a featured restaurant
4. Continue an upcoming plan or recent save
5. Browse a city or cuisine
6. Save a featured restaurant

Homepage restaurant cards expose Save and restaurant details only. The Homepage must not imply that Dining Passport is a booking platform.

---

## 5. Proposed final copy

### Hero

**Eyebrow:** `Dining Passport`

**H1:** `Find your next Michelin-starred table.`

**Supporting copy:**
`Explore Michelin-starred restaurants across the United States. Save the places you want to try, plan future meals, and keep a private record of every visit.`

**Primary CTA:** `Explore restaurants`

**Secondary CTA:** `Explore the map`

**Journey spine:** `Save · Plan · Remember`

The word “remember” is used in brand copy while the canonical state remains Visited. It describes the benefit rather than creating another status.

### Featured restaurants

**Heading:** `Tables worth planning around`

**Dek:** `A small editorial selection across regions, cuisines, and Michelin distinctions.`

**Section action:** `Explore all restaurants`

Do not use “popular,” “best,” “top,” “trending,” or rating language because the product lacks evidence for those claims.

### Adaptive Passport module — no activity

**Eyebrow:** `Your Passport`

**Heading:** `Keep the restaurants that matter to you.`

**Body:** `Save a place for later, add an upcoming plan, then record each visit with private notes and favorite dishes. Your Passport works on this device; sign in when you want it synced across devices.`

**Primary action:** `Find a restaurant to save`

**Secondary action:** `See how Passport works` → `/passport`

**Steps:** `Save a place` → `Plan the meal` → `Remember the visit`

### Adaptive Passport module — saved, no plan

**Eyebrow:** `Continue your Passport`

**Heading:** `Ready to choose what’s next?`

**Body:** `You have {savedCount} saved {savedCount, plural, one {restaurant} other {restaurants}}.`

**Primary action:** `View saved restaurants`

**Optional restaurant action:** `Plan a visit`

### Adaptive Passport module — upcoming plan

**Eyebrow:** `Coming up`

**Heading:** `{restaurantName}`

**Meta:** `{formattedDate} · {city}, {stateCode}`

**Primary action:** `View plan`

**Secondary action:** `View restaurant`

If `plannedFor` is null, use `Planned · Date not set`.

### Adaptive Passport module — recent visit

Shown only when there is no active upcoming plan.

**Eyebrow:** `Recently visited`

**Heading:** `{restaurantName}`

**Meta with date:** `Visited {formattedDate}`

**Meta without date:** `Visited · Date not recorded`

**Primary action:** `View your visit`

Never show private notes, favorite dishes, ratings, or would-return data on the Homepage.

### Sync status copy

| State | Copy |
| --- | --- |
| Device-only | `Saved on this device` |
| Pending | `Sync pending` |
| Synced | `Synced` |
| Failed | `Sync failed` + `Retry` |

`Synced` may be omitted when no status needs attention. `Sync pending` and `Sync failed` must remain visible.

### Three-star destinations

**Heading:** `Three-star destinations`

**Dek:** `Explore restaurants holding the guide’s highest distinction, across the places Michelin currently covers in the United States.`

**Action:** `View all three-star restaurants`

Each item uses the factual label `Three Michelin stars`; do not use Michelin iconography beyond the existing restrained text/star primitive.

### Browse

**Heading:** `Browse your way in`

**City subheading:** `By city`

**Cuisine subheading:** `By cuisine`

**City action:** `View all cities`

**Cuisine action:** `View all cuisines`

Initial city links: New York City, San Francisco, Washington, Chicago, Los Angeles, Miami, Atlanta, and Austin. These are derived from current restaurant counts and must be generated, not hardcoded as permanent claims. Brooklyn contributes to the New York City Homepage destination, while restaurant cards and Explore filters continue to display `Brooklyn, New York`.

Initial cuisine links: Contemporary, Japanese, Californian, French, American, Korean, Mexican, and Italian. These are likewise generated from current normalized cuisine data.

### Coverage line

`Explore {restaurantCount} Michelin-starred restaurants across {cityCount} U.S. cities.`

Link: `How coverage and sources work`

Both values come from the canonical restaurant source at render time. They are not stored as copy or duplicated in configuration. If either value cannot be guaranteed accurate, render the non-numeric fallback from Section 16. This line remains outside the hero and is never expanded into statistic cards.

### Footer

Use the approved Stage 1 copy:

`Dining Passport`

`Discover Michelin-starred restaurants, plan future visits, and remember the meals you loved.`

`Dining Passport is an independent discovery platform and is not affiliated with the Michelin Guide.`

Links: About, Privacy, Terms, Contact, Source information.

---

## 6. Desktop layout

### 1440px

- Header: approved 72px shared header.
- Content max: 1280px with 64px page margins.
- Hero: 640px minimum content height below header; 12-column split.
- Hero copy: columns 1–5; verified media: columns 7–12; journey spine occupies the inter-column seam.
- H1: `clamp(56px, 4.5vw, 72px)`, maximum 10–11 words over three lines.
- Supporting copy: 19px/30px, maximum 600px.
- CTA group: horizontal, primary then secondary, 48px minimum height.
- Media ratio: approximately 4:3 within a 56–60% width plane; crop uses stored focal point.
- Featured uses exactly one of the approved compositions:
  - **Composition F3:** one 8-column lead plus two supporting cards stacked in 4 columns;
  - **Composition F4:** one 7-column lead plus three supporting cards in a 5-column editorial stack;
  - **Composition F5:** one 6-column lead plus four supporting cards in a 2×2 6-column grid.
- Do not invent intermediate arrangements or place five equal cards in a generic grid.
- Adaptive Passport: full-width editorial band with 5/7 split; explanation/continuation on left, journey line or one restaurant summary on right.
- Three-star: one image-led feature plus a two-column typographic destination index; no second three-card grid.
- Browse: two equal columns separated by a 1px rule; each contains an eight-link index.
- Section spacing: 104px between major sections; 48px within sections.
- Footer: brand/copy left; five-link navigation right; disclaimer full-width below.

### 1280px

- Header and content max remain unchanged; page margins reduce to 48px.
- Hero: 600px, same 5/7 relationship.
- H1 maximum 64px.
- Featured uses F3, F4, or F5 with 24px gaps. F5 keeps a 2×2 support grid; it does not collapse to five equal cards.
- Browse and footer remain two-column.
- No element may depend on an exact 1280px viewport; layout must tolerate browser scrollbar width without clipping.

---

## 7. Tablet layout

### 1024px

- Header switches to the shared mobile-navigation trigger at the approved shell breakpoint.
- Hero: 560px, 5/7 split may remain only if both copy and media retain at least 420px usable width; otherwise use a 55/45 split with reduced media.
- H1: 52px/1.04.
- CTA group remains horizontal.
- Journey spine becomes a horizontal line below CTA group if the seam becomes too narrow.
- Featured: lead editorial card full-width, followed by two, three, or four supporting cards in a two-column grid. F4 ends with one intentional full-row support card; F5 fills two rows.
- Adaptive Passport: 5/7 split, minimum 44px controls.
- Three-star: lead feature full-width followed by two-column link list.
- Browse: two columns.
- Section spacing: 88px.

### 768px

- Hero stacks copy above media.
- Total hero block: approximately 720px; copy area 380–410px and media 300–320px.
- H1: 46px/1.06.
- CTA group remains side by side when labels fit at 320px total; otherwise full-width stacked.
- Media is full-bleed within the section, not viewport-wide beyond page bounds.
- Featured: two-column supporting grid; lead card stacks image and content.
- Adaptive Passport: single column; journey steps remain three equal columns.
- Three-star: one large image followed by a simple vertical restaurant index.
- Browse: single outer column with city and cuisine subsections separated by a rule; each link index may use two internal columns.
- Section spacing: 72px.
- Footer stacks brand/copy, links, then disclaimer.

---

## 8. Mobile layout

### Shared behavior at 430px, 390px, and 375px

- Shared mobile header height: 64px if Stage 1 adopts that mobile token; otherwise retain the canonical header token consistently.
- Page margin: 20px at 430/390; 16px is allowed at 375 only if required to keep 44px controls and headline wrapping stable.
- No essential content uses horizontal scrolling.
- Featured and three-star items stack vertically so keyboard, screen-reader, and touch users see the same editorial order; the desktop composition is never compressed into tiny cards.
- City and cuisine links wrap or use a two-column text index; they do not become horizontally scrolling pills.
- All touch targets are at least 44×44px.
- Section spacing: 64px at 430/390 and 56px at 375.
- Footer links stack in two columns at 430/390 and one column at 375 if two columns force awkward wrapping.
- `documentElement.scrollWidth <= clientWidth + 1` at every mobile reference width.

### 430px

- Hero copy block: 390–420px, followed by 280px media.
- H1: 42px/1.05.
- CTAs: horizontal only if each keeps at least 160px; otherwise two full-width rows.
- Featured media: 4:3; content remains outside the image.
- Supporting restaurant cards: one column.
- Journey steps: three compact columns with short labels.

### 390px

- Hero copy block: approximately 400px, media 260px.
- H1: 40px/1.06.
- CTAs: stacked full width with 12px gap.
- Featured cards: 4:3, one column.
- Restaurant meta may wrap to two lines; price never sits in an absolute corner.
- Browse indices: two columns only when every link remains at least 136px wide.

### 375px

- H1: 38px/1.07, maximum four lines.
- CTAs: stacked full width.
- Hero media: 248px minimum height; crop uses the mobile focal point if the contract later adds responsive focal variants, otherwise the stored focal point.
- Featured cards and Passport module must not enforce the existing `min-width: 280px` in a way that expands the document.
- Browse indices collapse to one column if localized or long cuisine names would overflow.
- Coverage sentence and footer disclaimer use at least 15px body text and comfortable line height.

---

## 9. Component tree

```text
HomePage (server)
└── HomepageView
    ├── AppHeader (shared shell)
    ├── HomepageHero
    │   ├── HeroCopy
    │   ├── HomepagePrimaryActions
    │   ├── JourneySpine
    │   └── VerifiedAtmosphericHeroMedia | TypographyLedHeroFallback
    ├── HomepageFeaturedSection
    │   ├── SectionHeader
    │   ├── FeaturedCompositionF3 | FeaturedCompositionF4 | FeaturedCompositionF5
    │   ├── RestaurantEditorialCard (lead)
    │   └── RestaurantDiscoveryCard × 0–4 (support)
    ├── HomepagePassportSlot (small client island)
    │   ├── PassportValueExplanation
    │   └── PassportContinuation
    │       ├── UpcomingPlanSummary
    │       ├── SavedSummary
    │       ├── RecentVisitSummary
    │       └── SyncStatus
    ├── ThreeStarDestinations
    │   ├── RestaurantEditorialCard (optional verified lead)
    │   └── RestaurantTextIndex
    ├── HomepageBrowseIndex
    │   ├── CityLinkIndex
    │   └── CuisineLinkIndex
    ├── CoverageSourceLine
    └── SiteFooter (shared shell)
```

### Data/view-model boundaries

`HomePage` receives only:

- one resolved atmospheric hero media record or null;
- up to five featured restaurant summaries;
- up to six three-star restaurant summaries;
- eight city aggregates;
- eight cuisine aggregates;
- total restaurant count and canonical city count.

The client Passport slot receives:

- bookmark slugs and timestamps needed to choose one continuation;
- at most one active plan summary;
- at most one recent visit summary;
- aggregate saved count;
- sync status and pending count.

It resolves at most three required restaurant summaries by identifier. It never imports `data/restaurants.json` or receives all 271 records.

---

## 10. Restaurant-card specification

### Lead editorial card

- Purpose: give the section one memorable editorial anchor.
- Media ratio: 4:3 desktop, 16:10 tablet, 4:3 mobile.
- Desktop layout: media 58%, content 42%.
- Required fields: distinction, name, cuisine, city/state, price when present.
- Primary name/details link: restaurant name and image.
- Save: icon-only overlay on media, with stateful accessible name.
- Actions: Save and restaurant details only.
- Image credit: not on every card unless the license requires on-image credit; full credit remains on detail/source information.

### Supporting discovery card

- Media ratio: 4:3.
- Order: media → distinction → name → cuisine and city/state → price.
- Save: top-right overlay with opaque contrast plate.
- Details: the image and restaurant name link to detail; an extra full-width “Details” button is unnecessary.
- Price: retain the source’s symbol string exactly; omit when missing.

### Michelin distinction treatment

- Use the existing `MichelinDistinction` text/star primitive.
- Gold is a small typographic accent, not a large red badge or official Michelin mark.
- Screen-reader label states the count in words.
- Do not write “award-winning,” “best,” or “top-rated.”

### Missing-image fallback

1. next verified asset for that restaurant;
2. approved representative cuisine/dining-style fallback;
3. designed initials fallback.

Initials are an emergency terminal fallback, not the Homepage’s planned default. Featured configuration should prefer restaurants with active verified media. If fewer than three active verified assets exist, reduce the visual card count instead of presenting a full initials grid.

### Loading

- Reserve exact media and card geometry.
- Use neutral surface skeletons without animated shimmer when reduced motion is requested.
- Do not show initials briefly while a verified image loads.
- Keep name/meta skeleton lengths varied but deterministic to avoid an obviously generic template.

### Interaction

- Hover: image scale no more than 1.02 and name color shift; no card lift larger than 2px.
- Focus: 2px visible forest outline with 2px offset; focus must not be clipped by media overflow.
- Save pending: preserve button label and expose `aria-busy`.
- Save failed: retain local saved visual state, add sync-failed status in the adaptive Passport module/toast pattern, and offer Retry; do not revert silently.
- Opening card media or name navigates to the restaurant detail route.

### Mobile

- One card per row at 430/390/375.
- Save overlay remains 44×44px.
- Meta wraps naturally; no truncation of restaurant name to one line.

---

## 11. Image requirements

### Contract dependency

Every named image must come from the Stage 1 `RestaurantMediaAsset` record and an ingestion-generated variant:

- thumbnail;
- card;
- hero;
- gallery/full-size.

The Homepage must not call paid runtime Supabase transformations.

### Hero media

- Required subject: an atmospheric dining room, plated course, or table setting without recognizable restaurant branding.
- The asset must be verified and licensed, support desktop and mobile crops, and include source URL, usage basis/license, credit, verification date, dimensions, and focal metadata.
- It must not name a restaurant or imply that one restaurant represents the platform.
- If no approved atmospheric asset exists: render the typography-led hero fallback; do not substitute a named restaurant image or stretch an initials tile into a hero.
- Credit is displayed when required and is always available through the source-information path.
- Hero image is the only Homepage image eligible for preload.
- Desktop uses the hero variant; smaller widths use card or hero variant according to rendered pixel width and DPR.

### Featured media

- Use card variants.
- `sizes` must match actual lead/support breakpoints.
- Images adjacent to a linked restaurant name use empty alt text when the image link has an accessible name; avoid duplicate announcements.
- The first non-hero featured image is not preloaded unless field data proves it is the LCP.

### Focal behavior

- Use stored normalized focal point.
- Object positioning must be deterministic at every breakpoint.
- Never crop away the principal dish/person/architectural subject.
- If one focal point cannot serve both landscape and portrait crops, ingestion must create an art-directed variant or the asset is not eligible for the hero.

### Rights and truthfulness

- The current `/images/homepage-hero.jpg` cannot be retained merely because it is local. It must satisfy the atmospheric subject, non-branding, rights, responsive-crop, and metadata requirements above or the new hero must use the typography-led fallback.
- Google Places photos are excluded.
- Michelin-owned guide imagery is excluded unless separate redistribution rights are documented.
- Representative images must be labeled on any surface where a user could mistake them for the restaurant.

### Byte budgets

| Asset | Target transfer budget |
| --- | --- |
| Hero above fold | ≤ 300KB at 1440 desktop; ≤ 180KB mobile |
| Lead featured | ≤ 180KB desktop |
| Supporting card | ≤ 120KB at rendered breakpoint |
| Total initial image payload | ≤ 550KB desktop; ≤ 350KB mobile |

These are acceptance targets, not reasons to destroy visible quality. The ingestion pipeline should prefer AVIF/WebP with JPEG fallback as required.

---

## 12. Signed-out behavior

- Header shows Sign in according to the shared shell.
- Hero copy and actions are identical for all users; do not make discovery feel gated.
- Save mutations write locally first.
- The adaptive Passport module explains that Passport works on this device and that sign-in enables cross-device sync.
- Signing in is secondary. The primary action remains finding a restaurant.
- Do not show an auth modal when Save is pressed.
- Do not claim cloud persistence.
- If local activity exists, show the device-only continuation and `Saved on this device`.

---

## 13. Device-only behavior

- Read the local V3 identifier-based store after hydration.
- Immediate Save/Plan/Visit changes may update the adaptive module without a page reload.
- Use a stable server-rendered default Passport explanation in the same layout slot, then replace its contents after hydration; this avoids inserting a new section and limits layout shift.
- Prefer an upcoming plan over saved-only continuation, then the most recent visit, then saved count.
- If the user has both past visits and a future plan, show the future plan.
- If no date exists for a plan, show `Planned · Date not set`.
- If a migrated visit has unknown date, show `Visited · Date not recorded`.
- Never expose `legacyFavorite` on the Homepage.
- Do not send local Passport content to analytics.

---

## 14. Signed-in behavior

- Discovery content remains identical; avoid a “welcome back” dashboard hero.
- Hydrate the Passport slot from the local store immediately and reconcile through the approved outbox/cloud pull.
- Show one continuation only, using the same priority as device-only behavior.
- When synchronized and quiet, the `Synced` label may remain visually subdued.
- When pending, show `Sync pending` without blocking navigation.
- When failed after exhausted automatic attempts, show `Sync failed` and `Retry`.
- Retry operates on the outbox; it does not replay UI actions or duplicate a visit.
- Do not show account email, private notes, ratings, favorite dishes, or plan confirmation notes on the Homepage.

---

## 15. Loading states

| Area | Loading behavior |
| --- | --- |
| Header/auth | Render the server-known auth state; do not flash Sign in and then Account. |
| Hero copy | Server-render immediately; never skeleton the H1 or CTAs. |
| Hero media | Reserve aspect ratio; show a static dominant-color/low-detail placeholder generated from the same asset. |
| Featured | Server-render public summaries. If media metadata is delayed, reserve final media boxes and use skeletons, not initials. |
| Passport slot | Server-render the no-activity value explanation shell; hydrate in place with equal/minimum height. |
| City/cuisine | Server-render aggregates; no client loading state in the normal path. |
| Coverage | Server-render counts. |

Animation must respect `prefers-reduced-motion`. Loading content may not trap focus or announce repeated progress updates.

---

## 16. Empty and partial-data states

### No verified hero media

Use the typography-led split hero with paper surface, atlas rules, and the journey spine. Keep both CTAs. Do not show a broken or initials hero.

### Fewer than three verified featured assets

- One asset: render one full-width editorial feature and the Explore action.
- Two assets: render two asymmetric features.
- Three assets: use F3.
- Four assets: use F4.
- Five assets: use F5.
- Never fill a slot with weak, unrelated, expired, or unverified media merely to reach five.
- Zero assets: replace the image-led section with a compact server-rendered restaurant text index selected by the same editorial criteria. Explain no media issue to users; simply present the restaurants truthfully.

### Three-star media incomplete

Keep the three-star section as a typographic destination index. A verified lead image is enhancement, not a requirement.

### No Passport activity

Render the value explanation copy and Find a restaurant to save action.

### Missing restaurant summary for a local identifier

Skip that item, record an operational warning, and choose the next valid continuation. If none resolve, show the default Passport explanation. Do not expose an unknown slug.

### Counts temporarily unavailable

Omit the numeric coverage sentence and render `Explore Michelin-starred restaurants across the U.S. cities currently covered in Dining Passport.` The source-information link remains.

---

## 17. Error states

### Public discovery query failure

- Hero and Explore/Map CTAs still render.
- Affected section shows a concise message: `This selection is temporarily unavailable.`
- Action: `Explore all restaurants`.
- One section failure must not collapse the whole page.

### Media failure

Advance through verified candidates, representative fallback, then designed initials for cards. Hero falls back to the typography-led treatment. Never display a broken-image icon.

### Local Passport read/migration failure

Render the default Passport explanation and a non-blocking `Passport data needs attention` action linking to the approved recovery surface. Do not attempt destructive repair from the Homepage.

### Sync failure

Keep the local action visible, show `Sync failed`, explain `Your changes are still saved on this device`, and expose Retry.

### Global route error

Use the shared error boundary. It must provide Home and Explore actions and must not reveal stack traces or internal source language.

---

## 18. Accessibility requirements

- One H1 only.
- Every major section has a unique H2 and `aria-labelledby`.
- Hero photography never carries essential text; copy is real HTML.
- Text over images must meet 4.5:1 for normal text and 3:1 for large text in every crop/loading state. Prefer separating copy and media over relying on a scrim.
- CTA order in DOM matches visual and keyboard order.
- Explore and Map labels are explicit; avoid two ambiguous “Explore” controls.
- Icon-only Save controls have stateful names: `Save {restaurant}`, `Saved {restaurant}`, or `Remove {restaurant} from saved restaurants`.
- Pending Save retains its name and uses `aria-busy=true`.
- Focus indicators meet at least 3:1 against adjacent colors and are not clipped.
- Star count is available as text, not color or repeated glyphs alone.
- Journey steps are an ordered list, not decorative divs.
- Sync changes use a polite live region only for user-initiated transitions; background retries do not repeatedly announce.
- Error summaries receive focus only after user action, never on passive background failures.
- Images follow the alt strategy in Section 11.
- No auto-advancing carousel.
- No horizontal gesture is required to reach content.
- Reduced-motion mode removes image scale and content transition effects.
- At 200% zoom and 320 CSS px, content remains usable without two-dimensional scrolling.
- The adaptive Passport module must not expose private notes to assistive technology when they are visually absent.

---

## 19. Performance requirements

### Rendering boundaries

- Keep the route server-first.
- Limit client JavaScript to the Passport slot plus existing Save controls/header behavior.
- Do not make the Homepage a monolithic client component.
- Do not import `getRestaurants()` into the root provider graph.
- Public view models are bounded and serializable.

### Data limits

- Featured summaries: maximum five.
- Three-star summaries: maximum six.
- Cities: maximum eight.
- Cuisines: maximum eight.
- Passport continuation summary hydration: maximum three slugs per request and normally one visible result.

### User-experience budgets

- LCP target: ≤ 2.5s at the 75th percentile on supported production traffic.
- CLS target: ≤ 0.1.
- INP target: ≤ 200ms.
- No Homepage-specific map JavaScript.
- No client fetch for city, cuisine, totals, or public featured content after normal server render.
- Reserve all media dimensions.
- Use immutable ingestion-generated media URLs and long-lived caching.
- Preload only the actual LCP candidate.
- Ensure the 375px page has no overflow and no asset wider than its container.

### Cache behavior

- Public featured/aggregate view models may use the project’s approved server cache with explicit revalidation tied to restaurant/media publication.
- Media activation/deactivation changes must invalidate the Homepage view-model cache.
- Personal Passport data is private and must not enter shared/public caches.
- A signed-in response must not leak personalized module data into a public cache key.

---

## 20. Analytics events

Analytics must contain no email, account ID, private notes, dishes, plan notes, exact visit history, or raw search text.

| Event | When | Properties |
| --- | --- | --- |
| `homepage_viewed` | Page view after consent rules | `visitor_mode: signed_out_device_only_signed_in`, `featured_count`, `featured_composition: f3_f4_f5_text`, `hero_media_mode: atmospheric_typography` |
| `homepage_hero_explore_clicked` | Primary CTA | `placement: hero` |
| `homepage_hero_map_clicked` | Secondary CTA | `placement: hero` |
| `homepage_featured_opened` | Featured detail link | `restaurant_slug`, `position`, `card_variant`, `star_count` |
| `homepage_featured_saved` | Save action | `restaurant_slug`, `position`, `result: local_only_pending_synced_failed` |
| `homepage_passport_continued` | Adaptive module action | `context: start_saved_plan_visit`, `sync_state` |
| `homepage_sync_retry_clicked` | Explicit Retry | `pending_count_bucket`, `last_error_class` |
| `homepage_three_star_opened` | Three-star item | `restaurant_slug`, `position`, `media_mode` |
| `homepage_city_opened` | City link | `city_slug`, `position` |
| `homepage_cuisine_opened` | Cuisine link | `cuisine_slug`, `position` |
| `homepage_source_information_opened` | Coverage/source link | `placement: coverage_footer` |

Operational media-resolution failures belong in privacy-reviewed logging, not product analytics.

---

## 21. Files likely to change

This list forecasts later implementation scope; Stage 2 does not authorize edits.

### Existing files

- `src/app/page.tsx`
- `src/app/layout.tsx` only for the already-approved provider boundary, not Homepage styling
- `src/app/globals.css`
- `src/components/stitch/home/HomepageView.tsx`
- `src/components/stitch/home/MarketingHero.tsx`
- `src/components/stitch/home/HomepageFeaturedSection.tsx`
- `src/components/stitch/home/HomepageStatsStrip.tsx`
- `src/components/stitch/home/models.ts`
- `src/components/stitch/home/adapters.ts`
- `src/components/stitch/home/index.ts`
- `src/components/stitch/restaurant/RestaurantDiscoveryCard.tsx`
- `src/components/stitch/restaurant/RestaurantEditorialCard.tsx`
- `src/components/stitch/restaurant/RestaurantMedia.tsx`
- `src/components/stitch/restaurant/SaveAction.tsx`
- `src/components/shell/SiteFooter.tsx`
- `src/config/homepage.ts`
- `src/config/site.ts`
- `src/lib/data/restaurants.ts`
- `next.config.ts`
- `e2e/homepage.spec.ts`
- `scripts/test_homepage.mjs`

### Likely new files

- `src/components/stitch/home/HomepagePassportSlot.tsx`
- `src/components/stitch/home/PassportValueExplanation.tsx`
- `src/components/stitch/home/PassportContinuation.tsx`
- `src/components/stitch/home/ThreeStarDestinations.tsx`
- `src/components/stitch/home/HomepageBrowseIndex.tsx`
- `src/components/stitch/home/CoverageSourceLine.tsx`
- `src/lib/homepage/get-homepage-view-model.ts`
- `src/lib/homepage/get-homepage-passport-summary.ts`
- `src/lib/media/resolve-restaurant-media.ts`
- focused unit tests beside the new view-model/resolver modules

No exact filename is binding until the implementation plan checks the then-current tree.

---

## 22. Components to reuse

- `AppHeader` / `AppHeaderClient`, after Stage 1 shell accessibility corrections
- `SiteFooter`, after Stage 1 copy/navigation simplification
- `PageContainer`
- `SectionHeader`, with a variant if needed rather than duplication
- `Button`
- `IconButton`
- `MichelinDistinction`
- `RestaurantMeta`
- `SaveAction`, after truthful sync-state integration
- `RestaurantDiscoveryCard`, as a supporting card
- `RestaurantEditorialCard`, as a lead pattern after media-contract adaptation
- `RestaurantCardSkeleton`
- shared focus, error, and dialog primitives from Stage 1

Reuse means preserving behavioral contracts, not forcing every section into the same rounded-card silhouette.

---

## 23. Components to retire

- `HomepageStatsStrip`: remove from the Homepage and delete if unused elsewhere.
- Current `MarketingHero`: replace its full-bleed centered composition; the filename may be retained only if its API and implementation are fully rewritten.
- Current `HomepageViewModel.totals.oneStar/twoStar/threeStar`: retire from the Homepage model.
- Current `HomepageFeaturedSection` assumption of exactly three equal cards: retire in favor of F3, F4, and F5 only.
- Homepage use of `ReservationAction`: retire without deleting the shared component from detail-page consumers.
- Development proof states that encode only three equal featured cards should be rewritten for new empty/partial/media states.
- Current footer dataset/roster paragraphs: remove through shared shell work.

Do not retire shared restaurant cards solely to make Homepage-specific copies. Extend with explicit variants only when composition truly differs.

---

## 24. Implementation dependencies

### Hard prerequisites

1. Stage 1 identifier-based journey store and derived states.
2. Durable outbox and truthful sync status.
3. Full-catalog removal from the global Passport provider.
4. Shared header/footer copy and accessibility corrections.
5. Restaurant media registry and resolver.
6. Supabase Storage ingestion pipeline with four generated variants.
7. At least ten verified media decisions from the pilot, including enough active assets for the selected hero/featured composition or explicit fallback decisions.
8. About, Privacy, Terms, Contact, and Source-information destinations, or an approved sequencing plan that avoids dead footer links.

### Soft dependencies

- MapTiler implementation is not required to render the Homepage, but `/map` must provide a truthful failure state before the Hero promotes it in production.
- Three-star media coverage improves the section but is not required because the typographic index is the approved fallback.
- Signed-in server summary optimization may follow device-only behavior if the client island remains stable and bounded.

### Sequencing recommendation

1. Complete shared foundation implementation and acceptance tests.
2. Ingest and verify the ten-restaurant media pilot.
3. Build the server-only public Homepage composition.
4. Add the bounded Passport continuation island.
5. Add failure/partial states.
6. Run seven-width and state-matrix verification.

---

## 25. Risks and unknowns

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Media pilot yields fewer usable restaurant assets than expected. | High | Composition explicitly scales from zero to five active assets and uses a typography-led hero/text index without pretending initials are premium photography. |
| Current hero JPEG lacks documented usage rights. | High | Require full media-contract verification or retire it. |
| Homepage waits on all Stage 1 work and becomes a large release. | Medium | Implement public server composition after media/provider boundaries, then add personalization; do not bypass foundations. |
| Featured curation implies unsupported ranking. | Medium | State the factual selection lens and rotate by documented editorial rules, not popularity claims. |
| Personalization causes hydration shift. | Medium | Use one stable Passport slot with server-rendered default value copy and bounded in-place replacement. |
| Signed-in and local stores temporarily disagree. | High | Show local result immediately with Pending/Failed status; reconcile through outbox and never claim Synced early. |
| Browse counts become stale. | Low | Generate from the route-owned source and cache/invalidate with source publication. |
| Three-star section is mistaken for Michelin affiliation. | Medium | Use plain text distinction, independence disclaimer once in footer, no official marks/red mimicry. |
| Adaptive media counts create inconsistent layouts. | Medium | Permit only F3, F4, and F5; test each composition at every reference width. |
| Long mobile page persists. | Medium | Limit featured visual items, use typographic indices, and avoid duplicative modules/carousels. |
| Analytics capture personal behavior. | High | Restrict event properties to coarse context and public slugs; exclude notes, dates, identities, and raw Passport data. |
| Existing taxonomy treats Brooklyn separately from New York. | Medium | Aggregate Brooklyn into New York City only for the Homepage destination index; preserve `Brooklyn, New York` on restaurant and Explore surfaces. |
| Restaurant/city counts change. | Low | Derive both values from the canonical restaurant source and use non-numeric copy when reliability cannot be guaranteed. |

---

## 26. Acceptance criteria

### Product and content

- [ ] First viewport answers what Dining Passport is, what it covers, why Passport matters, and what to do next.
- [ ] H1 is exactly `Find your next Michelin-starred table.` unless a later copy decision supersedes it.
- [ ] Primary CTA is Explore restaurants; secondary CTA is Explore the map.
- [ ] No statistics strip remains.
- [ ] No internal source-pipeline language appears.
- [ ] No unsupported popularity, ranking, rating, or award claims appear.
- [ ] Save → Plan → Remember copy does not create a fifth journey state.
- [ ] `See how Passport works` routes to `/passport`.
- [ ] Homepage restaurant cards contain Save and details actions only.

### Media

- [ ] Every named restaurant image resolves through an active verified media record.
- [ ] Hero uses verified, licensed, unbranded atmospheric dining photography or the typography-led fallback.
- [ ] Hero does not use or name a restaurant.
- [ ] The current local hero JPEG is not grandfathered without full rights metadata.
- [ ] No Google Places or unauthorized Michelin imagery is used.
- [ ] Three, four, and five featured restaurants use only F3, F4, and F5 respectively; zero, one, and two use the specified partial-media states.
- [ ] Initials are not the default Homepage presentation.
- [ ] Media boxes reserve their final dimensions.

### Behavior

- [ ] Signed-out Save remains local and does not trigger forced auth.
- [ ] Planning/visiting behavior follows Stage 1 bookmark invariants.
- [ ] Adaptive Passport module shows at most one continuation.
- [ ] Future plan outranks recent visit and saved-only continuation.
- [ ] Unknown visit date displays `Visited · Date not recorded`.
- [ ] Favorite-only provenance is never surfaced as a visit or top-level Favorite.
- [ ] Pending, Synced, Failed, and device-only copy is truthful.
- [ ] Failed sync preserves local state and offers Retry.
- [ ] Brooklyn is grouped into New York City only in the Homepage destination index and remains `Brooklyn, New York` elsewhere.
- [ ] Numeric coverage is canonical-source-derived or replaced by the approved non-numeric sentence.

### Responsive/accessibility

- [ ] Layout matches explicit behavior at 1440, 1280, 1024, 768, 430, 390, and 375px.
- [ ] No required horizontal carousel exists.
- [ ] No horizontal overflow at 430, 390, 375, 320, or 200% zoom.
- [ ] One H1 and unique labeled H2 sections.
- [ ] Keyboard order matches visual order.
- [ ] All controls have visible focus and at least 44×44px touch targets.
- [ ] Contrast passes in every image/fallback/loading state.
- [ ] Reduced motion is honored.
- [ ] External links and icon-only controls have complete accessible names.

### Performance/data

- [ ] Homepage does not receive or serialize all 271 restaurant records.
- [ ] Public section data is server-rendered and bounded.
- [ ] Only Passport continuation and existing interactive primitives hydrate client-side.
- [ ] Personal data never enters public cache keys.
- [ ] Initial image payload meets the Section 11 targets or includes a documented measured exception.
- [ ] LCP, CLS, and INP meet Section 19 targets in the production-like verification run.

### Shell

- [ ] Shared footer uses the approved tagline, one disclaimer, and five destinations.
- [ ] Homepage contains one header and one footer.
- [ ] Global search reaches and focuses Explore search.
- [ ] Map CTA lands on a configured map or its truthful failure state; never a silent demo-tile fallback in production.

---

## 27. Screenshot verification plan

### Required public captures

Capture full-page and above-the-fold images at:

- 1440×900
- 1280×900
- 1024×900
- 768×1024
- 430×932
- 390×844
- 375×812

Store under:

`output/playwright/stage2-homepage/{state}/home-{width}.png`

Create contact sheets for each state and one all-width final contact sheet.

### Required state matrix

1. Signed out, no activity, full verified media.
2. Signed out/device-only with saved restaurants.
3. Device-only with upcoming dated plan.
4. Device-only with undated plan.
5. Device-only with recent dated visit.
6. Device-only with migrated unknown-date visit.
7. Signed in and synced.
8. Signed in with pending sync.
9. Signed in with failed sync and Retry.
10. Zero verified hero/featured media.
11. One verified featured asset.
12. Partial featured media.
13. Public featured-data error.
14. Broken lead media resolving to fallback.
15. Reduced-motion mode.
16. 200% zoom / effective 320px layout.

### Automated measurements

For each reference width record:

- viewport and document width;
- `scrollWidth` / `clientWidth`;
- header height;
- hero height;
- H1 bounding box and line count;
- CTA bounding boxes and touch target size;
- featured column count;
- media rendered/intrinsic dimensions;
- footer layout;
- screenshot path.

For production-like runs also record:

- LCP element and time;
- CLS;
- transferred image bytes;
- JavaScript transferred for `/`;
- whether `data/restaurants.json` appears in the Passport provider/client bundle;
- console errors;
- failed media requests;
- accessibility scan results.

### Comparison

Compare against Stage 1:

- `output/playwright/stage1-foundation/contact-home.png`
- each `output/playwright/stage1-foundation/home-{width}.png`

The review must explicitly verify:

- CTAs now appear in the first viewport;
- the statistics strip is gone;
- initials are no longer the planned default;
- Passport value/continuation is present but restrained;
- footer duplication/internal language is gone;
- mobile page length and repetition are reduced;
- no new overflow was introduced.

---

## 28. Approved decision log

The product owner approved these decisions on 2026-07-18. They replace the former open-decision list:

1. **Hero media:** use verified, licensed atmospheric dining photography without recognizable restaurant branding. Named restaurant imagery remains on restaurant cards and detail pages.
2. **Featured count:** support three to five restaurants according to verified media availability. Zero, one, and two use the explicit partial-media states rather than weak filler.
3. **Featured compositions:** three restaurants use F3, four use F4, and five use F5. Adaptive selection may not generate arbitrary layouts.
4. **Featured rotation:** use typed manually curated slugs. When a configured restaurant is unavailable or lacks approved media, choose a deterministic fallback using verified media availability, Michelin distinction, geographic variety, and cuisine variety. Never randomize per page load.
5. **New York and Brooklyn:** use New York City as the major Homepage destination. Preserve Brooklyn as the displayed borough/location on cards, details, search, and filters.
6. **Passport destination:** `See how Passport works` routes to `/passport`. Passport remains usable without forced account creation and supports empty, device-only, signed-in, upcoming, recent, and pending-sync states.
7. **Coverage:** keep one restrained line outside the hero. Derive numeric restaurant and city counts from the canonical source; use non-numeric language when reliability is uncertain.
8. **Homepage card actions:** expose Save and restaurant details only. Reservation, official website, Plan, and Record Visit actions belong on restaurant detail or Passport surfaces.

## Hard stop

Stage 2 is approved as a product specification, but implementation remains unauthorized. Do not implement the Homepage, change production components, ingest media, create migrations, commit, or push. The next authorized work is Stage 3 Explore redesign specification only.
