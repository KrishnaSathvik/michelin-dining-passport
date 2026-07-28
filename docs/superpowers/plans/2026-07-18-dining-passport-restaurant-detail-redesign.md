# Dining Passport Restaurant Detail Redesign Specification

**Stage:** 6 — Restaurant Detail page redesign  
**Date:** 2026-07-18  
**Status:** Approved product specification  
**Route:** `/restaurants/[slug]`  
**Scope:** Specification only. This document does not authorize production implementation, database changes, media ingestion, Google or map-provider configuration, commits, or pushes.

## Executive direction

Make the Restaurant Detail page one coherent editorial profile rather than a sequence of unrelated widgets. Use a stable desktop split: a responsive first-party gallery on the left and restaurant identity/actions on the right. That structure gives imagery and decision information equal importance, remains useful with one or five images, and avoids the fragility of overlapping panels.

The action system becomes:

1. Reserve a table, only when a valid direct or restaurant-owned reservation destination exists
2. Save
3. Plan a visit
4. Record a visit
5. Official website
6. Get directions

Save, Plan, and Record are the only primary Passport actions. Planning and recording a visit create the bookmark automatically. Personal summaries describe records—`Planned · August 12, 2026`, `Visited twice`, `Couldn’t sync · Retry`—rather than exposing independent boolean toggles.

Replace the 192px OpenStreetMap iframe with a substantial, lazy MapLibre location section using the approved provider abstraction. Replace the fixed Google sidebar with one bounded, optional `Current place information from Google` section below first-party details/location. Keep Google content inside the compliant Places UI Kit surface and keep Google ratings, photos, reviews, hours, and phone data out of first-party media, structured data, and personal notes.

---

## 1. Current-state findings

### Evidence reviewed

- Fresh SingleThread captures made on 2026-07-18:
  - `output/playwright/stage6-restaurant-detail-evidence/singlethread-1440.png`
  - `singlethread-1280.png`
  - `singlethread-1024.png`
  - `singlethread-768.png`
  - `singlethread-430.png`
  - `singlethread-390.png`
  - `singlethread-375.png`
  - `singlethread-plan-dialog-390.png`
- Stage 1 responsive captures:
  - `output/playwright/stage1-foundation/restaurant-detail-{1440,1280,1024,768,430,390,375}.png`
- Existing SingleThread/current design evidence:
  - `docs/ui-ux-rebuild/current/rejected-restaurant-detail.png`
  - `docs/stitch-redesign/baselines/restaurant-detail/*`
  - `docs/google-places/proof/*`
- Current route and components:
  - `src/app/restaurants/[slug]/page.tsx`
  - `src/components/stitch/restaurant-detail/*`
  - `src/components/stitch/restaurant/*`
- Current data/provider/personal boundaries:
  - `src/lib/data/types.ts`
  - `src/lib/data/restaurants.ts`
  - `src/lib/data/geocodes.ts`
  - `src/lib/reservations/*`
  - `src/lib/google-places/*`
  - `src/lib/passport/*`
  - `src/lib/seo/*`
- Tests:
  - `e2e/restaurant-detail.spec.ts`
  - `e2e/google-places.spec.ts`
  - `e2e/reservations.spec.ts`
  - `scripts/test_restaurant_detail.mjs`
  - `scripts/test_restaurant_presentation.mjs`

### Fresh browser measurements

| Viewport | Document size | Current hero height | First-party facts width | Google surface width |
| --- | ---: | ---: | ---: | ---: |
| 1440×900 | 1440×3396 | 555px | 748px | 380px |
| 1280×900 | 1280×3396 | 555px | 748px | 380px |
| 1024×900 | 1024×4022 | 547px | 492px | 380px |
| 768×1024 | 768×4350 | 738px | 640px | 640px |
| 430×932 | 430×6625 | 918px | 390px | 390px |
| 390×844 | 390×6493 | 888px | 350px | 350px |
| 375×812 | 375×6457 | 876px | 335px | 335px |

No horizontal document overflow appeared in this capture set. The problem is hierarchy and excess vertical repetition: the mobile page reaches roughly 6,500px even though it contains no gallery, description, useful personal history, or substantial map.

### Confirmed current behavior

1. The page server-renders canonical restaurant identity, reservation resolution, approved coordinates, related/nearby summaries, metadata, and JSON-LD.
2. `dynamicParams = false`, `generateStaticParams()`, and `notFound()` provide genuine unknown-slug 404 behavior.
3. The canonical `Restaurant` type contains name, Michelin stars, cuisine, price, city/state, address, Michelin Guide URL, and optional website.
4. The canonical record does not contain restaurant photography, gallery assets, editorial description, hours, phone, ratings, neighborhood, accessibility, dietary accommodations, dress guidance, or dining format.
5. `heroImage()` probes an undeclared `heroImageUrl`; current canonical records therefore fall through to designed initials.
6. The desktop hero is a 58/42 image/identity split with a fixed 500px media height.
7. `JourneyControls` renders Save, Want, Planned, Visited, and Favorite as independent toggles.
8. `RestaurantJourneySection` repeats planning and visiting through `Add planning details`/`Edit plan` and `Record visit`/`Edit visit`.
9. Current personal data is a single `UserRestaurantRecord` with booleans and one visit date; it cannot represent multiple visits.
10. Local Passport updates are immediate, but cloud writes are launched with `void upsertCloudRestaurant(...)`; failures are not placed in a durable outbox or exposed by the detail action.
11. The current location preview is a 192px-high OpenStreetMap export iframe, not the application’s MapLibre/provider abstraction.
12. The fresh accessibility snapshot exposed an untranslated marker control label inside that iframe.
13. Google Places UI Kit is lazy-loaded client-side, keeps content outside first-party view models/JSON-LD, and stores only approved Place IDs.
14. The live development capture received a Google provider 403 because the supplied key did not authorize the current origin. The page degraded to `Live Google place information is currently unavailable`.
15. Related restaurants are same-cuisine cards; nearby restaurants are same-city rows. Both can appear together even when their value is weak or repetitive.
16. Related cards and nearby rows currently include reservation actions, contrary to the approved shared editorial-card direction.
17. Consumer-facing source copy includes `dataset`, `workbook`, `roster`, and import dates.

### Foundations to preserve

- Canonical shared header/footer route shell.
- Genuine not-found routing.
- Server-rendered public identity.
- Reservation verification/fallback boundary.
- Approved geocode gate; never use guessed coordinates.
- Google Place ID-only persistence and UI Kit boundary.
- Related/nearby self-exclusion.
- Shared Michelin distinction text treatment without official artwork.
- Shared media registry, Passport V3, outbox, and MapLibre/provider decisions from Stage 1.

---

## 2. Functional defects

1. **The hero is initials-first.** No current canonical restaurant can provide gallery imagery.
2. **No gallery contract exists.** There is no image count, multi-image layout, full-screen viewer, attribution, keyboard navigation, or partial-coverage composition.
3. **The journey model is contradictory.** Want/Save and Favorite/Save overlap; Planned and Visited are both statuses and entry points.
4. **Actions are duplicated.** Planned repeats `Add planning details`; Visited repeats `Record visit`.
5. **Planning/visiting do not enforce Save.** Independent boolean patches can produce invalid combinations.
6. **Multiple visits are impossible.** Editing is keyed by restaurant rather than visit ID.
7. **Favorite is restaurant-level.** It cannot express which visit was a favorite and conflicts with the bookmark concept.
8. **Unsave consequences are undefined.** The page has no dependency-aware Remove from Passport flow.
9. **Sync truth is incomplete.** Optimistic local state can look successful after a cloud write fails.
10. **Dialog validation/recovery is incomplete.** Current Plan/Visit dialogs close immediately after synchronous local update and cannot surface durable sync recovery.
11. **The map is too small to support orientation.** It is visually an empty rectangle in failure captures and does not use the approved provider abstraction.
12. **The map iframe has an accessibility defect.** Its marker control exposes a missing localization string.
13. **The Google module reads as a second profile.** A fixed 380px sidebar sits beside sparse first-party content and can dominate it when populated.
14. **Provider failure remains visually heavy.** An unavailable Google card still occupies a prominent secondary column.
15. **Google/canonical duplication is uncontrolled.** The full UI configuration may repeat website/address-like information already shown first-party.
16. **Google photography cannot solve the hero.** Provider content cannot be copied into the first-party media registry under the current provider policy.
17. **No editorial-description trust contract exists.** Filler or copied Guide prose could be introduced without provenance controls.
18. **Details are sparse.** Missing optional fields create a large under-filled band rather than a content-driven layout.
19. **Related modules are oversized.** Up to six same-cuisine cards plus same-city rows make the mobile page extremely long.
20. **Related cards are transactional.** Reservation actions compete with discovery and repeat the main page action.
21. **Breadcrumbs can become long on mobile.** Home → Explore → State → City → Restaurant is accurate but not always readable.
22. **Return context is lost.** The page does not provide a dependable Back to filtered results/Map experience.
23. **Metadata has no verified media.** Open Graph uses a generic summary card.
24. **JSON-LD is too broad in some places and too sparse in others.** It emits generated description copy and `sameAs`, but no verified image/geo/reservation URL; it must never absorb Google ratings.
25. **Internal source terminology leaks into the page and footer.**
26. **The fixed mobile bar duplicates actions without representing Plan/Visit or state summaries.**
27. **Current tests protect the old defects.** They assert Want and the broad Google heading instead of the approved three Passport actions, provider boundary, multiple visits, and recovery.

---

## 3. Product goal

A visitor should understand the restaurant and its next useful actions within seconds:

1. restaurant identity;
2. Michelin distinction;
3. cuisine, destination, price, and address;
4. verified visual character when available;
5. reservation/official options;
6. Save, Plan, and Record;
7. location context;
8. meaningful existing Passport history.

The profile must be:

- image-led when verified media exists;
- identity-led and still complete when it does not;
- editorial, not marketplace-like;
- actionable without implying availability;
- personal without becoming a dashboard;
- source-aware without a methodology block;
- usable signed out, device-only, or signed in;
- resilient when every optional provider fails.

The canonical identity—not media, Google, MapLibre, related results, or personal state—is the minimum viable page.

---

## 4. Final information architecture

Final order:

1. Shared header
2. Breadcrumbs plus contextual Back to results
3. Above-the-fold gallery and identity/action composition
4. Optional concise editorial overview
5. Essential details
6. Location and substantial MapLibre map
7. Optional current place information from Google
8. Conditional Your Passport section
9. Similar restaurants
10. Destination continuation
11. Restrained source/attribution treatments where required
12. Shared footer

### Combination rules

- Gallery and identity form one hero region.
- Reservation and Passport actions live in the identity column; do not repeat them in overview/details.
- Address and Get directions begin in identity and are expanded in Location.
- Essential details omit missing fields rather than reserving empty slots.
- Google is separate from canonical details and location, not a parallel sidebar.
- Your Passport appears only for meaningful activity or recovery.
- Similar and destination discovery remain visually distinct; suppress either when it cannot provide distinct value.
- The shared footer owns the independence disclaimer. No page-level independence section repeats it.

---

## 5. Above-the-fold layout

### Approaches evaluated

| Approach | Strength | Risk | Decision |
| --- | --- | --- | --- |
| Gallery left, identity/actions right | Identity and imagery visible together; stable across media counts; straightforward responsive reordering | Needs deliberate sparse-media compositions | **Recommended** |
| Full-width gallery, information below | Strong visual impact; simple gallery geometry | Pushes identity/actions below the first desktop viewport | Rejected for V1 |
| Asymmetrical gallery with overlapping information panel | Editorial drama | Fragile with one/representative/initials media, long names, localization, focus outlines, and mobile | Rejected |

### Recommended desktop composition

- Content maximum: 1280px.
- Breadcrumb row above hero.
- 12-column hero:
  - Gallery: columns 1–7.
  - Identity/actions: columns 8–12.
- Gap: 32–40px.
- Target hero block height: 520–600px depending on media ratio and content.
- Gallery and identity align at the top; identity is not vertically centered into empty space.
- First desktop viewport at 900px should show:
  - useful gallery;
  - full identity;
  - Reserve/Save/Plan/Record;
  - website/directions when present;
  - the beginning of overview/details.

### Identity-column sequence

1. Michelin distinction
2. H1 restaurant name
3. Cuisine · borough/city/state · price
4. Address
5. Reservation/official actions
6. Passport action group
7. One compact current-state summary when meaningful

### Sparse-media stability

The right column does not move based on image count. The gallery chooses one of the explicitly specified G5/G4/G3/G2/G1/G0 compositions in Section 6. There are no blank tiles and no overlap.

---

## 6. Media-gallery specification

### Source boundary

Use only active assets resolved through the approved Stage 1 media registry:

1. verified official-restaurant media;
2. verified licensed-provider media;
3. approved representative cuisine/dining imagery;
4. designed initials fallback.

Google and Michelin photography never enters this gallery.

### Desktop compositions

Use a finite composition set:

| Media state | Composition |
| --- | --- |
| G5: five or more verified images | One 2:3-width primary image plus a 2×2 supporting grid; `View all {count} photos` |
| G4: four verified images | One 2:3-width primary plus three supporting tiles in a deliberate vertical/2-up arrangement |
| G3: three verified images | One 2:3-width primary plus two equally stacked supporting tiles |
| G2: two verified images | 65/35 primary/support split; both maintain usable crops |
| G1: one verified image | One bounded primary image; no empty grid; action says `View photo` |
| GR: representative image only | One bounded image with persistent `Representative image` label; do not call it a restaurant photo |
| G0: initials only | One designed fallback panel; no image count, gallery controls, or blank supporting tiles |

For more than five assets, only the first five resolved gallery items appear in the hero; the viewer contains all active items in deterministic gallery order.

### Ratios and cropping

- Hero gallery frame: approximately 16:10 at 1440/1280 and 4:3 at 1024.
- Primary asset uses the ingestion-provided focal point.
- Supporting tiles use fixed 4:3 or square crops according to the named composition.
- Never stretch or upscale.
- The viewer uses contain-first presentation against a dark neutral surface; it does not crop away legally or editorially meaningful content.

### Mobile

- One swipeable viewport, approximately 4:3.
- No supporting thumbnail grid.
- Visible `Image {n} of {count}` or equivalent dot/count indicator.
- `View all photos` opens the full-screen viewer.
- Do not auto-advance.
- Swiping gallery media does not capture vertical page scrolling unless the gesture is predominantly horizontal.

### Viewer

- Shared Dialog/full-screen primitive.
- Focus moves to the viewer heading/close action.
- Previous/Next buttons are available for pointer, keyboard, and assistive technology.
- Arrow Left/Right navigate; Escape closes.
- Announce `Image N of M`.
- Restore focus to the launching tile/action.
- Preserve the currently selected image when changing orientation.
- No circular navigation requirement; at first/last, disable the unavailable direction unless product later explicitly approves looping.

### Labels, credit, and alt text

- Detail images use reviewed descriptive alt text from the media registry.
- Do not start every alt with `Photo of`.
- Decorative supporting duplicates may use empty alt when the same scene/information is conveyed by the primary image and caption.
- Credits appear in the viewer caption and persist on-image when the usage basis requires it.
- Representative media always displays `Representative image` and uses non-restaurant-specific alt text.
- Initials fallback exposes restaurant name and fallback status without pretending to be a photograph.

### Loading and failure

- Primary image receives the only gallery preload.
- Supporting images lazy-load after primary/identity.
- Skeletons reserve exact composition geometry.
- A broken asset advances through remaining resolved verified candidates.
- A failed supporting asset is removed and the layout recomposes to the next lower named composition.
- A failed primary promotes the next verified candidate.
- When all verified assets fail: representative image, then initials.
- Never render a broken-image icon or empty tile.
- Reduced motion removes crossfade, zoom, and swipe-snap animation while preserving navigation.

---

## 7. Restaurant identity specification

### Hierarchy

1. Text distinction: `One Michelin Star`, `Two Michelin Stars`, or `Three Michelin Stars`
2. Restaurant name as the page’s only H1
3. Cuisine
4. Neighborhood/borough when canonical and useful
5. City and state
6. Price
7. Street address
8. Optional overview

### Typography

- H1 uses Literata, approximately 48–56px at 1440, 44–52px at 1280, 40–46px at 1024, and 34–40px mobile.
- Long names wrap naturally to two lines; do not reduce below the mobile minimum or overflow the action column.
- Metadata uses Inter with quiet separators that wrap by item, never as one unbreakable string.

### Distinction boundaries

- Use Dining Passport’s own distinction text/marks.
- Complete visible and accessible label, such as `Three Michelin Stars`.
- Keep separate from Google rating, personal favorite/would-return, price, and reservation availability.
- The distinction may link to `/stars/{1|2|3}` but must not read as a Dining Passport award.

### Missing fields

- Name, star level, city, and state are required for a publishable page.
- Cuisine, price, address, and neighborhood appear only when non-empty and source-approved.
- Do not render `Unknown`, `Not available`, or placeholder dashes inside identity.

---

## 8. Editorial-description contract

### V1 behavior

- Render an overview only when reviewed, authored/licensed content is active.
- Omit the entire overview region when no trustworthy copy exists.
- Never fabricate or auto-generate factual restaurant descriptions without human review.
- Do not copy Michelin Guide editorial prose without an approved usage basis.
- Do not use generic luxury filler.

### Conceptual content contract

```ts
type RestaurantEditorialOverview = {
  id: string;
  restaurantSlug: string;
  text: string;
  highlights: string[];
  sourceType: "dining_passport_authored" | "official_restaurant" | "licensed_editorial";
  sourcePageUrl: string;
  usageBasis: string;
  authorOrOwner: string;
  reviewedAt: string;
  active: boolean;
};
```

This is a planning contract, not implementation authorization.

### Guidance

- Target 300–600 characters.
- Maximum approximately 900 characters/two short paragraphs.
- Describe cuisine, format, or distinctive context only when the source supports it.
- Optional highlights are at most three short factual phrases and must not repeat essential details.
- Do not publish visit-review language, subjective rankings, or claims of being `best`.
- Do not expose review date as prominent consumer copy; keep it available for governance/source information.

---

## 9. Primary-action hierarchy

### Passport actions

Only:

- Save
- Plan a visit
- Record a visit

Remove top-level:

- Want
- Favorite
- Planned toggle
- Visited toggle
- Add planning details as a second entry point
- Record visit as both status and secondary duplicate

### External actions

- Reserve a table
- Official website
- Get directions

### Visual priority

1. **Reserve a table** is the filled primary action only when a valid verified direct-provider or restaurant-owned reservation URL exists.
2. **Save** is the strong secondary action and becomes the filled primary action when no direct reservation destination exists.
3. **Plan a visit** and **Record a visit** are equal outlined/quiet actions.
4. **Official website** and **Get directions** are text/link actions.

This keeps external conversion important without making the page an advertisement. A Michelin listing, generic provider homepage, or restaurant website that does not establish booking is not visually promoted as a direct reservation.

### Desktop

- Reserve and Save occupy the first row when Reserve exists.
- Plan and Record occupy the second row or one wrapping action group.
- Website and Directions follow as quiet links.
- Buttons have stable minimum widths but may wrap without changing order.

### Mobile

- Sticky action bar: Reserve (when valid) plus Save.
- Plan and Record remain immediately below identity in the page, full-width or two-up when each retains at least 44px height and readable labels.
- When no Reserve exists, sticky bar shows Save plus one `More actions` entry only if it opens an accessible sheet containing Plan/Record/Website/Directions; otherwise keep Save alone and leave the actions in content.
- Sticky content accounts for safe-area insets and never covers focused controls/footer content.

### State

Action labels describe the action or record:

- `Save` / `Saved`
- `Plan a visit` / `Edit plan`
- `Record a visit`

Planned/Visited summaries are not buttons pretending to be statuses.

---

## 10. Save behavior

### Save

1. Activate the bookmark immediately in the local V3 store.
2. Persist the bookmark and outbox mutation atomically.
3. Prevent duplicate activation while the command is running.
4. Display `Saved` after local persistence succeeds.
5. For signed-in users, expose `Pending sync` only while materially pending/offline.
6. Display `Couldn’t sync · Retry` after retry exhaustion.
7. Remove pending UI only after server acknowledgement.

### Modes

| Mode | Behavior |
| --- | --- |
| Signed out/device-only | Save locally; label `Saved on this device` only in the summary/help context, not every button |
| Signed in/synced | Save locally, enqueue, then omit sync copy after acknowledgement |
| Signed in/pending | Keep Saved truth; show restrained pending state |
| Signed in/failed | Keep local Saved truth; show Retry and do not claim Synced |

### Accessibility

- Unsaved label: `Save {restaurant name} to Passport`.
- Saved label: `{restaurant name} is saved to Passport`.
- Pending/failure announcements use one polite status region.
- Icon and color are supplementary.

### Unsave

- Ordinary Unsave is allowed only when no active plan, visits, or collection memberships depend on the bookmark.
- A simple bookmark with no dependents can be removed after one intentional activation; provide brief undo only if the command architecture can restore the exact bookmark safely.
- When dependents exist, the Saved control does not silently cascade. It opens the Remove from Passport flow specified in Section 13.
- Cancel preserves all data.

### Collection-only dependency

Collection membership requires the bookmark. If collection membership is the only dependency:

- block ordinary Unsave;
- list the affected collection names or count;
- confirmed Remove from Passport removes those memberships and the bookmark;
- preserve the collections themselves and all unrelated members.

---

## 11. Plan entry-point behavior

Stage 6 defines the page contract; the shared form and complete command interaction belong to the next journey-actions stage.

### Entry and automatic Save

- `Plan a visit` invokes the shared planning interaction for this restaurant.
- Planning automatically saves the restaurant.
- Creating a plan creates the bookmark first when absent.
- Bookmark plus plan/outbox operations commit in one local transaction.
- The page never asks the visitor to Save separately before planning.

### Empty state

- Button: `Plan a visit`.
- The shared interaction may accept:
  - optional planned date;
  - optional reservation provider;
  - optional private confirmation/reference note.
- Do not require a reservation before planning.

### Existing plan

- Only one active plan per restaurant.
- Identity summary: `Planned · August 12, 2026`.
- When date is absent: `Planned · Date not set`.
- Action becomes `Edit plan`.
- Editing targets the plan ID/version.
- Display pending/failed sync only when actionable.

### Remove plan

- The shared plan interaction exposes `Remove plan`.
- Confirmation language explains that the plan is removed but the restaurant stays Saved.
- Removing a plan preserves:
  - bookmark;
  - all visits;
  - all collection memberships;
  - bookmark note.

### Plans plus visits

- A restaurant may have multiple past visits and one active future plan.
- Show both summaries; do not collapse the page to one journey status.
- Example:
  - `Planned · August 12, 2026`
  - `Visited twice · Last visited May 4, 2026`

### Mobile

- Opens the shared full-width bottom sheet/dialog.
- The detail page remains inert behind it.
- On close, focus returns to `Plan a visit`/`Edit plan`.
- Sticky actions are hidden while the dialog is modal.

---

## 12. Visit entry-point behavior

### Entry and automatic Save

- `Record a visit` always starts a new visit draft with a new client UUID.
- Recording a visit automatically saves the restaurant.
- Recording a visit creates the bookmark first when absent.
- Bookmark, visit, and outbox mutations commit atomically.

### First visit

- After a successful local save, show `Visited · {date}`.
- When a legitimate legacy/completed visit has unknown date, show `Visited · Date not recorded`.
- Never invent today’s date or infer a date from page activity.

### Multiple visits

- Each visit is a separate record.
- Latest summary:
  - one visit: `Visited · May 4, 2026`;
  - multiple: `Visited twice` / `Visited 3 times`;
  - supporting line: `Last visited · May 4, 2026`;
  - unknown latest date: `Last visit date not recorded`.
- `View all visits` appears when more than one record exists.
- Visit history sorts known dates descending, then undated visits by creation time.

### Edit and delete

- Edit targets a visit ID/version, never the restaurant slug.
- Delete confirmation names the visit date or `undated visit`.
- Deleting one visit preserves every other visit, the active plan, bookmark, and memberships.
- After deleting the last visit, derived Visited becomes false but the restaurant remains Saved.
- Conflicting cloud/device edits preserve both recovery payloads; do not silently overwrite notes.

### Visit-level fields

- Favorite and Would return belong inside a visit record.
- Favorite dishes, rating, and private notes also belong to the visit.
- Do not expose restaurant-level Favorite or Want toggles.

### Mobile

- Shared Record Visit interaction opens as a bottom sheet/dialog.
- Visit history may use a full-height sheet when several records exist.
- Focus restoration and unsaved-draft warning belong to the shared journey-actions specification.

---

## 13. Remove-from-Passport behavior

### Trigger

When the Saved control is activated for a restaurant with any dependent plan, visit, or collection membership, open an explicit `Remove from Passport` flow.

### Dependency summary

List only consequences that exist:

- active plan and its private planning details;
- `{n}` visit record(s), including private notes/favorite dishes;
- membership in named collection(s);
- bookmark/private bookmark note.

Do not display note contents inside the confirmation.

### Confirmation

- Heading: `Remove {restaurant name} from your Passport?`
- Primary destructive action: `Remove from Passport`.
- Safe action: `Keep in Passport`.
- Require a deliberate confirmation button; do not use a checkbox that defaults to destructive.
- For screen readers, include the dependency count/summary in the dialog description.

### Command consequence

Confirmed removal:

1. tombstones the active plan;
2. tombstones all visit records;
3. removes/tombstones collection memberships;
4. deletes/tombstones the bookmark;
5. enqueues all dependent operations atomically in dependency-safe order.

Collections remain; only this restaurant’s memberships are removed.

### Failure/recovery

- If local persistence fails, close nothing and remove nothing; show Retry.
- If cloud sync fails after local removal, reflect local removal and show `Removal pending sync`/Retry in the appropriate recovery surface.
- A queued removal must be idempotent.
- Cancel leaves every record unchanged.

---

## 14. Reservation behavior

### Existing audit

The current resolver:

- publishes only verified non-low-confidence direct links with verification dates;
- rejects generic provider homepages;
- distinguishes direct-provider, website, temporary, phone-only, and Michelin-listing fallbacks;
- avoids duplicate website/Michelin links;
- currently emits labels such as `Reserve now`, `Check availability`, and `View booking options`.

The verification boundary is useful and should remain. The consumer labels/hierarchy need refinement.

### Final behavior matrix

| Evidence | Action | Visual treatment |
| --- | --- | --- |
| Verified restaurant-owned reservation URL | `Reserve a table` | Primary |
| One verified direct provider URL | `Reserve a table` with quiet provider label | Primary |
| Multiple verified reservation providers | `View reservations` opens a bounded provider chooser | Primary |
| Official restaurant site has reservation destination but cannot prove direct booking | `View reservations` or `Visit official website`, according to evidence | Secondary, never availability claim |
| Official website only | `Visit official website` | Secondary |
| Phone-only with verified phone in first-party data | `Call restaurant` plus phone-reservation context | Secondary |
| No valid reservation/website | No reservation action | Save becomes primary |
| Michelin listing only | Optional `Michelin Guide listing` source link | Never a reservation-primary action |
| Broken/malformed/unsafe URL | Suppress action and log operational review signal | No dead CTA |

### Multiple providers

- Current data supports one reservation record; multiple-provider behavior requires a future typed options contract.
- Restaurant-owned destination is listed first, then verified providers in deterministic provider/name order.
- Do not imply one provider is preferred because of commission or availability.
- The chooser discloses that each destination opens externally.

### Safety

- Parse URLs server-side.
- Allow only `https:` destinations, except intentional `tel:` for verified phone.
- Reject credentials, script/data protocols, malformed URLs, generic provider homepages, and unreviewed redirects.
- Use `target="_blank"` with `rel="noopener noreferrer"` for external web destinations.
- Accessible label includes `opens in a new tab`.

### Truthful language

Use:

- Reserve a table
- View reservations
- Visit official website

Do not use:

- Book now
- Available tonight
- Tables available
- Instant confirmation

unless a future provider contract supplies current availability/confirmation truth.

### Analytics

Record restaurant slug, normalized provider, surface, direct/non-direct classification, and destination class. Do not record full arbitrary URLs, party details, dates, or confirmation information.

---

## 15. Essential-details specification

### Core reliable fields

- Michelin distinction
- Cuisine
- City and state
- Price
- Address

These are currently canonical, but the renderer still omits any empty/invalid value.

### Optional first-party fields

- Neighborhood/borough
- Official website
- Verified reservation provider
- Phone
- Hours
- Dining format
- Accessibility
- Dietary accommodations
- Dress guidance

An optional field appears only when stored in an approved first-party/enrichment contract with source, review/verification metadata, and active status.

### Display

- Heading: `Details`.
- Desktop: two or three definition-list columns based on fields actually present.
- Tablet/mobile: divided definition rows.
- Address remains readable and linked to Directions only when a valid directions URL can be built.
- Cuisine/city may link to canonical taxonomy routes.
- Price has an accessible explanation if the symbol system is not already defined globally.

### Missing data

- Do not render empty labels, `Unknown`, `N/A`, or dashes.
- Do not create an `Hours` row from Google provider content.
- Do not copy UI Kit phone/website/hours into this section.
- When only the five core fields exist, keep the section compact rather than stretching it to match Google/map height.

### Source

Provider/source attribution appears next to the relevant optional field only when legally required; otherwise detailed methodology remains on Source information.

---

## 16. Google Places integration recommendation

### Approaches evaluated

| Approach | Strength | Risk | Decision |
| --- | --- | --- | --- |
| Bounded current-place section below first-party information | Clear source boundary; responsive; failure does not distort layout | Adds another below-fold section | **Recommended foundation** |
| Tab/disclosure | Defers provider weight | Hides useful information and can become compliance-only | Use only for optional expanded provider content |
| Provider UI beside map | Spatial association | Recreates a narrow sidebar and competes with MapLibre/attribution | Rejected |
| Remove broad provider profile; retain focused place facts/actions | Cleanest profile and lowest duplication | Less Google content | **Combine with bounded section for V1** |

### Final recommendation

Use one full-width, bounded section titled **Current place information from Google** after the first-party Location section.

Configure Places UI Kit for a focused V1 surface:

- Google rating/review count;
- current opening hours/open state;
- phone;
- Google Maps/place action;
- required Google attribution.

Do not include the current broad stream of provider photos, AI place summaries, review summaries, and full reviews in the default profile. If later approved, those elements remain inside an explicitly labeled, user-opened UI Kit disclosure and are not extracted.

### Provider boundary

- Store only approved Google Place IDs.
- Do not fetch provider fields into `RestaurantDetailModel`.
- Do not persist, prefetch, cache, proxy, or rehost Google content beyond documented exceptions.
- Do not place Google photos in the media registry/gallery.
- Do not place Google ratings/reviews/hours/phone in JSON-LD or canonical records.
- Do not mix Google reviews with private Passport visit notes.
- Do not remove, obscure, recolor outside permitted values, or detach required attribution.

Google’s current Places policies exempt Place IDs from caching restrictions but generally prohibit storing Places content outside allowed exceptions. Places UI Kit provides its own content/attribution elements; Dining Passport should continue to render the provider surface rather than copy its contents.

### Loading/failure

- Lazy-mount near viewport or after an explicit expand action.
- Reserve a modest bounded skeleton, not a 380px sidebar.
- Missing Place ID/config: omit the provider body and optionally show one quiet unavailable note only when it helps explain missing current hours/rating.
- Request denial/403/timeout: `Current Google place information is unavailable.` Keep canonical details, website, reservation, directions, and map.
- Never make the whole page error because Google fails.
- Operational logs classify missing config, unauthorized origin, timeout, and request error without exposing keys or Place IDs in analytics.

### Google photos

Google photos cannot populate the main gallery under the approved boundary. If displayed in a future UI Kit disclosure, they remain Google-rendered with author/source attribution and links required by provider rules.

---

## 17. Google-rating treatment

### Placement

- Inside the bounded Google provider section only.
- Never in the identity block, Michelin distinction row, first-party details, related cards, personal Passport, metadata, or JSON-LD.

### Label and separation

Where the UI Kit’s configured component supports the necessary context, the perceived label must be equivalent to:

> Google rating: 4.6 from 762 reviews

The section heading and Google attribution must make the provider unmistakable. Do not render Michelin marks beside Google rating stars.

### States

| State | Behavior |
| --- | --- |
| Loading | Compact provider skeleton with `Loading current place information` |
| Loaded | Provider-rendered rating/count with Google attribution |
| Missing rating | Omit rating element; keep other available provider facts |
| Failure | Natural unavailable message; no empty rating row |
| Reviews link permitted | Keep link inside provider UI or provider-approved action |

### Accessibility

- Provider name is in text, not logo alone.
- Rating value and review count are available as text.
- Color/star icons are supplementary.
- Provider controls and attribution remain keyboard accessible.

---

## 18. Map and location specification

### Direction

Replace `RestaurantLocationPreview` and the OSM export iframe with a route-local MapLibre client island that uses the approved centralized map-provider configuration.

### Content

- Section heading: `Location`.
- Full canonical address.
- `Get directions`.
- Optional `Open in maps` chooser or one platform-neutral external map destination.
- Substantial interactive map when coordinates are approved.
- One Dining Passport marker with restaurant name/distinction available through selected/focus text.
- Visible provider/OpenStreetMap attribution.
- Text alternative containing restaurant name and address.

### Dimensions

- 1440/1280: 100% section width, 420–460px high.
- 1024: 400–420px.
- 768: 340–380px.
- 430/390/375: 280–320px.
- Use a stable aspect/min-height contract; no tiny 192px desktop map.

### Camera/interactions

- Initial zoom approximately city/neighborhood level, generally 14–15.
- Center on the approved restaurant coordinate with enough surrounding streets/context.
- One marker; no clustering on a single-detail map.
- Pan and zoom permitted.
- Disable rotation/pitch in V1.
- Use `cooperativeGestures` or equivalent mobile behavior so the map does not trap page scroll.
- Disable ordinary scroll-wheel zoom until the map is intentionally focused/activated if needed.
- Navigation controls are touch-safe and do not overlap attribution.
- Provide `Open full map` linking to `/map?selected={slug}`.

### Loading/performance

- Server-render address/actions/text alternative.
- Do not include MapLibre in the initial route bundle.
- Lazy-import the map client when the section approaches the viewport or after explicit activation.
- Stable skeleton matches final dimensions.
- Preload no tiles above the fold.
- MapLibre’s ResizeObserver handles real container changes; call/verify `resize()` only after genuine measured size/show changes, not arbitrary page state.

### Failure/absence

| State | Behavior |
| --- | --- |
| Approved coordinates | Render MapLibre map |
| Missing/unverified coordinates | Show address, Directions/search action, and Explore/Map handoff; omit map shell |
| Provider config missing | Show text location/actions and `Map is temporarily unavailable` |
| Style/tile failure | Preserve address/actions/attribution and offer Retry |
| WebGL unavailable/context loss | Replace canvas with text location and Open full map/directions actions |
| Partial tile failure | Keep last usable map with non-blocking degraded message |

Never display guessed coordinates or say `geocoding approval` to visitors.

### Directions

- Build directions from the canonical address or approved coordinates.
- Prefer address plus restaurant name so the external service can resolve naturally.
- Do not send personal location unless the user explicitly invokes a provider that handles origin selection.
- External disclosure is accessible.

---

## 19. Personal Passport section

### Conditional presence

Heading: **Your Passport**

Render only when at least one exists:

- active plan;
- one or more visits;
- private bookmark note;
- collection membership;
- sync recovery requiring action.

A simple Saved bookmark alone is summarized near the primary actions and does not create a large empty section.

### Content priority

1. Active upcoming plan
2. Visit-history summary
3. Latest visit preview
4. Collections
5. Sync recovery

### Plan

- `Planned · August 12, 2026` or `Planned · Date not set`.
- `Edit plan`.
- Private confirmation content is masked/truncated by default and labeled private.

### Visits

- Count and latest visit date.
- Latest private-notes preview limited to approximately two lines.
- Favorite dishes and Would return shown only from that visit record.
- `View all visits` for multiple records.
- Visit edit/delete actions live with visit history, not the primary action row.

### Collections

- Show named membership chips/links when useful.
- Do not expose private collection names in analytics, metadata, or server-rendered public markup before personal hydration.

### Privacy/modes

- Label: `Private to your Passport`.
- Device-only: `Stored on this device`.
- Signed in and synchronized: do not repeat `Synced`.
- Pending: short `Pending sync`.
- Failed: `Couldn’t sync · Retry`.
- Personal content is never included in page metadata, JSON-LD, analytics, screenshots used as public fixtures, or provider queries.

### Empty/failure

- No activity: omit section.
- Personal-state load failure: keep public page and actions; show a bounded `Your Passport couldn’t load` retry near actions.
- Do not render fake zero-count metrics or a sign-in wall.

### No duplication

Your Passport summarizes records and provides edit/history/recovery. It does not repeat Save, Plan, Record, Reserve, Website, or Directions as a second action panel.

---

## 20. Related-restaurants strategy

### Two distinct jobs

1. **Similar restaurants:** help compare cuisine/style/distinction across destinations.
2. **More in the destination:** continue geographically.

Show both only when each has distinct qualifying results.

### Similar restaurants

- Heading derived naturally, such as `More contemporary restaurants`.
- Up to three shared editorial cards on desktop; horizontal snap or stacked compact cards on mobile.
- Deterministic ranking:
  1. same cuisine;
  2. same Michelin distinction;
  3. different city to add discovery value;
  4. verified media availability as a presentation tie-breaker, never an exclusion;
  5. restaurant name A–Z.
- If same cuisine yields fewer than three, fill with same-star restaurants in geographic variety, then name.
- Exclude current restaurant and duplicates.

### Destination continuation

- Heading: `More restaurants in Healdsburg` or `Explore nearby Michelin-starred restaurants`.
- Use up to four compact rows or two editorial cards, not a second six-card grid.
- Deterministic same-city ordering: stars high-to-low, then name A–Z.
- Add `Explore Healdsburg` link to the canonical city route.
- When only one matching restaurant exists, show one compact continuation rather than a large module.
- When none exist, omit the module.

### Card contract

- Verified image, representative fallback, or initials.
- Michelin distinction.
- Name.
- Cuisine.
- City/state.
- Price.
- Save.
- Open details.

No reservation, Plan, or Record actions.

### Geographic proximity

Do not claim `nearby` or distance ordering until approved coordinates exist for both restaurants and a distance model is implemented. Same-city is a destination relationship, not proof of walking/driving proximity.

---

## 21. Breadcrumb and return-navigation behavior

### Breadcrumbs

Desktop default:

```text
Home / Explore / {City} / {Restaurant}
```

- Omit State when City is unambiguous in the current U.S. route architecture.
- Use State instead of City only when a valid city route is unavailable.
- Do not include cuisine, star level, neighborhood, and both state/city in one trail.
- Current restaurant is text with `aria-current="page"`.
- Breadcrumbs and BreadcrumbList JSON-LD server-render.

### Mobile

- Show `Explore / {City} / {Restaurant}` or collapse Home visually while preserving semantic structure.
- Allow line wrapping at separator boundaries.
- Do not use a horizontally scrolling breadcrumb strip.
- Restaurant name may truncate visually to one line only when full text remains available to assistive technology and the H1 follows immediately.

### Back to results

When entered from Explore or Map, show a separate contextual control before breadcrumbs/hero:

- `Back to Explore results`
- `Back to Map`

Recommended contract:

- Discovery links may add a validated `returnTo` value containing only a same-origin path beginning `/explore` or `/map`.
- Preserve the complete compatible query string, including filters, view/page, camera/bounds, and selected state.
- Reject external origins, protocol-relative values, encoded control characters, and other route families.
- Canonical metadata excludes `returnTo`.
- If absent/invalid, omit the contextual control; normal breadcrumbs remain.
- Browser Back/Forward continues to work and handles exact scroll restoration where the source route supports it.

Do not rewrite the restaurant’s canonical URL or leak arbitrary referrers.

---

## 22. Source and attribution treatment

### Source boundary

| Source | Allowed detail-page use |
| --- | --- |
| Canonical restaurant catalog | Identity, Michelin distinction, cuisine, price, address, website |
| Verified media registry | Hero/gallery/card media and required credits |
| Reservation registry | Verified external reservation actions/provider label |
| Approved geocode registry | Map marker/camera and directions coordinates |
| Google Places UI Kit | Provider-rendered current place facts only |
| Passport store | Private personal state after bounded hydration |

### Consumer treatment

- The page does not include a large `Source and independence` section.
- Media credit appears in gallery captions when required.
- Map attribution remains on/adjacent to map.
- Google attribution remains inside the provider surface.
- Reservation provider label appears beside the action when useful.
- Michelin distinction source context may be one quiet `Michelin Guide listing` link when not duplicating reservation/website.
- Shared footer contains the approved independence disclaimer.

### Forbidden consumer vocabulary

Do not display:

- Dataset
- Workbook
- Import
- Ingestion
- Roster
- Scrape
- Pipeline
- Geocoding approval

Detailed methodology belongs on Source information.

---

## 23. SEO and structured-data requirements

### Metadata

- Title: `{Restaurant name} · Dining Passport`.
- Description template uses only reliable fields:
  - `{Restaurant name} is a {star-label} restaurant in {city}, {state}, serving {cuisine}. Explore details, location, and your private Dining Passport.`
- Avoid `independent listing` boilerplate in every description.
- Canonical: `/restaurants/{slug}` without `returnTo` or personal state.
- Unknown slug remains a real 404 and is not indexed.

### Open Graph/social

- Use the active verified hero/social-capable media variant when rights allow social sharing.
- Do not use representative imagery as restaurant-specific OG imagery without a visible representative label that survives the share asset; prefer a branded typographic fallback.
- Never use Google/Michelin imagery.
- Provide 1200×630 route-specific fallback containing Dining Passport identity, restaurant name, city, and text Michelin distinction.
- Twitter/social metadata uses the same rights-safe image decision.

### Restaurant JSON-LD

Include only published, reliable properties:

- `@type: Restaurant`
- name
- canonical URL
- servesCuisine
- priceRange
- PostalAddress with parsed fields only when parsing is reliable
- geo only from approved coordinates
- official website/sameAs
- verified first-party image URLs when redistribution/social use permits
- `acceptsReservations` as the verified direct URL when present
- optional `potentialAction: ReserveAction` only for a valid direct reservation destination
- `hasMap` pointing to Dining Passport Map/detail selection where useful
- official-rating wording only through a reviewed schema contract that clearly identifies Michelin Guide as the rating author; never imply Dining Passport issued it

Do not add:

- Google aggregateRating/reviewCount;
- Google reviews/photos/hours/phone;
- private Passport ratings/notes/visits;
- unverified reservation URLs;
- fabricated description;
- guessed geo coordinates.

### Michelin distinction

If structured:

- use complete text such as `Three Michelin Stars`;
- name Michelin Guide as the rating/award source;
- do not encode it as Dining Passport’s own aggregate rating;
- validate whether `starRating`/`award` produces accurate consumer/search interpretation before release.

### Validation

- Next.js JSON-LD serialization replaces `<` with `\u003c`.
- Validate with Schema.org validator and Google Rich Results Test.
- Follow Google’s rule that marked-up content must also be visible/reliable on the page.
- Treat rich-result eligibility as optional; factual accuracy and provider compliance come first.

---

## 24. Loading states

### Initial route

- Server-render breadcrumbs, gallery frame/fallback, restaurant name, distinction, cuisine/location/price, address, and non-personal actions.
- Route loading skeleton matches the final 7/5 hero split and content geometry.
- Do not render a page-wide spinner.

### Gallery

- Exact G5/G4/G3/G2/G1 geometry skeleton based on resolved metadata.
- Primary loads eagerly/preloaded.
- Supporting tiles lazy-load.
- Viewer module loads on first intent/open.

### Personal Passport

- Small reserved action-state skeleton or neutral buttons until local store is ready.
- Never replace public identity.
- Personal summary loads by restaurant identifier only.

### Mutations

- Save: button-local pending state.
- Plan/Visit: dialog-local save state; keep draft open until local persistence succeeds.
- Remove: destructive button-local state.
- Do not disable unrelated external links while a Passport command runs.

### Map

- Server-rendered location frame with stable dimensions and text address.
- Map skeleton only when approved coordinates exist.
- MapLibre imports/tiles begin near viewport or on activation.
- Remove blocking overlay after initial usable render; later tile transitions stay non-blocking.

### Google

- Bounded skeleton near viewport.
- Do not mount before its section approaches the viewport.
- One accessible status, not nested loading messages from wrapper and provider.

### Related

- Prefer server-rendered bounded summaries.
- If streamed, use stable three-card/compact-row geometry.
- Do not delay core detail for related discovery.

---

## 25. Empty and partial-data states

| Missing/partial condition | Behavior |
| --- | --- |
| Five-plus images | G5 hero; all active images available in viewer |
| Two-to-four images | Matching finite composition; no blanks |
| One verified image | Single primary; no fake gallery |
| Representative image | Persistent `Representative image` label |
| No imagery | Designed initials fallback, no gallery controls/count |
| No description | Omit overview |
| No price/cuisine/optional detail | Omit field/row |
| No reservation URL | Omit Reserve; Save becomes primary |
| No official website | Omit Website |
| No approved coordinates | Address/directions/search actions; no empty map |
| No Google Place ID/config | Omit provider body or show one restrained unavailable note |
| No personal activity | Omit Your Passport section |
| No similar results | Omit Similar section |
| No destination results | Omit destination module; retain city link where useful |
| One destination result | One compact continuation, not a large grid |

The page never uses repeated `Unavailable`, `Unknown`, or placeholder dashes to advertise missing data.

---

## 26. Error and recovery states

| Failure | User-facing behavior | Recovery/operational behavior |
| --- | --- | --- |
| Slug not found | Existing focused 404 | No detail shell/JSON-LD |
| Core restaurant load fails unexpectedly | Route error with Retry, Explore, Home | Log route/data failure |
| One media URL fails | Promote next candidate/recompose | Record asset failure for media review |
| All media fails | Representative then initials | Keep identity/actions |
| Editorial config invalid | Omit overview or fail build for static contract violation | Content-owner review |
| Reservation URL malformed/broken | Suppress Reserve; keep Website if valid | Link-health review event |
| Map provider config absent | Address/actions and natural unavailable copy | Configuration alert |
| Tile/style/WebGL failure | Text alternative plus Retry/Open full map | Classify provider/WebGL error |
| Google unauthorized/403 | Current place info unavailable | Classify unauthorized origin; do not expose key |
| Google timeout/request failure | Current place info unavailable | Retry only through provider wrapper policy |
| Personal state bootstrap fails | Public page/actions remain; bounded Passport Retry | Preserve local backup |
| Local Save/Plan/Visit persistence fails | Do not claim completion; keep dialog/action and Retry | No outbox mutation if entity write failed |
| Cloud sync fails after local success | Preserve local truth; Pending/Failed plus Retry | Retain outbox operation |
| Version conflict | Preserve device/cloud drafts; open shared recovery | No silent overwrite |
| Related selector fails | Omit related modules | Core page unaffected |

Optional failures never replace the whole page when canonical identity is available.

---

## 27. Desktop layout

### 1440px

- Header: canonical 72px.
- Page max: 1280px; outer gutters 64px.
- Breadcrumb/return row: 44px minimum target, 24–32px below header.
- Hero: 7/5 gallery/identity, 32–40px gap, 520–600px.
- H1: 52–56px target.
- Overview: maximum 760px reading width, adjacent optional highlights only when present.
- Essential details: content-driven two/three-column definition list.
- Location: full-width 440–460px map below address/action header.
- Google: full-width bounded section, maximum readable provider-content width approximately 760–900px; no sidebar.
- Your Passport: 5/7 or 4/8 split summary, only when active.
- Similar: three editorial cards.
- Destination: up to four compact rows/two cards.
- Major section spacing: 88–104px.

### 1280px

- Outer gutters: 48px.
- Hero remains 7/5; 32px gap.
- H1: 48–52px.
- Gallery target: 520–560px.
- Map: 420–440px.
- Similar remains three columns if every card stays at least 300px; otherwise two plus continuation.

### 1024px

- Outer gutters: 32px.
- Hero may use 6.5/5.5 split; identity gets enough width for labels/actions.
- Gallery uses G5/G4 without tiles below approximately 140px width; recompose rather than shrink.
- H1: 40–46px.
- Reserve/Save may wrap to separate rows.
- Details use two columns.
- Map: 400–420px.
- Similar uses two columns; third card may continue in second row.
- No fixed 380px provider sidebar.

---

## 28. Tablet layout

### 768px portrait

- Outer gutters: 24px.
- Breadcrumbs/return control wrap above hero.
- Gallery spans full width, approximately 4:3/360–420px.
- Identity follows directly; distinction/name/meta/actions remain within the first 1.5 viewports.
- Reserve and Save are two-up when labels fit; otherwise full-width.
- Plan and Record are two-up, minimum 44px.
- Overview and details are one column.
- Map: 340–380px with cooperative gestures.
- Google provider surface full-width below map.
- Your Passport becomes one column with divided plan/visit summaries.
- Similar cards use two columns in portrait only when each is at least 280px; otherwise horizontal snap/one column.
- Destination continuation uses compact rows.

### 768px landscape / orientation

- At effective 1024-like width, hero may return to a compact split only when gallery tiles remain usable.
- Preserve current gallery image, dialog state, map center, plan/visit drafts, and scroll anchor through orientation change.
- No fixed height based on the old orientation.

---

## 29. Mobile layout

Applies to 430px, 390px, and 375px.

### Reading order

1. Breadcrumb/Back to results
2. Swipeable gallery/fallback
3. Michelin distinction
4. Restaurant name
5. Cuisine/location/price
6. Address
7. Reserve and Save
8. Plan and Record
9. Optional overview
10. Details
11. Location/map
12. Google current place information
13. Your Passport
14. Related discovery
15. Footer

### Geometry

- Outer gutters: 20px at 430; 16–20px at 390/375.
- Gallery: full content width, approximately 4:3.
- H1: 36–40px at 430, 34–38px at 390, 34–36px at 375.
- Primary buttons: full-width or two-up only when each remains readable.
- Sticky Reserve/Save: safe-area aware; maximum two actions.
- Map: 280–320px.
- Details/Passport: divided rows, no side-by-side labels that crush values.
- Related: compact horizontal snap cards or stacked rows; no six full cards.

### Gallery/mobile viewer

- Swipe only on horizontal intent.
- Count stays readable over varying imagery.
- Viewer close/previous/next targets at least 44px.
- Representative label cannot be hidden behind controls.

### Overflow

- No horizontal document overflow at 430, 390, or 375px.
- Long restaurant/address/provider names wrap.
- Breadcrumb separators, action groups, gallery track, map controls, Google UI, chips, and sticky children stay within viewport.
- Focus outlines remain visible.
- Body bottom padding equals sticky-bar height plus safe area.

### Mobile length target

Content naturally varies, but the redesign must materially reduce the current 6,457–6,625px repetitive composition for the same sparse record by:

- suppressing empty overview/Passport/provider sections;
- limiting related cards;
- removing duplicate actions/source blocks;
- using one destination continuation;
- simplifying the footer.

Do not impose an arbitrary height cap that hides real visits or editorial content.

---

## 30. Accessibility requirements

- One H1 containing the restaurant name.
- Semantic breadcrumb `nav` and ordered list.
- Optional Back to results has a descriptive destination.
- Michelin distinction is complete text; no reliance on glyph count/color.
- Gallery primary image and viewer have reviewed alt text.
- Supporting decorative duplicates use empty alt where appropriate.
- Gallery tile is a real button with image position/count context.
- Viewer traps focus, supports Escape/Arrow keys, announces position, and restores focus.
- No autoplaying media.
- Reduced motion disables parallax, zoom, crossfade, route reveals, and nonessential map fly animations.
- Primary actions are buttons/links according to behavior, not clickable generic containers.
- Save labels include restaurant context where ambiguity exists.
- Save/sync status is announced politely and only when changed/actionable.
- Plan/Visit/Remove use shared accessible dialog/sheet primitives with labeled fields, descriptions, error summaries, focus trap, and restoration.
- Approximately 44×44px touch targets.
- Visible focus meets contrast and is not clipped.
- External-link/new-tab behavior is available to assistive technology.
- Map has a complete text alternative, address, directions, and Open full map link.
- Embedded map does not trap keyboard or page scroll.
- Google provider heading and attribution are accessible; provider name is not logo-only.
- Google rating value/count is text when shown.
- Private notes/history are not exposed in public server HTML, metadata, analytics, or provider DOM.
- Personal-state failure does not remove access to public actions.
- Status and error meaning never depends on color/icon alone.
- At 200% zoom/effective 320px, no two-dimensional page scrolling is required.

---

## 31. Performance architecture

### Server-owned public content

The route server loads one bounded detail payload:

- canonical restaurant identity;
- active media metadata/variants for that slug;
- reviewed overview when active;
- reservation resolution;
- approved geocode;
- bounded related/destination summaries;
- approved Google Place ID only;
- metadata/JSON-LD inputs.

Do not ship the full catalog.

### Client islands

- Gallery interaction/viewer
- Passport action/state summary
- MapLibre location map
- Google UI Kit
- Optional return-navigation enhancement if not fully server-derived

The page wrapper, identity, description, details, related headings/cards, source text, and footer remain server components.

### Images

- `next/image` or approved equivalent uses ingestion-generated intrinsic dimensions/variants.
- Preload only the primary above-fold image.
- Lazy-load supporting/gallery full-size images.
- Exact `sizes` by breakpoint.
- Immutable content-hash URLs and long browser/CDN cache.
- No paid runtime transforms in V1.
- No broad remote-host wildcard.

### Map/provider

- MapLibre is absent from initial JavaScript.
- Load near viewport or on activation.
- Load one detail marker/approved coordinates, not national data.
- Central provider style/attribution adapter.
- Google UI Kit loads independently and later than identity/map address.

### Personal state

- Hydrate by restaurant identifier, not catalog.
- Read local V3 state immediately.
- Reconcile through outbox/cloud without blocking public content.
- Deduplicate bookmark/plan/visit/membership queries for the same slug.
- Private/authenticated responses are uncached.

### Cache boundaries

- Public canonical detail/media/overview/reservation/geocode summaries may use tagged server caching:
  - `restaurant:{slug}`
  - `restaurant-media:{slug}`
  - `restaurant-overview:{slug}`
  - `restaurant-reservation:{slug}`
  - `restaurant-geocode:{slug}`
- Related summaries use public bounded caches and invalidation tags.
- Personal Passport and sync status never enter shared/public cache.
- Google content is not cached into first-party state.

### Stability/targets

- Stable gallery/map/provider skeleton dimensions.
- No cumulative layout shift from image count, personal hydration, map, or Google.
- Primary identity usable before optional client code.
- Mid-range mobile testing includes JavaScript transferred/executed, LCP, CLS, INP, image bytes, map time-to-interactive, and provider mount cost.
- Optional provider failure cannot extend route loading or block LCP.

---

## 32. Analytics events

Use a restrained, consent-aware plan:

| Event | Allowed properties |
| --- | --- |
| `restaurant_detail_opened` | restaurant slug, star level, entry route family |
| `restaurant_gallery_opened` | restaurant slug, media class, image count bucket |
| `restaurant_gallery_advanced` | restaurant slug, direction, image index; sample if volume requires |
| `restaurant_save_selected` | restaurant slug, local/cloud mode |
| `restaurant_unsave_selected` | restaurant slug, dependency-free |
| `restaurant_remove_passport_opened` | restaurant slug, dependency type counts only |
| `restaurant_plan_selected` | restaurant slug, create/edit |
| `restaurant_visit_selected` | restaurant slug, create/history |
| `restaurant_reservation_opened` | restaurant slug, provider class, direct/non-direct |
| `restaurant_website_opened` | restaurant slug |
| `restaurant_directions_opened` | restaurant slug, destination class |
| `restaurant_related_opened` | source slug, destination slug, module `similar` |
| `restaurant_destination_opened` | source slug, destination slug/city route |
| `restaurant_save_sync_failed` | restaurant slug, error class, offline flag |
| `restaurant_map_provider_failed` | provider class, failure class |
| `restaurant_google_unavailable` | reason class; no Place ID/key |

### Privacy

Never log:

- private notes;
- favorite dishes;
- would-return/favorite values;
- personal rating;
- confirmation numbers/notes;
- planned/visit dates;
- visit content/count tied to account;
- collection names;
- exact user location;
- full external URLs;
- Google Place IDs;
- API keys or provider payloads.

Do not add scroll-depth or section-view analytics for this page unless a future approved plan establishes clear product value.

---

## 33. Component tree

```text
AppChrome
├── AppHeaderClient
├── RestaurantDetailPage (server)
│   ├── JsonLd: BreadcrumbList + Restaurant
│   ├── RestaurantReturnContext (optional small client/server-safe link)
│   ├── Breadcrumbs (server)
│   ├── RestaurantHero (server composition)
│   │   ├── RestaurantGalleryIsland (client)
│   │   │   ├── RestaurantGalleryComposition
│   │   │   └── RestaurantGalleryViewer
│   │   └── RestaurantIdentity (server)
│   │       ├── MichelinDistinction
│   │       ├── RestaurantExternalActions
│   │       └── PassportActionGroup (client)
│   ├── RestaurantEditorialOverview (server, conditional)
│   ├── EssentialDetails (server)
│   ├── RestaurantLocationSection (server shell)
│   │   └── RestaurantDetailMapIsland (client, lazy)
│   ├── ProviderPlaceInformation (client, lazy, conditional)
│   ├── PassportRestaurantSummary (client, conditional after hydration)
│   ├── SimilarRestaurantsSection (server)
│   │   └── RestaurantEditorialCard
│   └── DestinationRestaurantsSection (server)
│       └── RestaurantCompactRow
├── RestaurantMobileActionBar (client)
└── SiteFooter

Shared overlays invoked by client islands
├── PlanningInteraction
├── RecordVisitInteraction
├── VisitHistory
├── RemoveFromPassportDialog
└── ReservationProviderChooser
```

The shared journey overlays are dependencies/interfaces for Stage 6 and receive full interaction specifications in the next stage.

---

## 34. Server/client boundaries

| Component/data | Boundary | Reason |
| --- | --- | --- |
| Route lookup/notFound/static params | Server | Canonical public routing |
| Metadata/JSON-LD | Server | SEO and no private/provider leakage |
| Breadcrumbs/identity/overview/details | Server | Stable first render, minimal JS |
| Media resolution metadata | Server | Rights/active filtering |
| Gallery navigation/viewer | Client island | Pointer/keyboard/swipe/dialog state |
| Reservation URL resolution | Server | Verification/safety |
| External reservation link | Server-rendered link | No client dependency |
| Save/Plan/Visit/Remove | Client island | Local store/outbox/dialog interactions |
| Personal summary/history | Client island fed by slug | Private local/cloud state |
| Map address/fallback | Server | Functional without WebGL |
| MapLibre map | Lazy client island | Browser/WebGL interaction |
| Google Place ID | Server-to-client scalar | Approved provider request key |
| Google UI Kit | Lazy client island | Provider custom elements/browser APIs |
| Related/destination summaries | Server | Public bounded discovery |
| Shared footer | Server/shared shell | Consistency/minimal JS |

No parent `RestaurantDetailView` client directive may pull the full page into a client bundle.

---

## 35. Files likely to change

This is a forecast for a future implementation plan, not authorization.

### Route/SEO

- `src/app/restaurants/[slug]/page.tsx`
- likely new `src/app/restaurants/[slug]/loading.tsx`
- likely new `src/app/restaurants/[slug]/error.tsx`
- likely new `src/app/restaurants/[slug]/opengraph-image.tsx` or shared OG helper
- `src/lib/seo/metadata.ts`
- `src/lib/seo/jsonld.ts`
- `src/components/seo/JsonLd.tsx`

### Detail presentation

- `src/components/stitch/restaurant-detail/RestaurantDetailView.tsx`
- `RestaurantIdentityHero.tsx`
- `RestaurantIdentityContent.tsx`
- `JourneyControls.tsx`
- `RestaurantJourneySection.tsx`
- `RestaurantFacts.tsx`
- `RestaurantLocationPreview.tsx`
- `RestaurantGoogleSection.tsx`
- `RestaurantDetailStickyBar.tsx`
- `RelatedRestaurantsSection.tsx`
- `NearbyRestaurantsSection.tsx`
- `RestaurantDetailLoading.tsx`
- `RestaurantDetailUnavailable.tsx`
- `adapters.ts`
- `models.ts`
- `index.ts`

Likely focused additions:

- `RestaurantGallery.tsx`
- `RestaurantGalleryViewer.tsx`
- `RestaurantPrimaryActions.tsx`
- `PassportActionGroup.tsx`
- `PassportRestaurantSummary.tsx`
- `RestaurantEditorialOverview.tsx`
- `RestaurantLocationSection.tsx`
- `RestaurantDetailMapClient.tsx`
- `ProviderPlaceInformation.tsx`
- `DestinationRestaurantsSection.tsx`
- `RemoveFromPassportDialog.tsx`
- `ReservationProviderChooser.tsx`

### Shared domain/provider dependencies

- Stage 1 media registry/resolver modules
- Stage 1 Passport V3 commands/outbox/selectors
- `src/lib/reservations/resolve.ts`
- `src/lib/reservations/types.ts`
- `src/lib/reservations/analytics.ts`
- `src/lib/google-places/config.ts`
- `src/components/google-places/GooglePlaceDetails.tsx`
- `src/config/map.ts`
- map-provider adapter from Stage 4
- shared Restaurant card/media models

### Tests/evidence

- `e2e/restaurant-detail.spec.ts`
- `e2e/google-places.spec.ts`
- `e2e/reservations.spec.ts`
- Passport V3/journey interaction tests
- `scripts/test_restaurant_detail.mjs`
- `scripts/test_restaurant_presentation.mjs`
- `scripts/capture_restaurant_detail_baselines.mjs`
- new Stage 6 screenshot evidence directory

Exact filenames must be rechecked against the then-current tree and bundled Next.js 16 guides before implementation.

---

## 36. Components to reuse

- `AppChrome`
- `AppHeaderClient`
- approved simplified `SiteFooter`
- `PageContainer`
- semantic `Breadcrumbs`, simplified for detail
- `MichelinDistinction` text logic/independent artwork
- `Dialog`, `Button`, and form primitives
- Stage 1 `RestaurantMediaAsset`/variant resolver
- shared editorial `RestaurantCard`
- reservation verification/provider helpers
- approved geocode selector
- Google UI Kit loader/error boundary/unavailable handling
- MapLibre renderer/provider abstraction from Stage 4
- Passport V3 commands, selectors, outbox, sync status
- `JsonLd` with safe serialization
- genuine `notFound()` route behavior

Reuse contracts, not the current compositions that encode duplicate actions/sidebar behavior.

---

## 37. Components to retire

- Current single-tile `RestaurantIdentityHero` media composition
- Undeclared `heroImageUrl` cast/probe
- Five-toggle `JourneyControls`
- `Want to visit` top-level state/action
- restaurant-level Favorite toggle
- Planned/Visited boolean toggles
- duplicate `Add planning details`/`Record visit` links
- current one-record `RestaurantJourneySection` presentation
- current 192px OSM iframe `RestaurantLocationPreview`
- fixed 380px `RestaurantGoogleSection` sidebar
- broad default Google photos/reviews/summary profile
- transactional reservation actions in related/nearby cards
- six-card related grid by default
- `NearbyRestaurantsSection` roster wording
- page-level source/import/workbook/roster paragraphs
- tests that require Want or broad Google sidebar copy

Retirement happens only in an approved implementation after dependencies exist.

---

## 38. Dependencies

### Blocking

1. **Stage 1 media registry/resolver**
   - active/rights-safe assets;
   - ingestion-generated variants;
   - focal point, alt, credit, representative flag;
   - failure cascade.
2. **Stage 1 Passport V3**
   - bookmarks;
   - one active plan;
   - appendable visits;
   - collection membership invariants;
   - durable outbox and truthful sync.
3. **Journey-actions specification/implementation**
   - shared Plan, Record, history, removal, validation, conflict recovery.
4. **Stage 4 Map provider abstraction**
   - MapTiler operational gate;
   - no demo fallback in production;
   - provider failure/attribution.

### Conditional

- Google Places UI Kit production origin/key authorization.
- Reservation options expansion for multiple providers.
- Editorial-overview content source/governance.
- Optional first-party enrichment for phone/hours/accessibility/dietary/dress.
- Approved shared footer and Source information route.

### Database/Supabase

- Stage 6 itself does not modify the database.
- V3 personal tables/migration and media registry/storage must be implemented separately.
- Do not add temporary detail-only columns to the legacy `user_restaurants` row.
- Do not persist Google provider content.

---

## 39. Risks and unknowns

| Risk/unknown | Severity | Response |
| --- | --- | --- |
| Media foundation is unavailable when detail implementation begins | High | Implement resolver/fallback contracts first; never fake gallery coverage |
| V3 journey is not implemented | High | Do not layer new UI over booleans; sequence domain migration before actions |
| Remove flow destroys private history unexpectedly | High | Dependency gate, explicit consequence summary, atomic command, cancel safety |
| Cloud failure remains fire-and-forget | High | Require durable outbox before truthful sync UI |
| Google content is copied into canonical fields/gallery | High | Place ID-only boundary and UI Kit rendering; policy tests |
| Google origin/key fails in production | High | Domain configuration gate, natural fallback, monitoring |
| Michelin rating is encoded ambiguously in JSON-LD | High | Explicit rating author/source review; omit rather than misstate |
| Representative media is mistaken for restaurant photography | High | Persistent label, non-specific alt, no restaurant-specific OG |
| Gallery composition breaks with partial/broken assets | High | Finite G5–G0 layouts and recomposition |
| Reservation fallback implies availability | High | Directness matrix and exact labels |
| Multiple provider support expands scope | Medium | Typed chooser dependency; keep current one-provider resolver until approved |
| Description rights/facts become stale | High | Typed source/usage/owner/review/active contract |
| Map traps mobile scroll or bloats initial JS | Medium | Cooperative gestures, lazy client island, text alternative |
| Google rating visually competes with Michelin | Medium | Provider section only; no adjacent star systems |
| Personal hydration exposes private data in public HTML | High | Slug-only client hydration, no metadata/JSON-LD/analytics leakage |
| Related algorithms imply ranking/recommendation | Medium | Natural headings, deterministic transparent similarity, no Best/Recommended |
| `returnTo` becomes open redirect or canonical duplication | High | Same-origin route allowlist, canonical stripping, invalid-value rejection |
| Optional content makes page excessively long | Medium | Conditional sections and bounded related modules |
| Full screenshot matrix becomes unmaintainable | Low | Pairwise fixture matrix plus seven-width canonical sweep |

---

## 40. Acceptance criteria

### Identity/gallery

- [ ] Canonical identity, distinction, cuisine/location/price, address, and valid public actions server-render.
- [ ] Verified media prevents an initials-first hero.
- [ ] G5/G4/G3/G2/G1/representative/initials states have explicit compositions.
- [ ] No blank gallery tiles or broken-image icons.
- [ ] Representative imagery says `Representative image`.
- [ ] Google/Michelin images never populate first-party gallery/OG.
- [ ] Full-screen gallery supports keyboard, focus trap/restoration, count announcements, credits, and reduced motion.
- [ ] No fabricated/unreviewed description appears.

### Actions/journey

- [ ] Only Save, Plan a visit, and Record a visit are primary Passport actions.
- [ ] Want and restaurant-level Favorite are absent.
- [ ] Planned/Visited are summaries, not duplicate toggles.
- [ ] Planning automatically saves the restaurant.
- [ ] Recording a visit automatically saves the restaurant.
- [ ] One active plan and multiple visits are represented.
- [ ] Planned, latest-visit, visit-count, and unknown-date labels are meaningful.
- [ ] Favorite/Would return belong to visit records.
- [ ] Ordinary Unsave is blocked when dependents exist.
- [ ] Remove from Passport lists and atomically removes plan/visits/memberships/bookmark.
- [ ] Collection-only removal preserves collections and unrelated members.
- [ ] Pending/failed sync is visible only when relevant; cloud failure never masquerades as Synced.
- [ ] Local failure does not claim Save/Plan/Visit success.

### Reservation/details

- [ ] Reserve appears only for a valid direct or restaurant-owned reservation destination.
- [ ] No real-time availability claim without supporting data.
- [ ] Website-only/no-link states remain coherent.
- [ ] Malformed/unsafe URLs are suppressed.
- [ ] Details render only backed, non-empty fields.
- [ ] Google hours/phone/rating do not become canonical first-party details.

### Google/map

- [ ] No narrow fixed Google sidebar.
- [ ] Google uses one bounded, focused, lazy provider surface.
- [ ] Google rating is clearly provider-labeled and separated from Michelin.
- [ ] Place ID is the only persisted Google identifier/content.
- [ ] Required Google attribution remains visible.
- [ ] Google failure does not break identity, actions, location, or Passport.
- [ ] Map uses MapLibre/provider abstraction and approved coordinates only.
- [ ] Desktop map is approximately 420–460px; mobile 280–320px.
- [ ] Missing coordinates use address-first fallback without empty map.
- [ ] Map has directions, Open full map, attribution, and text alternative.
- [ ] MapLibre and Google bundles are lazy and absent from critical identity rendering.

### Discovery/navigation/SEO

- [ ] Related cards use shared media and only Save/Open details.
- [ ] Similar and destination modules have distinct deterministic purposes.
- [ ] Current restaurant/duplicates are excluded.
- [ ] No unsupported distance claim.
- [ ] Breadcrumbs are semantic and mobile-safe.
- [ ] Valid Explore/Map return context restores compatible query state; invalid values fail closed.
- [ ] Canonical URL excludes return/personal state.
- [ ] JSON-LD contains only reliable visible data and no Google/private ratings.
- [ ] Structured data names Michelin as rating source if the distinction is encoded.
- [ ] No internal dataset/workbook/import/roster/ingestion terminology appears.
- [ ] Shared header/footer are consistent.

### Responsive/accessibility/performance

- [ ] Explicit layouts pass at 1440, 1280, 1024, 768, 430, 390, and 375px.
- [ ] No horizontal overflow at 375, 390, or 430px.
- [ ] Mobile order matches Media → Identity → Reserve/Save → Plan/Record → Details → Map → Passport → Discovery.
- [ ] All touch targets are approximately 44px.
- [ ] Focus is visible/unclipped.
- [ ] No image, color, icon, or star count is the sole information carrier.
- [ ] Personal notes are not exposed publicly.
- [ ] Primary image and map/provider skeletons have stable dimensions/near-zero CLS.
- [ ] Only primary hero image is preloaded.
- [ ] No full catalog ships to the detail route/client.
- [ ] Mid-range mobile performance and provider failures are measured.

---

## 41. Screenshot verification plan

### Fresh baseline

Use the 2026-07-18 SingleThread evidence and:

- `docs/ui-ux-rebuild/current/rejected-restaurant-detail.png`
- Stage 1 restaurant-detail screenshots
- existing Google/provider baselines

### Canonical seven-width sweep

Capture the same representative three-star detail at:

- 1440×900
- 1280×900
- 1024×900
- 768×1024 portrait and 1024-like landscape
- 430×932
- 390×844
- 375×812

At every width capture:

- full page;
- hero/gallery/identity;
- action group/sticky bar;
- details/location;
- Google loaded and unavailable;
- Your Passport active state;
- related/destination end of page;
- document/viewport width measurements.

### Media fixtures

Capture at 1440, 768, 390, and blocking 375:

1. five-plus verified images;
2. two-to-four images;
3. one verified image;
4. representative imagery;
5. initials only;
6. broken primary promoting support;
7. broken supporting tile recomposition;
8. viewer first/middle/last image;
9. required credit/representative caption.

### Action/data fixtures

Capture at 1440 and 390; repeat overflow-critical states at 430/375:

- valid direct reservation;
- restaurant-owned reservation;
- multiple-provider chooser;
- official website only;
- no reservation/website;
- verified coordinates;
- missing coordinates;
- map provider/WebGL failure;
- Google available;
- Google unavailable/unauthorized origin;
- missing description;
- long restaurant/address/provider names.

### Passport fixtures

Capture at 1440 and 390; verify dialogs at 375:

- unsaved;
- saved locally;
- saved/synced;
- pending sync;
- failed sync/Retry;
- active plan;
- one visit;
- multiple visits;
- legacy undated visit;
- visits plus active plan;
- collection-only dependency;
- Remove from Passport consequence dialog;
- local write failure;
- cloud sync failure.

### Interaction/accessibility evidence

- keyboard gallery sequence;
- viewer focus trap/restoration;
- reduced-motion viewer/map;
- Save status announcement;
- Plan/Visit/Remove focus management;
- map text alternative and page-scroll behavior;
- external-link disclosure;
- 200% zoom/effective 320px;
- automated accessibility scan plus manual heading/landmark review.

### Measurements

- document and viewport widths/heights;
- gallery composition/tile boxes;
- identity/action wrap;
- sticky bar/safe-area/body padding;
- H1 line count/size;
- map/provider boxes;
- related-card dimensions;
- LCP/CLS/INP;
- route/client JavaScript;
- image bytes and request priority;
- MapLibre/Google request timing;
- console/network/provider failures;
- absence of full-catalog and Google content in RSC/JSON-LD.

### Blocking comparisons

Release evidence must prove:

- real media replaces initials when present;
- partial media never produces blank slots;
- actions are not duplicated;
- no narrow Google sidebar remains;
- map is usable/substantial or absent with address-first fallback;
- optional failure never breaks core identity;
- mobile is not the current 6,500px sequence for the same sparse record;
- no horizontal overflow exists;
- private/provider data boundaries hold.

---

## 42. Remaining product decisions

### Approved decision log — 2026-07-18

Authorization to proceed to the shared Journey Actions and Visit History specification confirms the following Stage 6 recommendations:

1. **Above-the-fold composition**
   - Approved gallery-left/identity-right, 7/5 desktop split.
   - Full-width gallery-first and overlapping identity panels remain rejected for V1.

2. **Reservation visual priority**
   - Primary styling is reserved for verified direct or restaurant-owned reservation URLs.
   - When no such reservation destination exists, Save becomes the filled primary action.

3. **Multiple reservation providers**
   - `View reservations` opens a neutral provider chooser, with restaurant-owned first and no sponsored/preferred implication.
   - The current one-provider schema remains until separately expanded.

4. **Google scope**
   - Use one bounded, facts-focused UI Kit surface for rating, current hours/open state, phone, map/place action, and attribution.
   - Photos, AI summaries, review summaries, and full reviews are removed from the default profile. Any later expanded provider content stays inside a user-opened UI Kit disclosure.

5. **Map interaction**
   - Use a lazy 420–460px desktop / 280–320px mobile MapLibre map with cooperative gestures, rotation disabled, and an always-functional text/directions alternative.

6. **Simple Saved state**
   - Summarize a bookmark near primary actions and omit the larger Your Passport section until meaningful activity or recovery exists.

7. **Related discovery**
   - Use up to three Similar cards plus a compact city continuation only when both provide distinct results.

8. **Return-to-results contract**
   - Use an allowlisted same-origin `returnTo` path for `/explore` and `/map`, excluded from canonical metadata.
   - Session-only discovery context remains rejected because it is less reproducible and cannot support explicit return links reliably.

9. **Structured Michelin distinction**
   - Include the distinction in Restaurant JSON-LD only after a reviewed `starRating` or award representation clearly names Michelin Guide and passes validators.
   - Until then, keep it visible text only rather than implying a Dining Passport rating.

10. **Editorial overview launch**
    - Ship the conditional content contract, but render no overview until reviewed content exists.
    - Description coverage does not block the rest of the redesign.

### Decisions still open

No Stage 6 page-composition decisions remain open. The journey form, synchronization, conflict, merge, and destructive-removal details move to the authorized Stage 7 specification.

## Hard stop

Stage 6 ends with this specification. Do not implement the Restaurant Detail redesign, modify production components or the database, ingest restaurant media, configure Google/MapTiler, create migrations, commit, or push. Stage 7 is authorized for the shared Save, Plan a Visit, Record a Visit, Remove from Passport, synchronization, conflict, and visit-history specification only.
