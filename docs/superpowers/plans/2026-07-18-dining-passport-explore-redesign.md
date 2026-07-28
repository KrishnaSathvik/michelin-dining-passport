# Dining Passport Explore Redesign Specification

> **For agentic workers:** This Stage 3 document is a product, interaction, responsive, and architecture specification. It authorizes no production implementation. A later implementation plan must use the then-current repository and the installed Next.js 16.2.10 guidance before changing code.

**Goal:** Turn Explore into a premium, image-led restaurant directory that helps people move from a broad dining idea to a manageable, shareable result set without losing the route’s working search, filter, sort, view, pagination, and browser-history behavior.

**Architecture:** `/explore` remains a server-owned App Router route whose normalized URL query is the public state contract. The server returns one deterministic 24-restaurant page, result total, and bounded facets; it never ships the complete restaurant catalog to the result UI. Small client islands own the responsive filter dialog, searchable combobox interaction, focus handoff, navigation feedback, and identifier-based Save state.

**Tech Stack:** Next.js 16.2.10 App Router, React 19.2.4, TypeScript, Tailwind CSS 4, existing Literata/Inter typography, the approved Stage 1 media registry and Passport V3 boundary, and Playwright 1.61.

## Global constraints

- Do not implement the Explore redesign during Stage 3.
- Do not modify production source, ingest media, create migrations, commit, or push.
- Preserve working search, filtering, sorting, grid/list, pagination, URL, Back/Forward, loading, and empty-state behavior unless this specification identifies a verified defect or an approved product change.
- Do not ship the complete restaurant catalog to the browser.
- Do not use Google Places photos, scraped restaurant imagery, unlicensed assets, ratings, review counts, or unsupported popularity claims.
- Do not hide a restaurant because it lacks photography.
- Do not force account creation to save a restaurant.
- Do not expose private notes, planning details, visit content, email, or account identifiers to analytics.
- Do not use the consumer-facing words dataset, roster, workbook, import, or ingestion.
- Explore must feel like a dining directory, not an internal record browser, ecommerce category page, or booking marketplace.

---

## 1. Current-state findings

### Evidence reviewed

Fresh development captures and measurements were taken on 2026-07-18 from `http://127.0.0.1:3115/explore`:

| Evidence | What it shows |
| --- | --- |
| `output/playwright/stage3-explore-evidence/explore-default-1440.png` | Current four-column desktop grid, duplicated filters, initials-only media, reservation-heavy cards, and repeated result/source copy. |
| `output/playwright/stage3-explore-evidence/explore-default-390.png` | A 12,872px-tall default mobile page with 24 full cards and duplicated filter interfaces. |
| `output/playwright/stage3-explore-evidence/explore-filters-drawer-390.png` | The filter dialog is clipped to the sticky toolbar instead of covering the viewport. |
| `output/playwright/stage3-explore-evidence/explore-filtered-list-1280.png` | Active filters, deterministic URL state, and a useful desktop list foundation. |
| `output/playwright/stage3-explore-evidence/explore-filtered-list-390.png` | Current mobile list mode becomes another full-width card stack rather than a scan-efficient list. |
| `output/playwright/stage1-foundation/contact-explore.png` | Earlier seven-width comparison and the existing 375px overflow finding. |

Fresh layout measurements:

| Width | Grid columns | Document width / viewport | Full-page height | “All Filters” right edge | Sticky toolbar height |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1440 | 4 | 1440 / 1440 | 3,747px | 1,296px | 153px |
| 1280 | 4 | 1280 / 1280 | 3,747px | 1,216px | 153px |
| 1024 | 3 | 1024 / 1024 | 4,694px | 960px | 153px |
| 768 | 2 | 768 / 768 | 6,602px | 867px | 153px |
| 430 | 1 | 430 / 430 | 13,536px | 802px | 213px |
| 390 | 1 | 390 / 390 | 12,872px | 802px | 213px |
| 375 | 1 | 380 / 375 | 12,622px | 802px | 213px |

At 390px, opening the filter dialog produced this measured geometry:

- viewport: 390×844;
- dialog: `x=0`, `y=355.97`, `width=390`, `height=212`;
- containing backdrop: the same 390×212 rectangle;
- expected: a viewport-level dialog approximately 390×844 with safe-area-aware footer.

Relevant implementation and test files reviewed:

- `src/app/explore/page.tsx`
- `src/app/explore/loading.tsx`
- `src/lib/data/explore.ts`
- `src/components/stitch/explore/*`
- `src/components/stitch/restaurant/RestaurantDiscoveryCard.tsx`
- `src/components/stitch/restaurant/RestaurantListRow.tsx`
- `src/components/stitch/restaurant/RestaurantMedia.tsx`
- `src/components/stitch/restaurant/SaveAction.tsx`
- `src/components/stitch/restaurant/adapters.ts`
- `src/components/shell/AppHeaderClient.tsx`
- `src/components/stitch/Drawer.tsx`
- `e2e/explore.spec.ts`
- `scripts/test_explore.mjs`
- `scripts/test_explore_ui.mjs`

Installed Next.js 16.2.10 guides reviewed:

- `node_modules/next/dist/docs/01-app/01-getting-started/04-linking-and-navigating.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/10-error-handling.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/02-components/link.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/loading.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-search-params.md`

### Verified strengths to preserve

- The route already parses and serializes `q`, `stars`, `state`, `city`, `cuisine`, `price`, `sort`, `view`, and `page`.
- Search already matches restaurant name, city, state, state code, cuisine, and address text.
- Combined filters work and reset pagination.
- State changes in the visible quick-filter row clear the current city.
- Facet values and counts come from the canonical restaurant source.
- City facets already scope to the selected state.
- Results are filtered, sorted, and paginated on the server; only 24 restaurant records render per page.
- Pagination uses real links and preserves the rest of the query.
- Active filters are individually removable and clearable as a group.
- Browser Back restores prior URL state in existing coverage.
- Invalid stars, sort, view, and non-positive page values fall back without crashing.
- Grid and desktop list are distinct components.
- Loading and no-result compositions already exist.
- Search, filter, sort, view, pagination, and card actions have baseline end-to-end coverage.
- Explore correctly avoids Google Places UI Kit, Google ratings, and review counts.
- The default grid is four columns at 1440/1280, three at 1024, two at 768, and one at phone widths.

---

## 2. Functional defects

1. **The mobile filter dialog is functionally clipped.** `AllFiltersDrawer` renders inside the sticky, backdrop-filtered `DiscoveryToolbar`. That ancestor establishes the fixed-position containing block, so the shared `Drawer` fills the 213px toolbar instead of the viewport.
2. **The only complete mobile Filters control is off-screen.** At 430, 390, and 375px its right edge is 802px. It sits after five quick-filter selects in a horizontally scrolling strip, making the complete filter surface undiscoverable to touch users.
3. **The 375px route still overflows.** Fresh measurement is 380px document width in a 375px viewport. Existing end-to-end overflow coverage stops at 390px and therefore misses it.
4. **Desktop duplicates all visible filters.** “All Filters” contains Search, Michelin distinction, State, City, Cuisine, and Price even though the sticky row already exposes the same controls. No genuinely additional filter exists.
5. **Mobile duplicates two complete filtering models.** Quick-filter selects remain above a second drawer, but the second interface is inaccessible because of Defects 1 and 2.
6. **Direct invalid facet values are not canonicalized.** Stars, sort, view, and page have limited validation, but arbitrary state, city, cuisine, and price strings become misleading empty result sets.
7. **A state/city mismatch can survive outside the visible quick-filter path.** Direct URLs and state changes staged inside the drawer can retain a city outside the selected state.
8. **Out-of-range pages render a clamped page while the URL stays incorrect.** `/explore?page=999` can display the last page while continuing to claim page 999, weakening copy/paste and analytics semantics.
9. **Global search does not complete the approved focus handoff.** The header currently links to `/explore`; the Stage 1 contract requires `/explore?focus=search` and initial focus on the Explore search field.
10. **Every current restaurant card is an initials fallback.** The Explore adapter never resolves approved media into the shared card model.
11. **Current media uses raw `<img>` behavior.** It has no generated responsive variant selection and cannot use the approved media registry’s card/thumbnail contracts.
12. **The card model and UI are reservation-heavy.** Every grid/list record can add an external booking action, which makes the directory transactional and lengthens all 24 cards.
13. **Save accessible names omit the restaurant name.** Repeated controls announce only “Save to passport” or “Remove from saved,” which is ambiguous in a card list.
14. **Cloud Save failures are discarded.** The current provider fires cloud writes without a durable outbox result, while `SaveAction` can only catch synchronous failures. A card can look saved without truthful Pending or Failed status.
15. **Result count is repeated.** It appears in the page header and again beside Sort, adding noise while neither location explains transition state particularly well.
16. **Current mobile List mode is not a list.** It expands list media to full width and reproduces the grid-card reading pattern.
17. **The current “Featured” default is coupled to Homepage configuration.** Explore imports `homepageConfig.featuredRestaurantSlugs`, which makes directory ordering depend on another page’s editorial choices.
18. **Current City and Cuisine selects are not searchable.** They expose roughly 60 city options and 35 cuisine options in long native menus.
19. **There is no route-local error boundary.** Restaurant-data failure falls to the broader application error surface rather than preserving the Explore shell with a focused retry.
20. **Media failure and data failure are not distinguished in page states.** A failed image should degrade per card without implying that restaurant records failed.
21. **Current tests prove dialog width but not dialog height or viewport anchoring.** The mobile drawer test passes despite the dialog being only 212px tall.
22. **Current tests omit 375px, 430px, 1280px list behavior, state/city mismatch, page canonicalization, and Save sync failure.**

---

## 3. Explore product goal

Explore is the primary directory. Its single job is to help a person turn intent into a manageable set of restaurants and confidently open one.

It must support these jobs without exposing implementation complexity:

- find three-star restaurants in California;
- find Italian restaurants in New York City while retaining Brooklyn as a borough-level option and label;
- combine one-star and price criteria;
- search by restaurant, city, state, or cuisine;
- scan which filtered restaurants are already saved;
- compare a photograph-led grid with a compact information-led list;
- share or revisit the exact result state through the URL;
- move between pages and return through browser history without losing context.

### Design direction

Extend the approved **Editorial Atlas with a Personal Bookmark** direction:

- quiet page introduction followed immediately by the directory;
- one broad, clearly labeled search field;
- filters treated as editorial index controls, not ecommerce pills;
- photography and truthful fallbacks carry the visual rhythm;
- distinction, name, cuisine, and place form the scanning hierarchy;
- the bookmark is the only personal action on the directory;
- hairline rules separate tool groups and list rows;
- forest and paper remain primary, with gold reserved for Michelin distinction;
- no sidebar, card shadow wall, gradient merchandising, review stars, or “best near you” language.

The page’s distinctive device is the active-filter ledger: removable filter labels read as a concise editorial sentence between controls and results. It conveys state without turning the interface into a dense chip cloud.

### Success definition

The redesign succeeds when:

- the complete filter model is visible or one action away;
- changing any criterion gives immediate, announced feedback;
- every copied URL reproduces the same normalized query and page;
- mixed photography/fallback cards still form a coherent grid;
- a returning user can identify Saved state without seeing sync noise on every card;
- the page remains usable at every required width, keyboard-only, 200% zoom, reduced motion, offline, and partial-media conditions.

---

## 4. Final information architecture

| Order | Region | Final decision |
| ---: | --- | --- |
| 1 | Shared header | Keep. Header search navigates to `/explore?focus=search`; it does not own a second catalog search implementation. |
| 2 | Explore title and introduction | One H1 plus one concise sentence. Remove the duplicated result count from this area. |
| 3 | Search | One full-width Explore search form. |
| 4 | Primary filters | Desktop exposes all five filter groups; tablet/mobile exposes one Filters control. |
| 5 | Active filter ledger | Visible whenever search or a facet is active; individual removal plus Clear all. |
| 6 | Result count, sort, and view | One responsive toolbar; result count is announced here only. |
| 7 | Restaurant results | Server-rendered 24-item grid or meaningful list. |
| 8 | Pagination | URL-driven numbered pagination on desktop; compact Previous/Next navigation on phones. |
| 9 | Empty/error/recovery state | Replaces only the result region when public records fail; media and Save errors remain localized. |
| 10 | Shared footer | Keep. It remains reachable because Explore does not use infinite scroll. |

No destination gallery, explanatory marketing section, map preview, “popular searches,” statistics strip, or account prompt is added above the directory.

### Page copy

**H1:** `Explore Michelin-starred restaurants`

**Introduction:** `Search by restaurant, place, or cuisine, then narrow the list to what fits your plans.`

The canonical restaurant count belongs in the result toolbar, not both the introduction and toolbar.

---

## 5. Desktop filter specification

Desktop filter behavior applies at 1024px and wider.

### Layout

- Search occupies its own full-width row.
- The five filter groups occupy the next row and may wrap once at 1024px.
- There is no “All Filters” button.
- `Clear filters` appears at the end of the filter row only when at least one search/facet filter is active.
- Filter popovers render through a viewport-level layer/portal, never inside the sticky toolbar’s containing block.
- Selecting a desktop filter applies immediately, updates the URL with a history entry, resets `page` to 1, and exposes pending navigation feedback.

### Control choice by facet

| Facet | Control | Reason |
| --- | --- | --- |
| Michelin distinction | Button-triggered single-select radio popover | Four choices including Any; radio semantics are clearer than a long select and allow distinction labels/counts. |
| State | Labeled native select menu | The source currently has a small, stable set of states/territories; native selection is fast, accessible, and does not need search. |
| City | Searchable single-select combobox | The list is long. It must support typing, `City, ST` labels, keyboard selection, and state-dependent options. |
| Cuisine | Searchable single-select combobox | Roughly 35 options benefit from type-ahead and normalized matching. |
| Price | Single-select segmented control: Any, `$$`, `$$$`, `$$$$` | The ordinal set is small and visually scannable. At 1024px it may wrap as a complete group to the second line. |

### Option behavior

- Each option may show its canonical count.
- Zero-result options are disabled only when the count is computed against the other active filters; otherwise counts remain global and options stay available. The implementation plan must choose one count model consistently rather than mix global and contextual counts.
- The recommendation is contextual counts because they answer “what happens if I add this filter,” but this depends on source-query cost.
- The chosen State is applied before City options are derived.
- Without a selected State, City searches all cities and labels every option `City, ST`.
- With a selected State, City lists only cities in that state.
- Changing State atomically clears an incompatible City before navigation.
- Clearing State retains City only if that city remains valid as a nationwide selection; otherwise both clear.
- Search and facet filters remain single-value in V1. Do not convert Stars/Cuisine into multi-select without a separate product decision and URL contract.

### Sticky behavior

- The search/filter region may remain sticky under the shared header.
- Its resting desktop height must not exceed 160px at 1440/1280 or 208px when wrapped at 1024.
- Popovers are not clipped by sticky overflow, transforms, filters, or backdrop effects.
- A subtle bottom rule and opaque-enough background preserve readability; avoid heavy blur.

---

## 6. Mobile filter specification

Mobile/tablet compact behavior applies below 1024px.

### Entry point

- Show one button labeled `Filters`.
- Place it beside or directly below Search.
- Append the active facet count, excluding `q`: `Filters, 3 active`.
- Do not render quick-filter selects or Michelin star chips above results.
- Search stays outside the filter dialog because it is the page’s primary input.

### Dialog form

- At 768px, use a full-height right-side drawer no wider than 480px.
- At 430px and below, use a full-height bottom sheet/dialog that fills the visual viewport; a rounded top edge is optional, but it must not behave like a short nested sheet.
- Render the dialog at the application overlay root or document body so sticky/backdrop ancestors cannot constrain it.
- Account for `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`.
- Lock background scrolling and make the rest of the page inert.
- Initial focus goes to the dialog heading or first changed filter, not arbitrarily to Close.
- Escape, Close, backdrop press, and successful Apply close it and restore focus to Filters.

### Contents and order

1. Heading: `Filters`
2. Close action
3. Michelin distinction radio group
4. State select
5. City searchable combobox
6. Cuisine searchable combobox
7. Price segmented control
8. Sticky footer with Reset and Apply

### Staged behavior

- Mobile filter edits are draft state until Apply.
- Apply performs one URL navigation, resets page to 1, closes the dialog, and announces the new count.
- The Apply label is `Show {count} restaurants` when a reliable preview count is available; otherwise `Apply filters`.
- Reset clears all facet drafts but does not clear `q` because Search is outside the dialog. A separate `Clear all` in the active-filter ledger clears search and facets together.
- Close/Escape discards unapplied drafts.
- State changes immediately clear an incompatible City in the draft and announce `City cleared because it is not in {state}.`
- There are no nested drawers, popovers that escape the dialog, or horizontal option scrollers.

### Michelin quick chips

Move Michelin distinction entirely into the dialog on mobile. The current quick-filter row already hides the complete Filters control, and star chips would recreate a second filter model. The distinction remains visible after Apply through the active-filter ledger.

---

## 7. Search specification

### Relationship between header and Explore

- The shared-header Search action routes to `/explore?focus=search`.
- `focus=search` is an ephemeral UI instruction, not a result-state parameter.
- On initial navigation, focus moves to the Explore search input after the H1 is available.
- The first submitted/cleared query removes `focus` from the URL.
- Header and Explore use the same matching behavior because Explore owns the only catalog query.

### Matching

Search supports the current normalized matching across:

- restaurant name;
- city or borough;
- state name and state code;
- cuisine;
- existing address text where the canonical source already permits it.

Do not add fuzzy ranking, geolocation radius, ratings, or semantic AI search in this redesign.

### Update model

- The input is draft text until explicit submission.
- Enter and the `Search` button submit.
- No catalog request occurs on each keystroke.
- Therefore there is no result-request debounce in V1.
- If the Cuisine/City comboboxes need remote type-ahead later, debounce only those option queries at 200–300ms and cancel stale requests.
- Trim leading/trailing whitespace, collapse repeated internal spaces for matching, and cap the accepted query at 100 characters.
- Empty submission removes `q`, preserves facets/sort/view, and resets page to 1.

### Clear behavior

- When `q` is non-empty, show a 44×44 clear control inside or adjacent to the field.
- Accessible label: `Clear restaurant search`.
- Clearing applies immediately, retains all facet filters, resets page to 1, and focuses the empty search input.

### Navigation and feedback

- A submitted search creates one history entry.
- Intermediate typing creates none.
- While navigation is pending, preserve the draft text, mark the result region `aria-busy=true`, disable duplicate Search submissions, and show a restrained progress treatment after approximately 100ms so fast responses do not flash.
- Stale navigation responses must not replace a newer submitted query.
- Browser Back/Forward restores the submitted `q` and rendered results.
- The search field remains keyboard reachable in normal document order; `/` keyboard shortcuts are not added in V1.

### No results

Search-only failure uses the specific state in Section 17. Do not collapse it into the generic filter-empty copy.

---

## 8. Active-filter behavior

### Ledger contents

Render one item for each active value in this order:

1. Search
2. Michelin distinction
3. State
4. City
5. Cuisine
6. Price

Examples:

- `Search: “omakase”`
- `3 Michelin stars`
- `California`
- `San Francisco, CA`
- `Japanese`
- `$$$$`

### Interaction

- Every item is a link or button with a complete accessible name: `Remove Japanese filter`.
- Removing one item updates the URL immediately, preserves the other state, and resets page to 1.
- Removing State also removes City when City depends on that State.
- `Clear all` removes `q`, stars, state, city, cuisine, and price while preserving sort and view.
- The ledger wraps naturally; it never hides active state in an unlabeled overflow menu.
- Desktop uses one or two wrapped lines before the results toolbar.
- Mobile uses wrapped compact labels rather than a horizontal scroller.
- Focus remains on the nearest surviving ledger item after removal; when the final item is removed, focus moves to Search.
- A polite live region announces `Removed {filter}. {count} restaurants.` after the result update, not before.

---

## 9. Sorting specification

### Approved V1 set

| URL value | Label | Deterministic tie-break |
| --- | --- | --- |
| `stars-desc` | Michelin stars: high to low | Restaurant name A–Z |
| `stars-asc` | Michelin stars: low to high | Restaurant name A–Z |
| `name-asc` | Restaurant name: A–Z | Stable slug |
| `city-asc` | City: A–Z | Restaurant name A–Z |
| `price-desc` | Price: high to low | Restaurant name A–Z |
| `price-asc` | Price: low to high | Restaurant name A–Z |

### Default and search relevance

- With no search query, the effective default is `stars-desc`.
- With an active search query and no explicit user-controlled `sort`, the effective order is Relevance.
- Relevance is a search-match order, not a restaurant-quality judgment. It ranks normalized exact restaurant-name matches, name-prefix matches, restaurant-name token matches, and then city/state/cuisine matches. Every equal relevance tier uses restaurant name A–Z as the tie-break.
- `Relevance` appears in the sort control only while a query is active and only as the automatic current order. It is not a general browse option.
- If a visitor explicitly chooses one of the six approved sorts while a query is active, preserve that choice in `sort`; clearing the explicit sort returns the active query to Relevance.
- Removing the query preserves an explicit approved sort. If there is no explicit sort, the order returns to Michelin stars high to low.
- Do not add `recommended` in V1. `Recommended`, `Best`, `Top rated`, and `Most popular` require a separate transparent model and product approval.

### Retire

- Retire Restaurant name Z–A; it has little directory value.
- Retire State sort; City provides a more useful place scan and State remains a filter.
- Retire the current `featured` value after a backward-compatible alias/redirect to `stars-desc`.
- Do not add “Best,” “Top rated,” “Most popular,” “Recommended,” “Trending,” “Nearest,” or reservation-availability sorts.

### Behavior

- Sort applies immediately and resets page to 1.
- It preserves search, filters, and view.
- Every comparator is total and deterministic.
- Missing price sorts after known prices in both price directions and is then ordered by restaurant name.
- Sort selection creates one browser-history entry and announces the updated result order.

---

## 10. Grid card specification

### Shared contract

Create one shared editorial restaurant-card contract for Homepage, Explore, taxonomy/related restaurants, Saved restaurants, and Collections. Variants change composition, not the truth model.

Required public fields:

- stable restaurant ID/slug;
- restaurant name;
- Michelin distinction;
- cuisine or explicit missing-cuisine label;
- city/borough and state;
- price or explicit missing-price label;
- resolved media presentation;
- detail URL.

Personal presentation fields:

- Save state;
- local mutation state;
- sync attention state only when needed.

Do not place private Passport content, reservation URLs, ratings, review counts, Google fields, planning details, or visit data in this shared card contract.

### Explore grid composition

- Media ratio: 4:3 at every grid breakpoint.
- Card body order: media → Michelin distinction → restaurant name → cuisine → city/state and price.
- Save is a 44×44 overlay at media top-right.
- The media/name/content area provides one clear detail link.
- Approved actions: Save and Open details only.
- Do not add Plan, Record Visit, Official website, Guide, share, directions, or overflow actions.

### Height and text strategy

- Grid rows stretch to equal height.
- Media reserves its final ratio before load.
- Restaurant name: maximum two lines; do not reduce font size to fit.
- Cuisine: one line with ellipsis; full value remains available to assistive technology.
- Location: one line at desktop/tablet, up to two at phone widths.
- Price stays in normal flow; it is never absolutely positioned.
- Reserve a consistent metadata block height so missing/long values do not break row rhythm.
- Card height is content-driven with equal row stretching, not a brittle fixed pixel height.

### Missing metadata

- Missing cuisine: display `Cuisine not listed`.
- Missing price: display `Price not listed`.
- Use muted utility text, not em dashes without meaning.
- Missing fields do not remove their semantic labels from list view.

### Media states

- `verified`: approved restaurant-specific card variant.
- `representative`: approved cuisine/dining-style image with visible `Representative image` label.
- `initials`: designed monogram/atlas fallback.
- `loading`: fixed-ratio skeleton.
- `error`: resolve immediately to the next approved fallback; never show a broken image icon.

### Hover, focus, and motion

- Hover: image scale no more than 1.02 plus a restrained name color change.
- No large lift, shadow bloom, or action reveal required to understand the card.
- Detail focus and Save focus are separate, visible, and not clipped.
- Focus outline: at least 2px with 2px offset and 3:1 adjacent contrast.
- Reduced motion disables scale/transition displacement.

### Save presentation

- Unsaved: outline bookmark/heart according to the approved shared icon.
- Saved: filled state without requiring color alone.
- Accessible labels include the restaurant name: `Save Addison to Passport` and `Remove Addison from saved restaurants`.
- Pending local mutation uses `aria-busy` and preserves the label.
- Normal synced or device-only state adds no badge to the card.
- Failed sync adds a small, textual recovery affordance only for the affected restaurant.

### Mobile grid

- One card per row.
- Full-width 4:3 media.
- Name remains two lines maximum.
- Metadata uses two compact lines.
- Save stays 44×44 and at least 8px from media edges.
- The card never becomes a miniature desktop multi-column composition.

---

## 11. List-row specification

List view must optimize scanning rather than stretch the grid card.

### Desktop

- Thumbnail: 144×108 at 1440/1280.
- Identity column: distinction and restaurant name.
- Metadata column: cuisine, then location.
- Price column: explicit price or missing label.
- Save action: fixed 44×44 end column.
- The row’s identity/content region links to restaurant details.
- Row minimum height: 132px including padding.
- Hairline divider only; no enclosing card border or shadow.

### 1024px

- Thumbnail: 128×96.
- Identity and metadata may combine into one flexible column.
- Price and Save remain aligned at the end.
- Restaurant name wraps to two lines.

### 768px

- Thumbnail: 112×84.
- Distinction, name, and one metadata line occupy the center.
- Price may join the metadata line.
- Save stays at row end.

### 430/390/375px

- Keep List mode only as a true compact row.
- Thumbnail: 88×88 square.
- Content: distinction text, two-line name, then one cuisine/location line.
- Price may appear on the final metadata line when it fits.
- Save uses a 44×44 control aligned top-right or as an image overlay without covering the subject.
- Row minimum height: 112px.
- Do not expand the thumbnail to full width.

This compact mobile pattern is approved because it gives List a genuine scan-density benefit. It is a blocking requirement at 375px: preserve readable metadata, the 88×88 image, and 44px targets without horizontal overflow.

---

## 12. Pagination specification

### Model

- Preserve server-driven pagination.
- Preserve page size: 24.
- Do not adopt infinite scroll.
- Do not adopt “Load more” because it complicates canonical URLs, Back/Forward, footer access, and return-to-position behavior.

### URL

- Page 1 omits `page`.
- Page 2+ uses `page={positiveInteger}`.
- All pagination links preserve normalized search, filters, sort, and view.
- Out-of-range page values canonicalize to the last valid page; empty results canonicalize to page 1 with `page` omitted.

### Desktop/tablet

- Previous and Next links.
- First page, last page, current page, and a small current-page window.
- Ellipses are noninteractive.
- Current page uses `aria-current=page`.
- Link names include destination: `Go to page 3`, `Previous page`, `Next page`.

### Phone

- Previous and Next links remain 44×44 or larger.
- Show `Page {page} of {totalPages}` between them.
- Omit the full numbered page window to prevent horizontal overflow.
- The last page never renders an enabled Next action.

### Scrolling and history

- Forward pagination lands at the `Restaurant results` heading/toolbar, below sticky search chrome.
- Filter/search/sort/view changes also reset to the result region after the new count is available.
- Browser Back/Forward restores the browser’s prior scroll position and result state.
- Do not unconditionally call `scrollTo(0, 0)` on every URL change.
- Test Next.js 16 Link scroll behavior with the sticky header and use a stable results anchor/`scroll-margin-top` if required.

### Loading

- Navigation is interruptible.
- Keep current controls visible, mark results busy, and show same-dimension result skeletons when the transition lasts long enough to be perceptible.
- Prevent double activation while one pagination navigation is pending.

---

## 13. URL-state contract

### Canonical parameters

| Parameter | Accepted value | Default / omission |
| --- | --- | --- |
| `q` | Trimmed string, maximum 100 characters | Empty / omitted |
| `stars` | `1`, `2`, or `3` | Any / omitted |
| `state` | Valid canonical state slug | All states / omitted |
| `city` | Valid canonical city slug; compatible with `state` when present | All cities / omitted |
| `cuisine` | Valid canonical cuisine slug | All cuisines / omitted |
| `price` | `$$`, `$$$`, or `$$$$` | Any / omitted |
| `sort` | One of the six user-controlled values from Section 9 | Omitted means Relevance when `q` is active, otherwise `stars-desc` |
| `view` | `grid` or `list` | `grid` / omitted |
| `page` | Integer from 2 through total pages | Page 1 / omitted |

`focus=search` is UI-only and is removed after the first interaction. It does not change results and is not included when a result URL is shared from the page.

### Normalization rules

- Read the Page `searchParams` prop on the server; do not make the entire result route depend on client `useSearchParams`.
- Normalize before querying.
- Known invalid enum/slug values are removed, not treated as literal zero-result filters.
- If `state` is invalid, remove both State and City.
- If City is invalid or incompatible with State, remove City and retain the valid State.
- Unknown parameters do not affect results and are excluded from generated Explore links.
- Repeated parameters use the first valid value and canonicalize to one value.
- Default values are omitted from generated URLs.
- The rendered controls always reflect the normalized query.
- Server and client must share one parser/serializer contract or equivalent generated types; they may not carry separate value lists.

### Navigation semantics

| Action | History | Page reset |
| --- | --- | --- |
| Search submit/clear | Push | Yes |
| Desktop facet selection | Push | Yes |
| Mobile Apply | One Push | Yes |
| Remove active filter | Push | Yes |
| Clear all | Push | Yes |
| Sort change | Push | Yes |
| View change | Push | Yes |
| Pagination | Push | No; sets requested page |
| Invalid direct URL normalization | Replace/redirect to canonical URL | As normalized |

### Required verification

- Copying the URL in a new browser context reproduces the same query, ordering, view, and page.
- Back and Forward restore every submitted state without duplicate history entries from drafts.
- Removing a filter removes only its URL value plus declared dependencies.
- Page is reset when any filter/search/sort/view change invalidates the current offset.
- A mismatched State/City URL never renders a false “no restaurants” state.
- Hydrated controls do not change values after first paint.

---

## 14. Personal-state behavior

Public result data and personal Save data remain separate. The server result cache must not vary by user.

| User/state | Card behavior |
| --- | --- |
| Signed out, unsaved | Outline Save. Clicking writes to the device; no auth interruption. |
| Device-only, saved | Filled Saved state. No sync badge. |
| Signed in, synced | Filled Saved state. `Synced` is normally omitted. |
| Signed in, sync pending | Filled Saved state. Normal short-lived pending is represented in the global Passport sync surface, not repeated on every card. |
| Signed in, prolonged/offline pending | Filled Saved state. The affected card may show `Saved on this device` if the user needs truthfulness at the action point. |
| Signed in, sync failed | Filled Saved state plus `Sync failed` and Retry on the affected card or its immediate toast/status region. |
| Local Save write failed | Keep Unsaved, announce `Couldn’t save on this device. Try again.`, and retain an enabled retry action. |
| Local Unsave write failed | Keep Saved, announce the failure, and do not claim removal. |

### Rules

- Local mutation completes before cloud status can be claimed.
- Planning and visit actions do not appear on Explore cards.
- Saved state does not change result ordering unless a future explicit Saved filter/sort is approved.
- Do not duplicate one personal-state query per card. The identifier-based Passport provider exposes a slug-keyed snapshot to all 24 Save controls.
- Hydration may change only the Save icon/status, not card geometry.
- The full restaurant catalog does not enter the Passport provider.
- Cloud failure preserves local work and uses the durable outbox from Stage 1.
- Retry is idempotent.

---

## 15. Partial-media behavior

### Priority

1. active verified restaurant image;
2. active approved representative cuisine/dining-style image;
3. designed initials/atlas fallback.

### Mixed-grid coherence

- Every media surface uses the same 4:3 ratio in Grid.
- Verified photography, representative imagery, and initials fallback share the same corner radius, focal treatment, and distinction placement.
- Representative imagery has a visible `Representative image` utility label.
- Initials fallback uses a restrained monogram, restaurant-specific deterministic palette, and atlas linework; it is a designed state, not an error panel.
- Fallback palette must remain quieter than real photography so mixed grids do not become a checkerboard of saturated tiles.
- Do not place the full restaurant name inside the fallback and repeat it immediately below unless truncation testing proves the monogram alone is insufficient.
- Missing media never affects eligibility, sorting, result count, or pagination.

### Image error

- A failed verified URL advances to representative then initials without changing card dimensions.
- Log the public asset ID, variant, and failure class operationally; do not log personal state.
- Do not show a page-level media error when restaurant records loaded.
- Repeated failures for one asset should be suppressed/cached for the session to avoid 24 repeated requests.

### Accessibility

- Card photography is decorative when the linked restaurant name/location already communicates the destination; use empty alt text.
- A representative/initials fallback does not pretend to be a restaurant photograph.
- Distinction and restaurant identity remain real text outside the image.

---

## 16. Loading states

### Initial route

- Shared header/footer remain stable.
- Preserve the H1/search/filter shell dimensions.
- Result toolbar shows skeleton count/sort/view geometry.
- Render 24 fixed-ratio card skeletons for Grid or 24 row skeletons for List so page geometry and pagination transitions remain stable.
- Skeletons use the exact responsive column/row layout of final results.
- Do not flash initials before a verified image resolves.
- `aria-busy=true` belongs on the result region; include one screen-reader message `Loading restaurants…`.

### Search/filter/sort/view/pagination transition

- Preserve current controls and submitted values.
- Disable only the control that would create a duplicate submission; other navigation remains interruptible.
- After approximately 100ms, show a subtle progress rule or skeleton overlay.
- Do not blank the entire page or replace the shared header.
- A newer navigation supersedes an older one.

### Personal state

- Save controls reserve 44×44 from first paint.
- Before the Passport store is ready, render a disabled neutral Save control with the same geometry and accessible loading name.
- Hydration changes state without moving text or media.

### Images

- Use ingestion-generated dimensions and responsive `sizes`.
- Lazy-load below-the-fold images.
- Preload at most the true first-row LCP candidate if measurement proves it is the LCP.
- Skeleton and final media share exact ratio and border radius.

---

## 17. Empty states

### No restaurants match selected filters

**Heading:** `No restaurants match these filters`

**Body:** `Remove a filter or clear them all to broaden the list.`

**Actions:** `Remove last filter` and `Clear all filters`

Keep active filters visible above the state.

### Search returns no results

**Heading:** `No restaurants found for “{query}”`

**Body:** `Try a restaurant name, city, state, or cuisine.`

**Actions:** `Clear search` and `Browse all restaurants`

Preserve any separately active facet filters when clearing only Search.

### City becomes invalid after State changes

Do not show an empty grid. Clear City atomically and show a concise inline status:

`City cleared because it is not in {state}.`

Action: `Undo` only if the previous State/City combination can be restored as one valid history transition; otherwise omit Undo.

### Restaurant data fails to load

This is an error state, not an empty catalog:

**Heading:** `Restaurants couldn’t load`

**Body:** `Your filters are still here. Try loading the list again.`

**Actions:** `Try again` and `Explore the map`

### Media fails while restaurant records load

Do not show a page empty state. Render per-card fallback and keep every result/action.

### Passport Save fails locally

Do not change the whole result region. Show action-local status or a focused toast:

`Couldn’t save {restaurant} on this device. Try again.`

### Cloud synchronization fails after local Save

Keep the card Saved:

`Saved on this device. Sync failed.`

Action: `Retry sync`

---

## 18. Error and recovery states

### Public query error

- Add an Explore route-level error boundary so Header and Footer remain available.
- Preserve only non-sensitive normalized query display where safe.
- Provide `Try again` using the current Next.js 16 error-boundary retry API verified at implementation time.
- Provide an Explore reset link and Map alternative.
- Do not expose error messages, stack traces, file paths, or source terminology.

### Expected invalid query

- Normalize rather than throw.
- Canonicalize the URL.
- Render a non-repeating polite notice only when the user’s in-page action caused a dependent value to clear.

### Combobox option failure

- Keep the current selected value visible.
- Show `Options couldn’t load` in the popover/dialog and Retry.
- Do not clear already applied filters.
- Native State and static Price/Stars remain available.

### Media error

- Fall through the approved media chain within the card.
- Avoid repeated announcements.
- Preserve the detail link and Save action.

### Save/local-storage error

- Do not optimistically claim Saved after local persistence fails.
- Retain focus on the Save action.
- Provide Retry without forcing sign-in.

### Cloud sync error

- Preserve local Saved state.
- Mark only action/recovery surfaces, not all cards globally.
- Retry the existing outbox operation; do not create a duplicate mutation.

### Offline

- Public already-rendered results remain usable.
- New URL navigations may show the query error with Retry.
- Device Save remains available when local storage works.
- Signed-in Saves display device truth, not false Synced state.

---

## 19. Desktop layouts

### 1440px

- Shared header: approved desktop shell.
- Content max width: 1280px; 64px side margins at full width.
- Page header top/bottom spacing: 56px / 32px.
- H1: 52–56px; introduction max width 720px.
- Search: full content width, 52px minimum height.
- Filter row: all five controls plus conditional Clear on one line.
- Active ledger: wraps below filters with 8px gaps.
- Result toolbar: count left; Sort and Grid/List right.
- Grid: 4 columns, 24px horizontal gap, 40–48px vertical gap.
- List: 144×108 thumbnails with aligned metadata columns.
- Pagination: numbered window centered below results.
- Footer: standard desktop composition.

### 1280px

- Content width: viewport minus 96px, max 1184px.
- H1: 48–52px.
- Search remains full width.
- Filter row remains one line when labels fit; Cuisine/City controls flex rather than force page overflow.
- Grid: 4 columns only while cards retain at least 260px content width; otherwise 3 columns is acceptable between exact breakpoints.
- Gap: 20–24px.
- List and pagination retain 1440 behavior.
- No control may depend on the exact absence of a browser scrollbar.

---

## 20. Tablet layouts

### 1024px

- Content margin: 32px.
- H1: 44–48px.
- Search remains full width.
- Desktop filter system remains visible but may wrap Price and Clear to a second line.
- Sticky search/filter height: at most 208px.
- Active ledger wraps.
- Result count stays left; Sort and view stay right.
- Grid: 3 columns, 20px gap.
- Card image: 4:3.
- List thumbnail: 128×96.
- Pagination retains numbered window with smaller gaps.
- Footer may remain two-column.

### 768px

- Content margin: 24px.
- H1: 40–44px.
- Search row followed by one Filters button; no visible facet controls.
- Filters open a full-height right drawer.
- Result toolbar may use two rows: count first; Sort and view second.
- Grid: 2 columns, 20px gap.
- Card image: 4:3.
- Active ledger wraps to multiple lines.
- List thumbnail: 112×84.
- Numbered pagination uses a reduced window.
- Footer stacks brand and navigation.
- No required horizontal scrolling.

---

## 21. Mobile layouts

### Shared at 430px, 390px, and 375px

- Shared mobile header.
- Search and Filters form a compact sticky region no taller than 132px.
- Search is full width.
- Filters is full width below Search or shares a row only when both controls retain clear labels and 44px height.
- No quick-filter carousel.
- Active ledger wraps in document flow.
- Result count appears above Sort/view.
- Grid: one column.
- Grid image: 4:3.
- List: compact 88×88 rows, subject to the Section 32 approval.
- Pagination: Previous · `Page X of Y` · Next.
- Footer remains reachable.
- All touch targets are at least 44×44.
- No element produces document-level horizontal overflow.

### 430px

- Page margin: 20px.
- H1: 38–40px, maximum three lines.
- Introduction: 17px/26px.
- Sort may occupy 220px; Grid/List uses two 44px icon controls with visible text when it fits.
- Card name: 22–24px.
- Filter dialog uses the full visual viewport and safe areas.

### 390px

- Page margin: 20px.
- H1: 36–38px, maximum three lines.
- Sort and view may stack if their combined intrinsic width exceeds 350px.
- Active labels remain fully removable without horizontal scroll.
- Card metadata can wrap to two lines.
- `documentElement.scrollWidth <= 390`.

### 375px

- Page margin: 16px.
- H1: 34–36px.
- Search, Filters, Sort, view, Save, and pagination retain 44px minimum targets.
- Sort uses full width above the view toggle if needed.
- Active ledger uses smaller horizontal padding, never smaller body text.
- Compact list content must fit beside an 88px image without clipping Save.
- `documentElement.scrollWidth <= 375`; the current 380px regression is a release blocker.

---

## 22. Component tree

```text
ExplorePage (server; reads and normalizes searchParams)
└── ExplorePageView
    ├── ExplorePageHeader
    ├── ExploreDirectoryToolbar
    │   ├── ExploreSearchForm
    │   ├── DesktopExploreFilters (client island)
    │   │   ├── DistinctionPopover
    │   │   ├── StateSelect
    │   │   ├── CityCombobox
    │   │   ├── CuisineCombobox
    │   │   └── PriceSegments
    │   └── MobileExploreFilters (client island)
    │       ├── FiltersTrigger
    │       └── ResponsiveFilterDialog (viewport overlay)
    ├── ActiveFilterLedger
    ├── ExploreResultsToolbar
    │   ├── ResultCountStatus
    │   ├── ExploreSort
    │   └── ExploreViewToggle
    ├── RestaurantResults (server)
    │   ├── ExploreGrid
    │   │   └── RestaurantDiscoveryCard × ≤24
    │   │       └── SaveAction (identifier-only client island)
    │   └── ExploreList
    │       └── RestaurantListRow × ≤24
    │           └── SaveAction (identifier-only client island)
    ├── ExplorePagination
    ├── ExploreEmptyState | ExploreQueryError
    └── SiteFooter (shared shell)
```

### Data boundary

The route result model contains only:

- normalized public query;
- bounded filter facets/counts;
- total result count and total pages;
- at most 24 public restaurant summaries;
- resolved card/thumbnail media presentation for those 24;
- generated canonical links.

It does not contain:

- all restaurant records;
- Google Places fields;
- reservation/provider data, because the approved Explore card contract contains no reservation action;
- Passport notes, plans, visits, or account data;
- raw media rights records beyond the public asset fields required to render/credit correctly.

---

## 23. Accessibility requirements

### Regions and semantics

- One H1.
- Search uses a semantic `role=search` with a persistent visible or screen-reader label.
- Filters use a labeled region.
- Results use a labeled region with heading `Restaurant results`.
- Result items are a semantic list of articles.
- Pagination is a navigation landmark with `aria-label="Restaurant result pages"`.

### Fields

- Every select, combobox, radio group, and segmented control has a programmatic label.
- Comboboxes follow the ARIA combobox pattern with input, listbox, active descendant, option state, Escape, Enter, arrows, Home/End, and typed filtering.
- State/City dependency is announced.
- Counts in option labels are supplementary; they do not replace names.
- Price symbols have an accessible label such as `Four-dollar price level`.

### Updates

- Result count is one polite live region.
- Announce only completed search/filter/sort/page updates.
- Do not announce every keystroke or background image fallback.
- Pending regions use `aria-busy`.
- Invalid City clearing is announced once.

### Cards and rows

- Restaurant detail links have complete names.
- Save labels include restaurant names.
- Michelin distinction exposes text such as `Three Michelin stars`.
- Image/fallback/color is never the only carrier of identity, distinction, Saved, or error state.
- DOM order matches visual order.
- No nested interactive element sits inside the detail link.
- Keyboard focus never triggers navigation by itself.

### Dialog

- `role=dialog`, `aria-modal=true`, labeled heading.
- Background inertness.
- Initial focus, Tab containment, Escape close, Close action, and trigger focus restoration.
- Visual viewport and safe-area support.
- Screen-reader users can reach Reset and Apply without traversing background content.

### Visual and motor

- Normal text contrast ≥4.5:1; large text/UI boundaries/focus ≥3:1 as applicable.
- Focus is visible in all image, fallback, sticky, and error states.
- Touch targets ≥44×44.
- 200% zoom and effective 320px width remain operable without two-dimensional scrolling.
- Reduced motion removes image zoom and nonessential animated transitions.
- Do not rely on hover for Save, details, filter state, or errors.

---

## 24. Performance architecture

### Server-owned query

- Parse and normalize `searchParams` in `ExplorePage`.
- Pass the normalized query as plain arguments to a route-owned query function.
- Return one 24-item page plus total and facets.
- The current 271-record JSON may be scanned server-side while it remains the canonical source; the public boundary must still return only bounded results.
- When the source becomes database-backed, filter/count/paginate in the data source rather than loading all records into application memory.

### Next.js 16 caching

- Follow the cache mode enabled by the then-current `next.config.ts`.
- If Cache Components is enabled, read runtime `searchParams` outside the cached scope and pass normalized values into the cached public query function, as required by the installed Next.js 16 guidance.
- Tag public restaurant/media query caches for publication-driven invalidation.
- Do not cache user Passport state in public result entries.
- Use a stable normalized query key so equivalent URLs share results.
- Do not enable remote caching solely for this route without measured need and an approved platform plan.

### Navigation and stale-result protection

- Use server navigation for committed query changes.
- Keep drafts local only in Search/mobile Filters.
- Newer navigation supersedes older navigation.
- Any future combobox fetch uses `AbortController` or equivalent request cancellation and ignores stale sequence IDs.
- Existing `loading.tsx` remains the route transition boundary; implementation must verify current Next.js 16 instant-navigation guidance before enabling any new route export.

### Images

- Resolve approved card/thumbnail variants on the server.
- Use the current Next.js Image component contract with intrinsic dimensions or `fill`, accurate `sizes`, and configured remote patterns/loader as required by the media store.
- Lazy-load below the fold.
- Preload no more than the measured LCP candidate.
- Content-hash variant URLs use immutable caching.
- Failed media falls back without causing a second layout.

### Client JavaScript

- Keep Search as a progressively enhanced GET form.
- Use one desktop filter island and one responsive dialog island, not one client component per static option.
- Save controls consume one identifier-based Passport context snapshot.
- Do not hydrate the result grid solely to render public text.
- Do not import canonical restaurant JSON through any client graph.

### Query and prefetch cost

- Page links are real links.
- Avoid prefetching all 24 detail routes plus every numbered pagination route on initial view. Use Next.js link prefetch controls based on production measurement; adjacent pagination and likely visible detail links take priority.
- Do not request media for results outside the current page.
- Do not run duplicate public queries for Grid and List; both consume the same 24 summaries.
- Do not run one Saved-state request per restaurant.

### Stability targets

- LCP ≤2.5s p75.
- CLS ≤0.1.
- INP ≤200ms.
- No Explore-specific client payload contains all restaurant records.
- No layout shift from images, Save hydration, result count, filter labels, or skeleton replacement.
- 375px has no horizontal overflow.

---

## 25. Analytics events

Analytics must not contain raw search text, email, account/user IDs, private notes, plan dates/content, visit content, favorite dishes, ratings, or exact personal history.

| Event | Trigger | Allowed properties |
| --- | --- | --- |
| `explore_search_submitted` | Explicit Search/Enter | `source: explore_header`, `query_length_bucket`, `active_filter_count`, `result_count_bucket` |
| `explore_filter_applied` | One facet applied | `facet`, `public_value_slug`, `surface: desktop_mobile`, `active_filter_count`, `result_count_bucket` |
| `explore_filter_removed` | Ledger removal | `facet`, `surface`, `remaining_filter_count` |
| `explore_filters_cleared` | Clear all | `surface`, `cleared_filter_count` |
| `explore_sort_changed` | Sort commit | `from`, `to`, `result_count_bucket` |
| `explore_view_changed` | Grid/List commit | `from`, `to`, `viewport_class` |
| `explore_pagination_used` | Page link | `from_page`, `to_page`, `direction`, `result_count_bucket` |
| `explore_restaurant_opened` | Detail link | `restaurant_slug`, `position_on_page`, `page`, `view`, `media_mode` |
| `explore_restaurant_saved` | Local Save succeeds | `restaurant_slug`, `position_on_page`, `view`, `sync_mode: device_pending_synced` |
| `explore_save_sync_failed` | Outbox exhausts retries | `restaurant_slug`, `view`, `error_class`, `offline` |

Rules:

- Public facet slugs are allowed; `q` is not.
- Result counts use coarse buckets where analytics does not need an exact number.
- Do not log draft keystrokes, dialog opens without action, image alt text, or private recovery payloads.
- Operational media/request errors go to privacy-reviewed error logging, not product analytics.

---

## 26. Files likely to change

This is a forecast for a later implementation plan, not authorization.

### Existing route/data files

- `src/app/explore/page.tsx`
- `src/app/explore/loading.tsx`
- `src/lib/data/explore.ts`
- `src/lib/data/search.ts`
- `src/lib/data/restaurants.ts`
- `src/config/homepage.ts` to remove Explore ordering coupling only
- `next.config.ts` only as required by the approved media/cache foundation

### Existing Explore components

- `src/components/stitch/explore/ExplorePageView.tsx`
- `src/components/stitch/explore/ExplorePageHeader.tsx`
- `src/components/stitch/explore/DiscoveryToolbar.tsx`
- `src/components/stitch/explore/ExploreSearchForm.tsx`
- `src/components/stitch/explore/ExploreQuickFilters.tsx`
- `src/components/stitch/explore/AllFiltersDrawer.tsx`
- `src/components/stitch/explore/ActiveFilters.tsx`
- `src/components/stitch/explore/ExploreResultsToolbar.tsx`
- `src/components/stitch/explore/ExploreGrid.tsx`
- `src/components/stitch/explore/ExploreList.tsx`
- `src/components/stitch/explore/ExplorePagination.tsx`
- `src/components/stitch/explore/ExploreEmptyState.tsx`
- `src/components/stitch/explore/ExploreLoadingState.tsx`
- `src/components/stitch/explore/filters.tsx`
- `src/components/stitch/explore/models.ts`
- `src/components/stitch/explore/adapters.ts`
- `src/components/stitch/explore/index.ts`

### Shared restaurant/personal components

- `src/components/stitch/restaurant/models.ts`
- `src/components/stitch/restaurant/adapters.ts`
- `src/components/stitch/restaurant/RestaurantDiscoveryCard.tsx`
- `src/components/stitch/restaurant/RestaurantListRow.tsx`
- `src/components/stitch/restaurant/RestaurantMedia.tsx`
- `src/components/stitch/restaurant/RestaurantFallback.tsx`
- `src/components/stitch/restaurant/RestaurantMeta.tsx`
- `src/components/stitch/restaurant/SaveAction.tsx`
- `src/lib/passport/PassportProvider.tsx` or the approved V3 replacement
- `src/components/passport/PassportClientShell.tsx`

### Shared shell/overlay

- `src/components/shell/AppHeaderClient.tsx`
- `src/components/stitch/Drawer.tsx` only if it becomes a correct viewport-level responsive overlay
- `src/app/globals.css`

### Likely new files

- `src/app/explore/error.tsx`
- `src/config/explore.ts`
- `src/lib/explore/get-explore-page.ts`
- `src/components/stitch/explore/DesktopExploreFilters.tsx`
- `src/components/stitch/explore/MobileExploreFilters.tsx`
- `src/components/stitch/explore/ResponsiveFilterDialog.tsx`
- `src/components/stitch/explore/ExploreCombobox.tsx`
- `src/components/stitch/explore/ActiveFilterLedger.tsx`
- focused unit tests for URL normalization, sorting, media presentation, and personal card state

### Tests

- `e2e/explore.spec.ts`
- `scripts/test_explore.mjs`
- `scripts/test_explore_ui.mjs`
- shared restaurant-card and Passport sync tests affected by the approved contract

Exact filenames are not binding until the implementation plan inspects the then-current tree.

---

## 27. Components to reuse

- `AppChrome`
- `AppHeaderClient`, after `/explore?focus=search` handoff
- `SiteFooter`, after approved shared copy cleanup
- `PageContainer`
- `SearchInput`
- `Button`
- `IconButton`
- `MichelinDistinction`
- `RestaurantMeta`, after explicit missing-value behavior
- `RestaurantDiscoveryCard`, as the shared contract rather than the current reservation-heavy composition
- `RestaurantListRow`, after scan-density redesign
- `RestaurantMedia`, after approved media registry/Image integration
- `RestaurantFallback`, after representative/initials states are distinct
- `RestaurantCardSkeleton` and `RestaurantRowSkeleton`, after geometry matches final cards
- `SaveAction`, after restaurant-specific accessible names and truthful V3 sync state
- `ExplorePagination` query/link helpers
- `parseExploreSearchParams`, `buildExploreHref`, filtering, facet, and pagination logic after validation/sort updates
- the shared overlay/dialog focus-management behavior, provided it is rendered at viewport scope and passes the new geometry tests

Reuse preserves contracts and tested behavior; it does not require retaining a component’s current layout or inappropriate actions.

---

## 28. Components to retire

- Current `ExploreQuickFilters`: retire the horizontally scrolling five-select implementation.
- Current `AllFiltersDrawer`: retire the duplicated filter contents and nested sticky rendering.
- “All Filters” desktop control: remove because there are no additional filters.
- Current `ActiveFilters` horizontal mobile scroller: replace with the wrapping ledger.
- Duplicate header-level result count: remove.
- Current mobile List behavior that expands media to full width: replace with the approved 88×88 compact row.
- Explore use of `ReservationAction`: remove from Grid and List. Do not delete ReservationAction from detail-page consumers.
- Current raw-image-only media path for approved card imagery: replace with the approved responsive variant contract.
- Current `featured` Explore sort coupling to `homepageConfig`: retire through a backward-compatible normalization.
- Current name Z–A and State sort options.
- Any proof-state/test assertion that requires the clipped drawer, duplicated filters, reservation action, initials-only cards, or 390-only mobile overflow coverage.

---

## 29. Risks and dependencies

| Risk/dependency | Severity | Response |
| --- | --- | --- |
| Stage 1 media registry is not implemented when Explore work starts. | High | Ship the shared contract and designed fallbacks first; do not fake photography or block restaurants. |
| Passport V3/outbox is not implemented. | High | Do not claim cloud sync truth from current fire-and-forget writes; sequence Save status after the foundation. |
| Overlay remains nested under sticky/backdrop ancestors. | High | Render through a viewport-level overlay root and test exact bounding boxes at 768/430/390/375. |
| Searchable comboboxes introduce accessibility regressions. | High | Use a proven internal/shared primitive only after ARIA keyboard and screen-reader verification; retain native State select. |
| Contextual facet counts are expensive. | Medium | Measure source cost; use consistently labeled global counts if contextual counts exceed budget. |
| Search relevance becomes an opaque quality claim. | Medium | Limit relevance to documented field-match tiers and name A–Z ties; never label it Recommended or Best. |
| Removing Explore reservations lowers direct booking clicks. | Medium | Measure the change; the approved product boundary keeps booking on restaurant detail pages. |
| Mixed media makes the grid look unfinished. | Medium | Lock ratio, fallback art direction, labels, and palette; verify 0/25/50/100% media states. |
| 24 mobile cards create a long page. | Medium | Keep pagination, remove reservation button height, retain one-column cards, and offer a true compact List mode. |
| Mobile List becomes too dense at 375px. | Medium | Treat the 88×88 row, readable metadata, 44px Save target, and zero overflow as blocking acceptance criteria. |
| URL canonicalization causes redirect/history loops. | High | Use one parser/serializer, replace invalid direct URLs once, and add Back/Forward tests. |
| Result transitions lose scroll position behind sticky chrome. | Medium | Use a stable result anchor, measured scroll margin, and Next.js 16 navigation tests. |
| Root Passport provider still ships all restaurant records. | High | Treat Stage 1 full-catalog removal as a prerequisite for performance acceptance. |
| New image host/config is incomplete. | High | Fail to approved fallback and never bypass rights/security configuration. |
| Existing data has borough/city ambiguity. | Medium | Preserve Brooklyn as a borough/city filter and `Brooklyn, New York` label; use New York City grouping only on the Homepage index. |

---

## 30. Acceptance criteria

### Product and information architecture

- [ ] Explore contains one concise introduction and no marketing sections above the directory.
- [ ] One result count appears in the results toolbar.
- [ ] Header search reaches `/explore?focus=search` and focuses the Explore field.
- [ ] Search, filters, active state, sort, view, results, pagination, and footer follow Section 4 order.
- [ ] The page does not look or read like a database table or booking marketplace.

### Filters

- [ ] Desktop has no “All Filters” control.
- [ ] Desktop exposes Stars, State, City, Cuisine, Price, and conditional Clear.
- [ ] Control types match Section 5.
- [ ] City is searchable and responds to State.
- [ ] Cuisine is searchable.
- [ ] State changes atomically clear incompatible City.
- [ ] Active filters are visible, individually removable, and clearable together.
- [ ] Desktop selection applies immediately and resets page.
- [ ] Below 1024px there is one Filters control and no quick-filter row.
- [ ] Mobile edits stage until one Apply action.
- [ ] Mobile dialog fills the intended viewport, respects safe areas, traps focus, restores focus, and never nests another drawer.
- [ ] Michelin quick chips do not duplicate the mobile dialog.

### Search

- [ ] Name, city/borough, state/state code, and cuisine matching work.
- [ ] Search sends no result request per keystroke.
- [ ] Enter and Search submit the same query.
- [ ] Clear preserves facets and resets page.
- [ ] Pending and no-result feedback are accessible.
- [ ] Browser Back/Forward restore only submitted queries, not drafts.

### Sort/view/pagination

- [ ] With no query and no explicit sort, results use Michelin stars high to low and name A–Z ties.
- [ ] With a query and no explicit sort, results use the documented relevance tiers and name A–Z ties.
- [ ] `Recommended`, `Best`, `Top rated`, and `Most popular` do not appear.
- [ ] The six approved user-controlled sorts are deterministic.
- [ ] Explore ordering no longer imports Homepage curation.
- [ ] Unsupported “Best/Popular/Trending” sorts do not appear.
- [ ] Grid and List preserve the same result membership/order.
- [ ] List is meaningfully denser than Grid at every width where its control appears.
- [ ] Mobile List uses an approximately 88×88 image, compact metadata, a 44×44 Save control, and no reservation/planning/visit controls.
- [ ] Page size remains 24.
- [ ] Page 1 omits `page`.
- [ ] Numbered desktop/tablet and compact mobile pagination meet Section 12.
- [ ] Footer remains reachable.
- [ ] Forward page navigation lands at results; Back restores prior scroll.
- [ ] Empty final pages cannot render.

### URL

- [ ] Every canonical parameter in Section 13 round-trips.
- [ ] Copying a URL reproduces search, facets, sort, view, and page.
- [ ] Invalid known values are removed safely.
- [ ] Invalid/mismatched City never creates a false empty result.
- [ ] Out-of-range page canonicalizes.
- [ ] Default values are omitted.
- [ ] Server and hydrated controls agree on first paint.

### Cards/media

- [ ] Shared card contract supports Homepage, Explore, related, Saved, and Collections.
- [ ] Grid media is 4:3 and card rows remain coherent with uneven names/metadata.
- [ ] Names use at most two lines without unreadably small text.
- [ ] Missing cuisine/price uses explicit copy.
- [ ] Verified, representative, initials, loading, and error media states are visually intentional.
- [ ] Representative imagery is labeled.
- [ ] Restaurants without photos remain in results.
- [ ] Broken media never shows a broken-image icon or changes card geometry.
- [ ] Save and detail navigation remain available in every media state.

### Personal state

- [ ] Signed-out/device-only Save never forces login.
- [ ] Save labels include restaurant names.
- [ ] Local persistence failure does not claim Saved.
- [ ] Cloud failure preserves local Saved state and exposes Retry.
- [ ] Normal Synced/pending state does not clutter every card.
- [ ] One identifier-based Passport snapshot serves all 24 Save controls.
- [ ] No private Passport content enters public result cache or analytics.

### Loading/error

- [ ] Loading skeletons match final Grid/List geometry and reserve media dimensions.
- [ ] Result navigation is interruptible and stale results cannot overwrite newer state.
- [ ] Explore has a focused route-level error/retry surface.
- [ ] Data, media, local Save, and cloud sync failures remain distinct.
- [ ] Restaurant records remain usable when media fails.

### Responsive/accessibility

- [ ] Explicit behavior passes at 1440, 1280, 1024, 768, 430, 390, and 375px.
- [ ] Grid columns are 4/4/3/2/1/1/1 unless measured card minimums require the allowed 1280 fallback.
- [ ] No horizontal overflow at any required width or effective 320px/200% zoom.
- [ ] The 375px document is no wider than 375px.
- [ ] Every interactive target is at least 44×44.
- [ ] Search/results/filter/dialog semantics and labels pass keyboard and screen-reader review.
- [ ] Result-count and dependency updates are announced once.
- [ ] Focus is visible and restored correctly.
- [ ] Reduced motion is honored.
- [ ] No information depends on image or color alone.
- [ ] At 390px, the Filters dialog is viewport-level and is not constrained to the current approximately 212px height.
- [ ] At 375px, `documentElement.scrollWidth` does not exceed `documentElement.clientWidth`; the current approximately 380px document is a release blocker.
- [ ] No horizontal document scrolling occurs at 375px, 390px, or 430px.
- [ ] The filter surface uses the available visual-viewport width minus intentional outer gutters.
- [ ] Fixed children, selects, chips, and pagination remain within the viewport and cannot increase document width.

### Performance

- [ ] The browser receives at most 24 restaurant result summaries per page.
- [ ] The full restaurant catalog is absent from Explore result props and Passport client bundles.
- [ ] Public query caching follows installed Next.js 16 guidance and excludes personal state.
- [ ] Images use approved variants, intrinsic geometry, accurate `sizes`, and below-fold lazy loading.
- [ ] No duplicate public query runs solely for Grid/List.
- [ ] No one-request-per-card Saved-state pattern exists.
- [ ] LCP, CLS, and INP meet Section 24 targets or have a documented measured exception approved before release.

---

## 31. Screenshot verification plan

### Fresh evidence baseline

Compare against:

- `output/playwright/stage3-explore-evidence/explore-default-1440.png`
- `output/playwright/stage3-explore-evidence/explore-default-390.png`
- `output/playwright/stage3-explore-evidence/explore-filters-drawer-390.png`
- `output/playwright/stage3-explore-evidence/explore-filtered-list-1280.png`
- `output/playwright/stage3-explore-evidence/explore-filtered-list-390.png`
- `output/playwright/stage1-foundation/contact-explore.png`

### Required widths

Capture full-page and above-the-fold screenshots at:

- 1440×900
- 1280×900
- 1024×900
- 768×1024
- 430×932
- 390×844
- 375×812

Store implementation verification under:

`output/playwright/stage3-explore/{state}/explore-{width}.png`

### Required visual states

1. Default Grid with full verified media.
2. Default Grid with 0% verified media.
3. Mixed media at approximately 25%, 50%, and 75%.
4. Active Search only.
5. Multiple active filters with wrapped ledger.
6. State selected with scoped City options.
7. City-cleared dependency notice.
8. Desktop Stars popover.
9. Desktop City combobox search.
10. Mobile/tablet filter dialog with no active filters.
11. Mobile/tablet filter dialog with drafts and result preview count.
12. Grid and List at all seven widths.
13. Page 1, middle page, and final page.
14. No search results.
15. No filter results.
16. Public data error.
17. Broken verified image falling to representative and initials.
18. Signed out unsaved/saved.
19. Device-only Saved.
20. Signed in Synced, Pending, and Failed.
21. Local Save failure.
22. Route loading Grid and List.
23. Reduced motion.
24. 200% zoom/effective 320px.

### Interaction verification

- Header Search focuses Explore input.
- Search Enter/Button/Clear and Back/Forward.
- Every desktop filter applies and removes.
- State/City dependency in desktop and mobile drafts.
- Mobile Apply, Reset, Close, Escape, backdrop, focus trap, and focus return.
- Exact filter-dialog bounding box and safe-area footer at 768/430/390/375.
- Sort and view preserve search/facets.
- Pagination preserves state, lands at results, and restores Back scroll.
- Copy/paste URL in a clean context.
- Invalid query canonicalization.
- Save local success/failure and cloud Pending/Failed/Retry.
- Detail link from media, name, and list row.

### Automated measurements

Record for every width/state:

- viewport, `clientWidth`, `scrollWidth`, and `scrollHeight`;
- sticky header and search/filter heights;
- dialog/backdrop bounding boxes;
- grid column count and card widths;
- image ratio/rendered/intrinsic dimensions;
- Save/control target dimensions;
- H1/result toolbar/active-ledger bounding boxes;
- pagination and footer visibility;
- console errors;
- failed requests and stale request cancellations;
- transferred image/JavaScript bytes;
- LCP element/time, CLS, and INP;
- accessibility scan plus manual keyboard findings.

### Pass comparison

The final review must explicitly show:

- complete Filters is visible and usable at every width;
- the dialog is viewport-level rather than 212px tall;
- 375px is no longer 380px wide;
- Desktop no longer duplicates filters;
- mobile no longer has quick filters plus a second filter UI;
- cards no longer default to initials when approved media exists;
- fallback cards look intentional;
- List is meaningfully denser than Grid;
- result, URL, and browser-history behavior remain intact;
- Save/sync truth is visible only when needed;
- footer access remains easy.

---

## 32. Approved decision log

The product owner approved these binding Stage 3 decisions on 2026-07-18:

1. **Browse sorting:** with no query, use Michelin stars high to low; with a query and no explicit sort, use documented field-match Relevance; all ties use restaurant name A–Z.
2. **V1 sort vocabulary:** expose only Michelin stars high/low, restaurant name, city, and price high/low. Remove `Recommended`.
3. **Card actions:** Grid and List provide Save and Open details only. Reservation, official website, Plan, and Record Visit remain on restaurant detail.
4. **Mobile List:** retain it as a genuinely compact approximately 88×88 row; do not stretch the Grid card.
5. **Desktop filters:** remove “All Filters”; visible controls own the full filter vocabulary.
6. **Mobile filters:** use one viewport-level Filters dialog with no duplicated quick-filter interface.
7. **Pagination:** 24 results; numbered pages on desktop/tablet and Previous/Next with page status on phone.
8. **Responsive blockers:** fix the 390px approximately 212px-tall filter surface, the 375px approximately 380px-wide document, and every source of horizontal overflow at 375/390/430px.
9. **Homepage dependency:** Homepage featured layouts are limited to the explicitly designed F3, F4, and F5 compositions. Explore ordering must not depend on those compositions or featured slugs.

No Stage 3 product decision remains open. Implementation sequencing, the exact accessible combobox primitive, and analytics naming are engineering details to validate in a separately authorized implementation plan, not reasons to reopen the approved product direction.

## Hard stop

Stage 3 ends with this approved specification. Do not implement Explore, change production components, ingest media, create migrations, commit, or push. The next Explore action requires a separately authorized implementation plan.
