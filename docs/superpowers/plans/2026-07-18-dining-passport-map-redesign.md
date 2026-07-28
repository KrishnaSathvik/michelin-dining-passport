# Dining Passport Map Redesign Specification

**Stage:** 4 — Map redesign specification  
**Date:** 2026-07-18  
**Status:** Product review  
**Scope:** `/map` planning only. This document does not authorize production implementation, map-provider configuration, purchasing, media work, commits, or pushes.

## Executive direction

Keep MapLibre and make the map the primary surface. The route becomes a viewport-owned workspace beneath the canonical header, with compact discovery controls, an optional left results drawer, a bounded restaurant preview, and no footer. Mobile uses a three-position bottom sheet because a selected restaurant needs a useful preview state between a nearly closed sheet and a full result list.

The approximately 31,969px map is a confirmed layout defect, not a renderer failure. The durable correction is one viewport-owning application shell with two rows—intrinsic header and `minmax(0, 1fr)` workspace—plus independent overflow inside the results panel. Do not layer another `calc()` onto the current auto-sized flex chain.

At the current catalog size, deliver the 196 approved map summaries once for `/map`, cluster them in MapLibre, and compute viewport membership locally. Keep the 75 restaurants without approved coordinates in Explore and expose a query-preserving handoff. Revisit server bounding-box delivery when the compact mapped payload exceeds a measured threshold, not merely because bounding-box infrastructure is theoretically possible.

---

## 1. Current-state findings

### Evidence reviewed

- Stage 1 fresh development capture: `output/playwright/stage1-foundation-2026-07-18/map-viewport-1440.png`
- Stage 1 fresh production capture: `output/playwright/stage1-foundation-2026-07-18/map-production-1440.png`
- Stage 1 contact sheet and seven-width captures under `output/playwright/stage1-foundation/`
- Existing map baselines under `docs/stitch-redesign/baselines/map/`
- `src/app/map/page.tsx`
- `src/components/shell/AppChrome.tsx`
- `src/components/shell/MapWorkspaceShell.tsx`
- `src/components/map/RestaurantMap.tsx`
- `src/components/map/MapCanvas.tsx`
- `src/components/stitch/map/*`
- `src/lib/map/query.ts`
- `src/lib/data/geocodes.ts`
- `src/lib/data/explore.ts`
- `src/config/map.ts`
- `e2e/map.spec.ts`
- `scripts/test_geocodes.mjs`
- `scripts/test_map_ui.mjs`
- `docs/geocoding-report.md`

### Foundations worth preserving

1. MapLibre GL remains a suitable renderer and is already isolated to the Map client surface through a dynamic import.
2. The map mounts a real `.maplibregl-canvas`.
3. GeoJSON clustering is already enabled with radius 50 and maximum cluster zoom 12.
4. Cluster click already uses cluster expansion zoom.
5. Restaurant selection is synchronized between the map and the list.
6. Bounds can be committed through Search this area and persisted in `bounds`.
7. Search, stars, state, city, cuisine, price, sort, view, and page reuse the Explore query parser, even though not all are exposed meaningfully in the current Map UI.
8. Saved and visited personal filters already use the Passport store.
9. Geolocation is optional and does not block map use.
10. Mobile has a map/list mode and selected-restaurant sheet.
11. The shared footer is correctly omitted on `/map`.
12. The geocode loader refuses low-confidence, uncertain, or missing coordinates.
13. The coordinate reconciliation source covers all 271 restaurants: 196 approved for markers and 75 not approved.
14. Seven shared-address groups are known; current rendering offsets them rather than dropping one member.

### Current product and interaction gaps

1. The results panel is permanently visible on desktop and loads all 271 restaurant rows in the unfiltered national view.
2. The panel is the visual subject while the map is reduced to the remaining area.
3. Search updates query state from every input change and URL synchronization uses `router.replace`; there is no deliberate submit/debounce contract.
4. Search this area compares bounds by a fixed `0.02` degree threshold and does not distinguish user gestures from initial fit, selection fly-to, reset, resize, or orientation changes.
5. Any MapLibre `onError` marks the whole map failed; a single tile error can therefore be treated like initialization failure.
6. The current URL stores bounds but not a canonical center/zoom camera, so a shared link cannot always reproduce the same uncommitted view.
7. `selected`, panel state, and bounds are all synchronized by one effect; this avoids history flooding but also makes selection/back semantics indistinct.
8. City and price are parsed but not exposed in the current Map filter controls.
9. The quick-filter row horizontally scrolls and omits a complete mobile filter dialog.
10. The current results count says `271 restaurants` even though only 196 can appear as markers.
11. When bounds are committed, restaurants without approved coordinates disappear from the list because the same bounds predicate removes them.
12. The selected preview includes a reservation action and compact Google Places surface. The approved Stage 4 preview contract is smaller: Save and Open details only.
13. Current markers do not encode Michelin distinction.
14. The current selected marker uses a decorative fork glyph while ordinary markers are uniform circles; the distinction vocabulary is not yet consistent.
15. The current list has no explicit sort behavior, despite carrying Explore sort values.
16. The root Passport provider still receives the complete restaurant catalog globally. Stage 1 already identifies that as a performance boundary to remove.
17. Existing tests assert width and basic interaction, but they do not assert the map stage height, document scroll height, mobile dynamic viewport, provider failure classes, or user-origin-only Search this area behavior.

### Current visual evidence

The Stage 1 viewport crop shows a 420px list panel and a pale blue map plane. The full-page evidence proves the plane continues for approximately 31,969px. Existing mobile baselines show a useful selected preview concept but also show too much blank map/sheet separation and reservation/Google content that no longer belongs in the preview.

---

## 2. Confirmed 31,969px height root cause

### Measured facts

At a 1440×900 viewport in both development and production:

| Measurement | Result |
| --- | ---: |
| Header | 72px |
| Map stage width | 1,020px |
| Map stage height | approximately 31,968.7px |
| Document scroll height | approximately 32,041px |
| MapLibre canvases | 1 |
| Style request | 200 |
| TileJSON request | 200 |
| WebGL 1/2 | available |
| Initialization error | none |

The visible blank-looking region is the top of an oversized world canvas. Vector requests include excessive/out-of-range tiles because the renderer is being asked to paint a nearly 32,000px-tall surface.

### Exact layout chain

1. `html` has `height: 100%`.
2. `body` is `display:flex; flex-direction:column; min-height:100%`, but its block-axis size is not a definite fixed height.
3. On `/map`, `AppChrome` gives `main` `flex:1` and `min-height:0`, but that flex item still participates in an auto-height body.
4. `MapWorkspaceShell` combines `height:calc(100dvh - var(--dp-header-height))` with another `flex:1`.
5. `MapWorkspaceView` uses `height:100%` inside that unresolved/competing flex chain.
6. `MapResultsPanel` contains the national result list. Although `MapResultsList` declares `overflow-y:auto`, overflow cannot be bounded until an ancestor supplies a definite available height.
7. The intrinsic height of 271 result rows therefore contributes to the height of the panel, workspace, main, and body.
8. `data-map-stage` stretches to the row height set by the panel.
9. The absolutely positioned map child uses `inset:0` and fills that approximately 31,969px stage.
10. MapLibre correctly sizes its canvas to the oversized container.

The primary defect is therefore the indefinite/competing height chain plus intrinsic results-list sizing. It is not WebGL, MapLibre initialization, tile reachability, lifecycle incompatibility, or browser support.

### Blocking conclusion

Do not replace MapLibre to fix this defect. Do not add another nested `min-height`, `100vh`, or `calc()` patch. Replace the ownership model described in Section 5.

---

## 3. Map product goal

The Map helps a visitor understand restaurant geography and move between an area, a marker, and a compact comparison set without leaving the workspace.

It must answer:

- Which Michelin-starred restaurants are near this destination?
- Which restaurants match my Explore filters in the current area?
- Where are one-, two-, and three-star restaurants concentrated?
- What restaurant does this marker represent?
- Which nearby options should I open or save?
- Are additional matching restaurants available only in Explore?

The Map is not:

- a second full restaurant directory beside a small canvas;
- a booking marketplace;
- a place-review interface;
- a full Google Places surface;
- a geocoding administration UI;
- proof that every catalog restaurant has a verified marker.

---

## 4. Final information architecture

Reading and interaction order:

1. Canonical shared header
2. Skip link to Map controls and skip link to list alternative
3. Compact Map search
4. Filters trigger and active-filter count
5. Explore/Map discovery-mode link
6. Large interactive map
7. Search this area action when earned
8. Map controls and attribution
9. Optional synchronized results panel
10. Selected restaurant preview
11. Accessible list alternative
12. Status/error announcement region

The standard footer is intentionally absent while the full-screen Map workspace is active. This is a documented shared-shell exception, not an accidental omission.

The map remains mounted when the results panel opens. Filters and selection do not reconstruct the route shell.

---

## 5. Stable viewport and height architecture

### One ownership model

Use a route-aware application shell, not nested viewport calculations:

```text
Map application shell
├── canonical header — intrinsic block size
└── map main — minmax(0, 1fr), overflow hidden
    └── map workspace — height 100%, min-height 0
        ├── compact controls — intrinsic block size or overlay
        └── map stage — minmax(0, 1fr), min-height 0, overflow hidden
            ├── MapLibre canvas — absolute inset 0
            ├── optional results drawer — own scroll
            ├── preview — bounded overlay
            └── controls/attribution — bounded overlays
```

Conceptual CSS contract:

```css
.map-app-shell {
  height: 100dvh;
  overflow: hidden;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
}

.map-main,
.map-workspace,
.map-stage {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.map-stage {
  position: relative;
}

.map-canvas {
  position: absolute;
  inset: 0;
}

.map-results-scroll {
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}
```

This is conceptual, not implementation authorization.

### Contract by ancestor

| Ancestor | Required contract |
| --- | --- |
| App shell | Own exactly one visual viewport; grid rows `auto minmax(0,1fr)` |
| Header | Intrinsic/canonical height; never subtracted again by descendants |
| Map `main` | `min-height:0`, `overflow:hidden`; occupies the second grid row |
| Route wrapper | `height:100%`, `min-height:0`; no `flex:1` plus explicit-height conflict |
| Workspace | Grid/flex child with `min-height:0` and `min-width:0` |
| Results drawer | Bounded by workspace; header/preview fixed within it; list owns scrolling |
| Map stage | `position:relative; min-height:0; overflow:hidden` |
| Map canvas | Absolute inset or definite 100% width/height within the stage |
| Document | Never becomes the map scroll container |

### Dynamic viewport behavior

- Use `100dvh` where supported so browser chrome changes update the workspace.
- Provide a `100svh`/100% fallback for engines without reliable dynamic units.
- Do not combine `100dvh`, header subtraction, and nested `height:100%` calculations.
- Apply safe-area insets to floating controls and sheets, not to the map’s measured container height.
- On address-bar, orientation, font, or browser-chrome changes that actually alter the map container, allow the workspace rectangle to settle and then resize the map.
- MapLibre tracks container resize, and its public `resize()` method is appropriate after a real container-size change. Opening the desktop overlay drawer does not change the map container width or height and therefore must not trigger a layout reflow or unnecessary resize cycle. The final implementation must call or verify `resize()` after orientation and other genuine container-geometry changes.
- Ignore ResizeObserver measurements below a usable threshold, such as 320×240, and delay initialization rather than creating a zero/giant canvas.
- Remove the workspace use of `min-height:20rem` where it can force short-landscape overflow. Error and loading content can have an internal minimum without changing the stage contract.

### Height acceptance measurements

At a 900px viewport with the current 72px header, the workspace and map stage should be approximately 828px, within one CSS pixel after browser rounding. `documentElement.scrollHeight` must equal the visual viewport height while `/map` is active.

---

## 6. Desktop layout

### Panel position decision

Use a **left-side overlay drawer, closed by default**.

Reasons:

- Left follows reading order: query and result list before spatial interpretation.
- Existing navigation and evidence already establish the left as the result-list location.
- MapLibre navigation/geolocation controls naturally remain at the right.
- A right drawer would compete with those controls and with the conventional lower-right attribution/control zone.
- A left overlay can expose a compact result rail without permanently reducing map width.

The drawer overlays the map rather than creating a permanent two-column page. Opening it must not change the map container width or height and must not resize or reflow the map layout. When necessary, auto-pan the selected marker into the unobstructed area; preserve zoom unless the marker cannot otherwise be made visible. Opening and closing preserve center, selection, filters, and Search-this-area state.

### 1440px

- Header: canonical 72px.
- Map: full remaining viewport.
- Compact search/control toolbar: top-left, 24px map gutter, maximum 620px.
- Collapsed results control: 48–56px rail/button at left.
- Expanded drawer: 420px maximum width; height equals workspace.
- Result rows: compact 88–104px, not full Explore cards.
- Preview: bounded card, maximum 360px wide, lower-left above attribution when drawer is closed; within the drawer when open.
- Search this area: top-center of the unobscured map region.
- Map controls: right edge, with at least 16px separation and no attribution overlap.
- Attribution: always visible at the bottom edge.

### 1280px

- Same structure as 1440px.
- Drawer width: 400px.
- Toolbar may reduce to Search + Filters + Results count; active filters move to one wrapping line or the drawer.
- Map controls remain on the right.

### 1024px

- Treat as compact desktop/tablet landscape.
- Drawer width: 360px, overlaying rather than permanently reserving one-third of the route.
- One-line toolbar: Search, Filters `{n}`, Results.
- No horizontal chip carousel over the map.
- Selected preview is shown inside the open drawer or as a 320px bounded card when closed.
- Drawer may auto-open for an explicit “View results” action, but marker selection alone opens only the preview.
- Touch targets are at least 44px even if a pointer is present.

---

## 7. Tablet layout

### 1024px

Use the compact desktop behavior from Section 6. The left results drawer remains available because landscape space supports it, but it is closed by default.

### 768px portrait

- Map first beneath the canonical tablet/mobile header.
- Search and Filters occupy a compact top overlay with 16px gutters.
- Results use the same three-state bottom-sheet model as mobile, with a maximum expanded height of 72dvh.
- A selected restaurant opens the preview resting position.
- “View results” opens the expanded results state.
- No desktop sidebar remains visible.
- Attribution and map controls move upward based on the sheet’s current covered height.

### 768px landscape

- Prefer a 340–360px left overlay drawer because vertical sheet space is limited.
- The map remains full workspace size behind it.
- Preview appears within the drawer.
- Switching orientation preserves filters, selected restaurant, and camera; it changes only the presentation container.
- The drawer/sheet presentation change preserves the map container geometry. Call MapLibre `resize()` only when the orientation change itself alters the measured container.

---

## 8. Mobile layout

Applies at 430px, 390px, and 375px.

- The map fills the available visual viewport beneath the canonical mobile header.
- Search and Filters use one compact top control group with 12–16px outer gutters.
- Search may expand to a focused full-width row; its collapsed state must not hide the query.
- Filters opens the same viewport-level filter dialog vocabulary as Explore.
- A Results button exposes the mapped result count and opens the bottom sheet.
- A marker selection opens the sheet at preview height.
- A “View as list” action opens the accessible full list without requiring map interaction.
- Map controls stay within the area between the top controls and current sheet edge.
- Attribution stays visible above the sheet or inside a dedicated attribution strip.
- No fixed child may increase document width.
- Use safe-area padding for the bottom sheet and right/left floating controls.
- The mobile route has no horizontal or document-level vertical scroll at 430, 390, or 375px.

At 375px, controls may stack Search above Filters/Results. Do not reduce touch targets or allow an inline label to force width.

---

## 9. Results-panel specification

### States

1. **Collapsed:** one labeled Results control/rail with mapped count.
2. **Expanded:** synchronized results drawer.
3. **Selection within expanded drawer:** selected preview pins above the scrolling rows or replaces a compact header section; the row remains visible and `aria-selected`.

### Behavior

- Default desktop state: collapsed.
- Width: 420px at 1440, 400px at 1280, 360px at 1024.
- The panel header contains area description, result count, and Close—not a duplicate full Explore filter bar.
- The result-list region owns vertical scrolling.
- Panel header and selected preview do not scroll out with the list.
- Rows include distinction, name, cuisine, city/state, price, Save, and detail navigation.
- Rows without approved coordinates appear only in the non-area/full-catalog handoff context, with natural copy such as `Available in Explore`; they do not expose a focus-marker action.
- Selecting a row selects/focuses its marker when one exists.
- Hovering a row may highlight the corresponding marker on pointer devices; it must not fly or write URL state.
- Marker selection scrolls the row into view without smooth motion when reduced motion is requested.
- Closing the panel preserves filters, bounds, camera, and selection.
- Panel state is remembered for the current session/route visit, not persisted as a durable user preference and not required in share URLs.

### Sorting

The panel is not a second full Explore sorter.

- Default: Michelin stars high to low, then restaurant name A–Z.
- With an active search query: the same search relevance contract as Explore, then name A–Z.
- Optional compact choices: Stars high to low, Restaurant name, City.
- Do not add Best, Recommended, Popular, reservation availability, or distance in V1.
- A geolocation distance sort may be considered later only when distance is calculated from an acknowledged location and clearly labeled.
- Sorting changes row order only; it never moves markers or resets the camera.

### Result scope

- Before Search this area is committed, the panel may describe/filter all mapped matching restaurants while the canvas clusters nationally.
- After Search this area, the panel contains approved mapped restaurants inside the committed bounds.
- Do not eagerly render 196 DOM rows. Window/virtualize the panel or page a bounded accessible list while keeping all compact marker summaries available to clustering.

---

## 10. Mobile bottom-sheet specification

Use **three resting positions**:

1. **Collapsed:** handle plus Results count, approximately 72–88px plus safe area.
2. **Preview:** selected restaurant summary, approximately 220–280px depending on content and viewport.
3. **Expanded:** mapped result list or full selected preview, maximum about 72dvh; never cover the canonical header.

Three positions are necessary because two positions force the visitor to choose between almost no restaurant context and a sheet that obscures most of the map. The preview state is the map’s primary marker-selection response.

### Interaction contract

- Marker tap → Preview.
- Results button → Expanded list.
- Sheet handle/toggle → next named state.
- Dragging snaps only to the three named positions.
- Escape closes Expanded to Preview, Preview to Collapsed, then returns focus to the originating marker/list control where practical.
- Swiping/dragging the map must not drag the sheet.
- Body/document never scrolls behind the sheet.
- Sheet content owns scrolling only at Expanded.
- The collapsed sheet remains non-modal.
- Expanded full list behaves as a dialog-like surface with correct focus containment; it must not make the map the only escape path.
- The sheet accounts for `env(safe-area-inset-bottom)`.
- Map controls translate/reposition based on the resting state and never sit under the handle.
- Orientation changes retain the named state but clamp its pixel height to the new visual viewport.

### Preview content

- 96×72 or 96×96 verified image/fallback
- Michelin distinction
- Restaurant name
- Cuisine
- City/state
- Price when known
- Save
- Open details

No reservation, Plan, Record Visit, description, address block, or Google Places card.

---

## 11. Search and filter specification

### Compact desktop controls

- Search field
- Filters button with active count
- Up to two high-value direct controls only if space allows: Michelin distinction and State
- Results toggle/count
- Explore link preserving compatible state

The full filter set lives in one popover/drawer:

- Michelin stars: segmented options or single-select radio group
- State: native/select or accessible combobox
- City: searchable combobox dependent on State
- Cuisine: searchable combobox
- Price: segmented/single-select options
- Saved only: optional personal toggle

Visited is not part of the shared Explore vocabulary requested for Stage 4. Keep it only if a later Passport-specific Map filter is explicitly approved; do not let it displace core discovery filters.

### Mobile Filters

- One viewport-level dialog.
- Same Stars, State, City, Cuisine, Price vocabulary as Explore.
- Active count in the trigger.
- Draft changes until Apply.
- Current mapped/all matching count when available.
- Reset, Close, and Apply.
- No nested drawer and no duplicated quick chips.
- Exact viewport width minus intentional 12–16px gutters.

### Search

- Matches restaurant name, city/borough, state/state code, and cuisine where source data permits.
- Use a draft field and explicit submit.
- Enter and Search submit the same normalized query.
- A 250–350ms debounce may update local suggestions/counts, but it must not write browser history or issue a server request on every keystroke.
- Clear preserves facets, resets the committed area when it would otherwise create a misleading empty state only with explicit user confirmation/clear-area action, and returns focus to Search.
- Active search uses Explore’s documented relevance tiers and name A–Z ties.
- Loading feedback is inline and non-blocking.

---

## 12. Explore/Map shared-state behavior

Compatible parameters:

- `q`
- `stars`
- `state`
- `city`
- `cuisine`
- `price`
- explicit `sort` when both routes support it

Rules:

1. “View on map” from Explore preserves compatible query/filter values and drops Explore-only `view` and `page`.
2. “View in Explore” from Map preserves compatible values and drops camera, bounds, selection, and panel presentation unless the handoff explicitly represents a no-coordinate result.
3. Map-specific `saved=1` may hand off to a future Explore Saved filter only if Explore supports it; otherwise omit it and label the transition.
4. A committed map area does not silently become an Explore location filter. Provide an optional natural-language area description or drop bounds.
5. New York City remains the major destination grouping where appropriate; restaurant labels preserve borough, for example `Brooklyn, New York`.
6. Switching discovery modes must not force login or discard device-only Save state.
7. Both routes share one parser/serializer vocabulary for common parameters.

---

## 13. Cluster behavior

### National zoom

- Keep GeoJSON clustering.
- Use cluster counts with three restrained size steps.
- Do not add permanent state-level count labels; clusters already communicate density and state labels would compete with the basemap and become ambiguous near borders.
- Cluster click/tap zooms to MapLibre’s expansion zoom.
- Selected cluster receives a structural outer ring/halo and elevated stroke, not color alone.
- A cluster loading transition may soften/fade counts but must not block pan/zoom.
- The results panel gives keyboard users an equivalent way to inspect the restaurants represented in the current area.

### Distinction treatment

Individual markers use Dining Passport’s own one/two/three distinction treatment:

- one: one central notch/dot or numeral `1`;
- two: two marks or numeral `2`;
- three: three marks or numeral `3`;
- always pair color with the visible count/shape;
- never use Michelin’s logo, Michelin star artwork, or a copied official badge.

Clusters aggregate all distinctions and show only count. If a filter limits results to one distinction, the cluster may inherit that filter’s marker treatment.

### Cluster keyboard behavior

MapLibre canvas layers are not a dependable full keyboard tree. Provide:

- a focusable “Map results” entry point;
- keyboard-navigable synchronized rows;
- a result/cluster summary such as `9 restaurants in this cluster area`;
- a keyboard action to zoom to the selected cluster from the list/summary.

Do not create hundreds of invisible DOM buttons over the canvas.

---

## 14. Individual-marker contract

Each individual marker communicates:

- a verified restaurant location;
- one-, two-, or three-star distinction through shape/count plus color;
- selected state;
- hover/focus state;
- individual versus cluster state.

### Visual rules

- 28–32px interactive visual footprint with at least a 44px hit target where DOM markers are used.
- Deep green base with white/high-contrast distinction.
- White casing stroke for legibility over light/dark styles.
- Selected state: larger ring plus scale/elevation.
- Hover/focus: halo plus cursor/focus equivalent.
- Do not decorate V1 markers with Saved state. Saved truth remains in the preview and result row, protecting marker legibility.
- Sync pending/failed never appears on markers.
- No restaurant initials or permanent full-name labels.

### Overlapping locations

Use **max-zoom radial spiderfying driven by Supercluster leaves**.

- Normal zoom retains small local clusters.
- Clicking a cluster at/near maximum expansion retrieves its leaves and expands them radially around the shared screen point.
- Connector lines preserve geographic origin.
- Selecting a leaf opens its preview.
- Moving/zooming closes the spider.
- Do not permanently mutate approved coordinates or save display offsets as data.

This supersedes the current fixed 12-meter coordinate offset, which changes the apparent location at every zoom and is harder to explain.

---

## 15. Restaurant-preview contract

### Content

- Verified restaurant image or approved representative/initials fallback
- Michelin distinction
- Restaurant name
- Cuisine or `Cuisine not listed`
- City and state/borough label
- Price or `Price not listed`
- Save
- Open details
- Sync recovery only when action is required

Do not include:

- Plan a visit
- Record a visit
- reservation action
- official website
- full description
- full address by default
- Google Places UI
- ratings/reviews

### Desktop placement

Use a **bounded floating card** when the results drawer is collapsed and move the same preview content into the drawer when expanded.

Do not anchor a DOM popup directly to the marker. Marker-anchored popups have collision, clipping, keyboard, and camera-obstruction problems. The bounded card is stable, can be measured, and allows camera padding to keep the selected marker visible.

Rules:

- Maximum width 360px.
- Bottom-left of unobscured map, above attribution.
- On select, camera padding—not a forced center reset—keeps the marker visible.
- Closing preview clears selection via replace state, without changing filters/camera.
- Open details performs normal route navigation.

### Mobile placement

Use the Preview resting position from Section 10.

---

## 16. Search-this-area behavior

### When it appears

Show only after:

- a user-originated pan changes the viewport by roughly 20% of visible width/height; or
- a user-originated zoom changes by at least about 0.75 zoom level; and
- movement has ended and remained idle for 250–350ms.

Do not show after:

- initial national fit;
- filter-driven fit;
- selected-marker camera padding/fly;
- Reset/Fit action;
- drawer/sheet resize;
- browser chrome/orientation resize;
- geolocation recenter until the user subsequently moves the map.

### Action

- Label: `Search this area`.
- Keyboard-accessible button.
- On activation, commit the current camera/bounds as the result area.
- Abort/cancel any earlier request or computation token.
- Disable while pending and show `Updating area…`.
- Deduplicate identical rounded bounds/query combinations.
- Update mapped count and unmatched-in-Explore count together.
- Write one navigable history entry for the committed search, not for movement frames.
- Keep the old visible markers until the new result set is ready; do not cover the map with a spinner.
- On failure, retain previous committed results and offer Retry.

### Clear area

Clear removes committed bounds and refits to the filtered national/regional set without clearing search/facets.

---

## 17. Geolocation behavior

| State | Behavior |
| --- | --- |
| Not requested | Map remains fully usable; no permission prompt on load. |
| Requesting | Control shows busy; announce `Finding your location`. |
| Granted | Center once, show an accuracy circle when available, and use a conservative zoom. |
| Approximate | Say `Showing your approximate location`; do not imply precise proximity. |
| Denied | Non-blocking message: `Location access is off. Search by city or move the map instead.` |
| Unavailable | `We couldn’t find your location. Search by city or keep browsing.` |
| Timeout | Stop after about 10 seconds; offer Try again. |
| Recenter | A deliberate control recenters to the last known position. |
| User moves away | Stop following. Never snap back automatically. |

Do not require geolocation, store precise coordinates in analytics, or include exact coordinates in error logs. Geolocation does not automatically commit Search this area.

---

## 18. Unverified-coordinate strategy

### Public truth

- Total catalog: 271.
- Approved map locations: 196.
- Additional restaurants without approved coordinates: 75.
- Counts must be derived from the canonical restaurant/geocode sources, never hardcoded into UI copy.
- Never plot uncertain, city-centroid, rejected, or missing coordinates.

### Disclosure decision

Lead with natural language in a restrained results-panel information area, map-information popover, or contextual empty state:

> Showing restaurants with verified map locations. More restaurants are available in Explore.

Where numeric clarity is useful, use source-derived prose rather than a dashboard metric:

> 196 restaurants are available on the map. 75 additional restaurants can still be found in Explore.

For a filtered result, contextual copy may say:

> 12 restaurants are available on the map. 3 additional matches can still be found in Explore.

Avoid `unverified`, `geocoding`, `pending reconciliation`, confidence levels, or provider terminology in customer copy.

### Scope behavior

- National map count means approved mapped restaurants, not all catalog restaurants.
- Filter counts report mapped matches and additional Explore matches separately.
- Area searches count only mapped restaurants inside bounds.
- The accessible map list contains the same mapped/area set as the markers.
- A query-preserving `View all matches in Explore` link includes the additional restaurants.
- If catalog matches exist but none have approved coordinates:

  > These matches are available in Explore, but they do not yet have map locations.

  Primary action: `View matches in Explore`.
- Explore never hides a restaurant because it lacks coordinates.

### Internal monitoring

Track unresolved count, status age, manual-review queue, and regression from approved to unresolved outside the public interface. Keep the existing override/reconciliation workflow; do not geocode on page load.

---

## 19. Provider abstraction

Keep MapLibre as the renderer. Abstract the provider as validated metadata rather than scattering environment access:

```ts
type MapProviderConfig = {
  id: "maptiler" | "stadia" | "pmtiles";
  displayName: string;
  styleUrl: string;
  attributionHtml: string;
  logoRequirement?: "required" | "plan-dependent" | "none";
  productionReady: boolean;
  supportsOffline: boolean;
  failureHelp: string;
};
```

Conceptual rules:

- Read environment variables once on the server/config boundary.
- Validate provider name, HTTPS style URL, attribution, and production readiness.
- Expose only browser-safe style/key material.
- Never expose service/admin tokens.
- Keep renderer components provider-agnostic.
- Production with invalid/missing config fails closed to the list alternative.
- Development may use an explicitly labeled demo style.
- Production never silently falls back to MapLibre demo tiles.
- Log provider ID and failure class, not keys or full credential-bearing URLs.

Suggested environment vocabulary:

```dotenv
NEXT_PUBLIC_MAP_PROVIDER=maptiler
NEXT_PUBLIC_MAP_STYLE_URL=https://api.maptiler.com/maps/.../style.json?key=BROWSER_KEY
NEXT_PUBLIC_MAP_ATTRIBUTION=...
```

Separate development, preview, and production values.

---

## 20. MapTiler operational plan

### Recommendation

Use **MapTiler Cloud** as the proposed initial production style/tile provider, subject to commercial approval. Keep MapLibre GL as the renderer.

MapTiler documents protected browser keys with allowed HTTP origins, per-application keys, usage analytics, and spending limits. Its current public pricing distinguishes MapTiler SDK sessions from third-party renderer tile/API requests; because Dining Passport keeps MapLibre, commercial review must model request-based usage rather than assume SDK session billing.

### Launch checklist

1. Select the commercial plan after measuring real MapLibre tile requests per visit.
2. Create separate development/preview/production browser keys.
3. Restrict each production key to exact allowed HTTP origins.
4. Keep an unprotected default/testing key out of public builds.
5. Configure spending limit/budget alert and a named owner.
6. Review analytics weekly during launch and set anomaly alerts where available.
7. Verify style, sprite, glyph, tile, and attribution resources under production CSP.
8. Confirm plan-dependent logo/attribution requirements.
9. Test quota exhausted, 401/403, 404, 429, offline, and partial tile failure states.
10. Record provider/style version and rollback style URL.

### Operational comparison

| Option | Cost/limits | Key security | Offline/control | Maintenance | Styling/portability | Direction |
| --- | --- | --- | --- | --- | --- | --- |
| MapTiler Cloud | Current Flex pricing starts at a monthly base with overage; third-party MapLibre requests are request-billed | Protected browser key with allowed origins; separate keys and analytics | Online managed service | Low | Strong custom styles; standard style URL keeps MapLibre portable | **Initial recommendation, pending commercial approval** |
| Stadia Maps | Commercial plans and credit limits; current docs describe hard limits/optional overage | Domain-based browser authentication can avoid exposed keys | Online managed service | Low | MapLibre-compatible styles; portable | Strong fallback if domain auth or pricing is materially better |
| Self-hosted PMTiles | Storage + request costs; no tile SaaS fee | Origin/CORS/storage policy is self-managed | Best offline/control potential | Highest: source licensing, builds, updates, sprites, glyphs, CDN, observability | Maximum portability and control | Revisit when scale/control justifies operations |

### Why not PMTiles first

PMTiles can be read by MapLibre directly from S3-compatible storage with HTTP range requests, but Dining Passport would own basemap acquisition/licensing, archive updates, style assets, storage CORS, CDN behavior, monitoring, and rollback. That is disproportionate for the current catalog and launch stage.

### References

- [MapTiler Cloud pricing](https://www.maptiler.com/cloud/pricing/)
- [MapTiler production key protection](https://docs.maptiler.com/cloud/api/authentication-key/)
- [MapTiler cost controls](https://docs.maptiler.com/guides/account/controlling-expenses/)
- [Stadia Maps authentication](https://docs.stadiamaps.com/authentication/)
- [Stadia Maps service limits](https://docs.stadiamaps.com/limits/)
- [PMTiles cloud-storage requirements](https://docs.protomaps.com/pmtiles/cloud-storage)
- [PMTiles with MapLibre](https://docs.protomaps.com/pmtiles/maplibre)
- [MapLibre GL clustering guidance](https://maplibre.org/maplibre-gl-js/docs/examples/create-and-style-clusters/)

---

## 21. Accessible list alternative

Provide a first-class `View as list` control in the Map toolbar and a skip link near the top of the route.

### Behavior

- Stays on `/map`.
- Uses the same committed search, filters, and area.
- Shows mapped results with an area description such as `Restaurants in the visible San Francisco area`.
- Uses the synchronized compact result rows and explicit detail links.
- Supports keyboard-only and screen-reader browsing without touching the canvas.
- Becomes the automatic primary surface when WebGL, initialization, or provider configuration fails.
- Preserves filter controls when the map fails.
- Has a separate `View all matching restaurants in Explore` link for the 75/no-coordinate population.
- Does not hide the map with CSS while leaving it focusable; inactive map controls are removed from the tab order.
- Returning to Map restores camera and selection when possible.

This is functional browsing, not a hidden compliance link.

---

## 22. URL-state contract

### Canonical parameters

| Parameter | Accepted value | Default/omission |
| --- | --- | --- |
| `q` | normalized string, max 100 characters | omitted |
| `stars` | `1`, `2`, `3` | all |
| `state` | canonical state slug | all |
| `city` | valid city slug compatible with State | all |
| `cuisine` | canonical cuisine slug | all |
| `price` | approved price value | all |
| `lat` | finite latitude in supported range | default/derived |
| `lng` | finite longitude in supported range | default/derived |
| `z` | finite zoom clamped to configured min/max | default/derived |
| `bounds` | rounded `west,south,east,north`, valid ordering | no committed area |
| `selected` | valid mapped restaurant slug | none |
| `mode` | `map` or `list` | `map` |

Do not persist results-panel open/closed state in the share URL. It is presentation state and may use session memory.

### Camera/history rules

- Continuous pan/zoom updates in-memory camera only.
- Movement never pushes history.
- Search this area commits bounds plus center/zoom in one history entry.
- Explicit geolocation/recenter may replace current camera state, not push repeated entries.
- Marker selection uses `replaceState`/equivalent so cycling markers does not flood Back.
- Closing selection also replaces.
- Filter/search submissions push one entry and reset/fit camera only when explicitly defined.
- Back/Forward restores committed query, area, camera, selection, and list/map mode.
- Shared links reproduce intended camera and filters.

### Validation

- Clamp latitude, longitude, and zoom to safe supported ranges.
- Reject NaN, Infinity, malformed bounds, reversed bounds, and unsupported slugs.
- If center is invalid but bounds are valid, derive center/zoom from bounds.
- If bounds are invalid, drop them without failing the route.
- If selected slug is not in the current mapped set, drop selection and preserve the rest.
- Normalize New York/Brooklyn labels without rewriting canonical restaurant slugs.

---

## 23. Personal-state behavior

| State | Marker | Row/preview |
| --- | --- | --- |
| Unsaved | No personal decoration | Outline Save |
| Saved locally/device-only | No marker decoration in V1 | Filled Saved; no sync badge |
| Signed in, synced | No decoration | Filled Saved; `Synced` omitted |
| Sync pending | No decoration | Filled Saved; short pending normally omitted |
| Prolonged/offline pending | No decoration | `Saved on this device` only where truth requires |
| Sync failed | No decoration | Filled Saved plus Retry in affected row/preview |
| Local write failed | No change | Do not claim Saved; announce and offer Retry |

Rules:

- Save never forces login.
- Local save completes before cloud state can be claimed.
- No private notes, plans, visit data, or precise location enter marker GeoJSON.
- Do not issue one personal-state query per marker/row.
- The map DTO and slug-keyed personal snapshot join client-side.
- Sync status appears only when action/recovery is needed.

---

## 24. Loading states

| State | Presentation |
| --- | --- |
| Route loading | Stable viewport shell, compact toolbar skeleton, neutral map plane, 5–7 row skeletons only if panel/list is open |
| Provider/style loading | Keep map plane and controls shell; `Loading map` status, no blocking spinner |
| Tile loading after first paint | Preserve last rendered map; small non-blocking progress indicator only when prolonged |
| Marker summary loading | Map may render base style first; result count skeleton and quiet marker transition |
| Filter transition | Keep current map/results, mark count busy, replace when latest request wins |
| Search this area | Button becomes `Updating area…`; old results remain |
| Selected preview | Fixed preview geometry with image/text skeleton; map remains interactive |
| Results drawer | Fixed row skeleton dimensions; drawer open/close does not alter document height |
| Image loading | Reserved aspect ratio; lazy load preview image |
| Partial results | Render available markers and disclose that remaining results are updating |

After initial load, never cover the entire map with a spinner.

---

## 25. Empty states

| Empty condition | Message | Primary action |
| --- | --- | --- |
| No mapped restaurants match filters nationally | `No mapped restaurants match these filters.` | Clear filters |
| Search has no catalog matches | `No restaurants match “{query}”.` | Clear search |
| Current committed area has no mapped matches | `No matching restaurants in this map area.` | Clear area / Zoom out |
| Catalog matches exist but only without map locations | `These matches are available in Explore, but they do not yet have map locations.` | View in Explore |
| Dependent City invalidated by State | Announce `City cleared because it is not in {state}.` | Continue with State |
| Saved-only filter has no mapped matches | `No saved restaurants appear in this area.` | Clear area / View saved in Explore |
| National mapped source legitimately empty | `Map locations are not available yet.` | Browse Explore |

Never place a generic empty card over the whole map when the list or Explore handoff remains useful.

---

## 26. Error and recovery states

| Failure | User-facing response | Recovery |
| --- | --- | --- |
| Missing/invalid production provider config | `The interactive map isn’t configured right now.` | Open list alternative; operational alert |
| Style load failure | `The map style couldn’t load.` | Retry map; list remains |
| Tile failure | Preserve last good tiles; `Some map details couldn’t load.` | Retry quietly; do not fail on one tile |
| WebGL unavailable | `This browser can’t display the interactive map.` | Open full list |
| WebGL context lost | Preserve state; `The map display was interrupted.` | Retry/recreate map; list |
| Map initialization failure | `The map couldn’t start.` | Retry; list |
| Restaurant map-summary failure | Base map remains; `Restaurant locations couldn’t load.` | Retry data; Explore |
| Filters load but points fail | Controls remain; no false zero count | Retry point layer |
| No matching mapped restaurants | Empty state from Section 25 | Clear filter/area |
| Matches only in Explore | Natural partial-data state | Query-preserving Explore link |
| Geolocation denied/unavailable/timeout | Non-blocking message | Search manually / Try again |
| Offline before load | `You’re offline. The restaurant list may still be available.` | Retry on reconnect |
| Offline after load | Preserve cached map/results | Mark stale; retry later |
| Partial marker rendering failure | Keep successful markers; count discrepancy warning if material | Retry layer, log feature class |
| Save local failure | Do not claim Saved | Retry local save |
| Cloud sync failure | Keep local Saved | Retry sync |

Error classification must distinguish style/source/tile/WebGL/container/data/geolocation. Do not use one `onError` boolean for every class.

---

## 27. Accessibility requirements

- Semantic `main` workspace with a descriptive H1 available to assistive technology.
- Search region with visible label or persistent accessible name.
- Correct labels and descriptions for every filter/combobox.
- Results panel is a named complementary region.
- List rows use links/buttons with normal keyboard semantics; avoid custom `role=option` unless full listbox keyboard behavior is implemented.
- `aria-selected` or `aria-current` identifies the selected row structurally.
- Save labels include restaurant name.
- Michelin distinction has text such as `Three Michelin stars`.
- Marker color is never the only distinction/selection signal.
- A complete non-map list alternative exists.
- Result-count changes use one polite announcement after settling.
- Search this area pending/completion/error is announced once.
- Drawer and expanded-sheet focus is managed and restored.
- Map instructions are concise, dismissible, and do not cover controls.
- Touch targets are approximately 44×44 or larger.
- Visible focus is at least 2px with sufficient adjacent contrast.
- Reduced motion removes fly/ease/spider animations or makes them instant.
- Keyboard users can select/open/save every restaurant represented on the map through the synchronized list.
- The Map route remains useful at 200% zoom/effective 320px width.
- No precise user location is exposed to assistive labels beyond a general `Your approximate location`.

---

## 28. Performance architecture

### Initial data recommendation

Load all **196 approved mapped restaurant summaries** once for `/map`.

Why:

- 196 points is small for MapLibre GeoJSON clustering.
- National clustering and instant pan/zoom remain client-local.
- Search this area avoids a network round-trip at current scale.
- A compact DTO can omit description, reservation, Google fields, notes, visit data, and full media payload.
- The route already needs national discovery.

The server also provides aggregate total/without-location counts for the current public query. Preview imagery is fetched lazily only after selection.

### Future switch threshold

Move to server bounding-box delivery when any of these occur:

- mapped summaries exceed roughly 1,000–1,500 restaurants;
- the compressed map payload becomes meaningfully large against the agreed route budget;
- initial interaction is measurably delayed on mid-range mobile devices; or
- international expansion creates dense regional catalogs for which national preload is no longer appropriate.

At that point, keep a low-zoom aggregate source and use debounced bounding-box queries with request cancellation and stale-response tokens.

### Required boundaries

- MapLibre/react-map-gl client bundle only on `/map` and intentional map embeds.
- No complete catalog inside the global Passport provider.
- Server-render public query/facet metadata.
- Compact marker DTO: slug, distinction, coordinates, name, cuisine/location/price needed for rows; no private state.
- GeoJSON clustering in a memoized client boundary.
- Do not recreate GeoJSON on unrelated personal-state updates.
- Abort stale server/filter requests.
- Deduplicate Search this area work by normalized query+bounds.
- Lazy-load selected preview media.
- Avoid repeated representative image requests.
- Cache public map summaries by canonical source version/query; personal state remains separate.
- Stable stage/skeleton dimensions produce zero layout shift.
- Virtualize/window long result lists without removing the accessible list contract.
- Measure on a mid-range mobile CPU, not only desktop development hardware.
- Assert no recurrence of the 31,969px container.

---

## 29. Analytics events

Use a restrained schema:

| Event | Allowed properties |
| --- | --- |
| `map_opened` | viewport class, initial filter count, mapped result-count bucket |
| `map_search_submitted` | normalized query length, match field category if derived safely, result-count bucket |
| `map_filter_applied` | filter key, value category, count bucket |
| `map_filter_removed` | filter key |
| `map_search_area_used` | zoom bucket, mapped count bucket |
| `map_cluster_selected` | zoom bucket, cluster-size bucket |
| `map_marker_selected` | restaurant slug, distinction, selection source |
| `map_preview_opened` | restaurant slug, surface |
| `map_restaurant_opened` | restaurant slug, source |
| `map_restaurant_saved` | restaurant slug, device/cloud mode; no notes |
| `map_results_panel_toggled` | open/closed, viewport class |
| `map_geolocation_requested` | viewport class |
| `map_geolocation_denied` | denial category only |
| `map_provider_failed` | provider ID, sanitized failure class |
| `map_list_alternative_used` | reason: preference/WebGL/provider/error |

Do not log:

- precise latitude/longitude or bounds;
- Passport notes, plans, visit notes, or visit dates;
- full free-text search unless separately privacy-reviewed;
- provider keys/style URLs containing keys;
- exact user location.

---

## 30. Component tree

```text
MapAppShell
├── AppHeaderClient
└── MapMain
    └── MapWorkspace
        ├── MapA11yNavigation
        ├── MapControlBar
        │   ├── MapSearchForm
        │   ├── MapFilterTrigger
        │   ├── MapResultCount
        │   └── ExploreModeLink
        ├── MapStage
        │   ├── MapCanvas (MapLibre client island)
        │   │   ├── ClusterLayer
        │   │   ├── RestaurantMarkerLayer
        │   │   ├── SpiderfyLayer
        │   │   └── GeolocationControl
        │   ├── SearchThisAreaButton
        │   ├── MapControlStack
        │   ├── MapAttribution
        │   ├── MapResultsDrawer
        │   │   ├── MapResultsHeader
        │   │   ├── MapResultList
        │   │   │   └── RestaurantMapRow
        │   │   └── RestaurantMapPreview
        │   └── RestaurantMapPreview (drawer collapsed)
        ├── MapFilterDialog
        ├── MapBottomSheet
        │   ├── BottomSheetHandle
        │   ├── RestaurantMapPreview
        │   └── MapResultList
        ├── AccessibleMapList
        └── MapStatusRegion
```

Only `MapCanvas`, drawer/sheet interaction, filters, Save controls, and necessary URL/camera coordination should be client islands. Public result preparation remains server-owned.

---

## 31. Files likely to change

This is a forecast for a later implementation plan, not authorization.

### Route and shell

- `src/app/layout.tsx`
- `src/app/map/page.tsx`
- `src/app/map/loading.tsx`
- likely `src/app/map/error.tsx`
- `src/app/globals.css`
- `src/components/shell/AppChrome.tsx`
- `src/components/shell/MapWorkspaceShell.tsx`
- `src/components/shell/AppHeaderClient.tsx`

### Map controller and renderer

- `src/components/map/RestaurantMap.tsx`
- `src/components/map/MapCanvas.tsx`
- `src/lib/map/query.ts`
- `src/config/map.ts`
- `src/lib/data/geocodes.ts`
- likely a route-scoped map summary/query module

### Map presentation

- `src/components/stitch/map/MapWorkspaceView.tsx`
- `MapResultsPanel.tsx`
- `MapResultsList.tsx`
- `MapResultsHeader.tsx`
- `MapMobileSheet.tsx`
- `MapSearch.tsx`
- `MapQuickFilters.tsx`
- `MapActiveFilters.tsx`
- `MapFloatingControls.tsx`
- `SearchThisAreaButton.tsx`
- `MapSelectedRestaurant.tsx`
- `MapEmptyState.tsx`
- `MapLoadingState.tsx`
- map adapters/models/index
- likely new drawer, filter dialog, bounded preview, a11y list, and status components

### Shared restaurant/personal/media

- `src/components/stitch/restaurant/RestaurantMapRow.tsx`
- shared restaurant-card models/adapters after Stage 3 implementation
- `RestaurantMedia.tsx`
- `RestaurantFallback.tsx`
- `MichelinDistinction.tsx`
- `SaveAction.tsx`
- Passport V3 identifier-only state boundary

### Environment/tests/docs

- `.env.example`
- `next.config.ts`/security configuration only if provider origins require it
- `e2e/map.spec.ts`
- `e2e/shell.spec.ts`
- `e2e/reservations.spec.ts` to remove the obsolete Map reservation assertion
- `e2e/google-places.spec.ts` to remove the obsolete Map Google-preview assertion
- `scripts/test_geocodes.mjs`
- `scripts/test_map_ui.mjs`
- provider/config-focused unit tests
- screenshot evidence under a new Stage 4 verification directory

Exact filenames are not binding until an implementation plan inspects the then-current tree and the bundled Next.js guides.

---

## 32. Components to reuse

- `AppHeaderClient`
- route-aware no-footer behavior from `AppChrome`
- `MapCanvas` MapLibre/react-map-gl boundary
- approved geocode loader and override workflow
- `parseMapSearchParams`, bounds parser/formatter after extension
- Explore common query parser/serializer vocabulary
- GeoJSON clustering and cluster expansion behavior
- `GeolocateControl`, with improved state handling
- `RestaurantMapRow`, after semantic/visual redesign
- `RestaurantMedia` and designed fallback contract after Stage 1/3 media work
- `MichelinDistinction`
- `SaveAction`, after V3 sync truth
- Search input/filter primitives that pass Stage 3 accessibility requirements
- Map loading/empty foundations after geometry and copy changes

Reuse means preserve domain behavior where it remains valid; it does not lock current layout, actions, or models.

---

## 33. Components to retire

- Permanent desktop 420px list shown by default
- Full national rendering of 271 result-row DOM nodes
- Current `MapQuickFilters` horizontal scroller
- Current two-state `sheetExpanded` model
- Current fixed 12-meter shared-coordinate offset
- Current single `mapFailed` boolean driven by every map error
- Current fixed `0.02` degree movement threshold without user-origin tracking
- Current selected preview reservation action
- `MapSelectedGoogleSection` from the Map preview; retain Google integration only where separately approved, such as restaurant detail
- Map reservation/Google preview adapters and test assertions
- `min-height:20rem` as a workspace sizing rule
- `MapWorkspaceShell` combination of explicit `calc()` height plus `flex:1`
- URL use of `panel=list` as a proxy for every desktop/mobile presentation state; normalize legacy links to the new `mode=list` contract if adopted
- Public demo style fallback in production
- Any “Map unavailable” state that hides the working list and filter alternative

---

## 34. Risks and dependencies

| Risk/dependency | Severity | Response |
| --- | --- | --- |
| Height chain is patched locally instead of replaced at shell ownership | Critical | Require exact stage/document height tests before visual work |
| MapTiler commercial terms/request billing differ from assumptions | High | Measure MapLibre request volume and approve plan/budget before production |
| Provider key is publicly reusable | High | Origin-restricted per-environment browser keys and monitoring |
| Production silently uses demo tiles | High | Validate config server-side and fail closed |
| 75 restaurants appear “missing” | High | Separate mapped and Explore counts with query-preserving handoff |
| Browser history floods from movement/selection | High | In-memory movement, one commit per area search, replace marker selection |
| Programmatic movement triggers Search this area | High | User-origin camera state machine and tests |
| One tile 404 marks entire map failed | High | Typed provider error classification |
| Mobile sheet obscures controls/attribution | High | Three named positions, safe-area geometry, collision tests |
| Spiderfying harms performance/accessibility | Medium | Limit to max-zoom local overlaps; synchronized list remains canonical |
| Full 196-summary preload grows over time | Medium | Enforce payload/performance thresholds and future bbox switch |
| Global Passport provider still ships full catalog | High | Complete Stage 1 data-boundary work first |
| Media foundation is incomplete | Medium | Use approved fallbacks; do not block marker eligibility |
| Shared Explore/Map URL vocabularies diverge | High | One common parser/serializer contract and round-trip tests |
| Current reservation/Google tests conflict with approved preview | Medium | Retire only Map-specific assertions; preserve detail-page ownership |
| Attribution requirements vary by plan/style | High | Provider metadata contract and production screenshot verification |

---

## 35. Acceptance criteria

### Height and shell

- [ ] MapLibre remains the renderer.
- [ ] `/map` has the canonical header and no shared footer.
- [ ] App shell owns one visual viewport using an intrinsic header row and `minmax(0,1fr)` workspace.
- [ ] At 1440×900, map stage height is approximately 828px within 1px.
- [ ] `documentElement.scrollHeight` does not exceed the visual viewport while Map workspace is active.
- [ ] Results list, not document, owns vertical scrolling.
- [ ] No nested `calc()`/`flex:1` chain recreates the 31,969px stage.
- [ ] Orientation or other genuine container-size changes call or verify MapLibre resize; opening the overlay drawer does not change map dimensions or trigger a resize cycle.
- [ ] Stage never initializes below the usable size threshold.

### Desktop/tablet/mobile

- [ ] Desktop map is the primary full workspace.
- [ ] Results use a left collapsible overlay drawer, closed by default.
- [ ] Expanded widths are approximately 420/400/360px at 1440/1280/1024.
- [ ] Selected marker remains visible when drawer/preview opens.
- [ ] 768 portrait uses map-first sheet; 768 landscape may use an overlay drawer.
- [ ] 430/390/375 use a three-position bottom sheet.
- [ ] No horizontal overflow at 430, 390, or 375px.
- [ ] Fixed controls, sheet, selects, chips, and attribution stay inside the visual viewport.
- [ ] Safe areas and browser chrome changes are respected.

### Search/filters/state

- [ ] Map and Explore share `q`, stars, state, city, cuisine, and price semantics.
- [ ] Mode switching preserves compatible filters.
- [ ] Mobile has one viewport-level Filters dialog and no duplicate quick-filter UI.
- [ ] Search submits deliberately; no server request/history write per keystroke.
- [ ] City responds to State and invalid City is cleared/announced.
- [ ] Search relevance is field-match relevance, not a quality ranking.
- [ ] Copying a URL reproduces committed filters, area, camera, selection, and mode.
- [ ] Invalid camera/bounds values degrade safely.
- [ ] Movement does not flood browser history.

### Map interaction

- [ ] Search this area appears only after meaningful user-origin movement.
- [ ] Initial fit, selected-marker fly/padding, resize, reset, and geolocation do not falsely trigger it.
- [ ] Requests/computations are cancellable and stale responses cannot win.
- [ ] National markers cluster and clusters expand predictably.
- [ ] State count labels are not permanently layered over clusters.
- [ ] One/two/three-star markers differ structurally, not by color alone.
- [ ] Max-zoom co-located restaurants use radial spiderfying without changing source coordinates.
- [ ] Selecting map/list keeps the other surface synchronized.
- [ ] Map position does not reset on Save or sync changes.

### Preview/personal

- [ ] Preview contains image/fallback, distinction, identity, cuisine, location, price, Save, and Open details.
- [ ] Preview contains no reservation, Plan, Record Visit, Google Places, or full description.
- [ ] Save never forces login.
- [ ] Normal sync state does not clutter markers/cards.
- [ ] Local/cloud failures remain distinct and recoverable.

### Coordinate coverage

- [ ] Only approved finite coordinates produce markers.
- [ ] National copy distinguishes mapped restaurants from additional Explore restaurants.
- [ ] Counts come from canonical sources.
- [ ] Matching no-coordinate restaurants remain reachable through a query-preserving Explore link.
- [ ] Public copy avoids internal geocoding/confidence terminology.

### Provider/error/performance

- [ ] Production cannot use the public demo style fallback.
- [ ] Provider ID/style/attribution validate before map initialization.
- [ ] Provider key is browser-safe, origin-restricted, environment-specific, and monitored.
- [ ] Attribution remains visible/compliant in every drawer/sheet state.
- [ ] Style, tile, WebGL, data, geolocation, offline, and Save failures are distinct.
- [ ] One tile failure does not collapse the entire map.
- [ ] List alternative remains functional in every map failure.
- [ ] All 196 compact summaries stay within measured payload/CPU budgets.
- [ ] Global Passport provider no longer receives the full public catalog.
- [ ] Initial and transition skeletons have stable geometry and zero map CLS.

### Accessibility/analytics

- [ ] Search, filters, results, Save, details, area search, and list alternative are keyboard accessible.
- [ ] Result and selected states are announced without duplicate live-region noise.
- [ ] Expanded sheet/drawer focus is managed and restored.
- [ ] Reduced motion disables camera/spider animations.
- [ ] No restaurant information is available only through the canvas.
- [ ] Analytics omit precise location, bounds, keys, and private Passport content.

---

## 36. Screenshot verification plan

### Baseline sources

Compare against:

- `output/playwright/stage1-foundation-2026-07-18/map-viewport-1440.png`
- `output/playwright/stage1-foundation-2026-07-18/map-production-1440.png`
- `output/playwright/stage1-foundation/map-{1440,1280,1024,768,430,390,375}.png`
- relevant `docs/stitch-redesign/baselines/map/*` selection/sheet/error images

### Required captures

For development and production builds:

1. 1440 default, drawer collapsed
2. 1440 drawer expanded
3. 1440 marker selected with drawer closed
4. 1440 cluster selected
5. 1440 Search this area visible/pending/complete
6. 1440 provider configuration failure
7. 1440 tile partial failure
8. 1440 WebGL/list alternative
9. 1280 default and drawer
10. 1024 default and drawer
11. 768 portrait collapsed/preview/expanded
12. 768 landscape drawer
13. 430 collapsed/preview/expanded/list/filter dialog
14. 390 collapsed/preview/expanded/list/filter dialog
15. 375 collapsed/preview/expanded/list/filter dialog
16. no-coordinate-only filtered state
17. geolocation denied and timeout
18. offline/last-good state
19. saved sync-failed preview
20. reduced-motion cluster/selection behavior

### Measurements recorded per capture

- viewport and visual-viewport dimensions;
- header, main, workspace, stage, canvas, drawer, preview, and sheet bounding boxes;
- `scrollWidth/clientWidth` and `scrollHeight/clientHeight`;
- MapLibre canvas count and backing/rendered size;
- map resize events around drawer/sheet/orientation;
- provider/style/tile request status by class;
- result count and mapped/additional count;
- URL before/after movement, area search, selection, and Back/Forward;
- attribution visibility;
- control collision/safe-area measurements;
- console errors;
- accessibility scan plus manual keyboard path;
- transferred JS, map summary payload, preview media, CLS, and interaction timing.

### Blocking comparison

The final evidence must prove:

- the 31,969px stage is gone in development and production;
- document scrolling is not the Map layout mechanism;
- map remains primary when drawer is closed;
- three sheet positions are usable at 430/390/375;
- no horizontal overflow exists;
- Search this area is user-origin-only;
- 196/75 truth is understandable without internal jargon;
- provider and WebGL failure still leave a complete restaurant list;
- attribution and controls remain visible;
- reservation and Google Places are absent from Map previews.

---

## 37. Approved decision log

The product owner approved these binding Stage 4 decisions on 2026-07-18:

1. **Desktop results:** use a left overlay drawer, closed by default, at 420px/400px/360px for 1440px/1280px/1024px.
2. **No map reflow:** opening or closing the drawer must not resize or reflow the map. Preserve zoom, center, selection, filters, and Search-this-area state. Auto-pan a selected marker into the unobstructed area only when needed and avoid changing zoom.
3. **Mobile/tablet results:** use Collapsed, Preview, and Expanded resting positions. Marker selection opens Preview, never Expanded.
4. **Coordinate coverage:** use natural, restrained messaging in the results information area, map-information popover, and contextual empty states. Numeric 196/75 prose is allowed when it materially clarifies coverage; never present it as a dashboard statistic.
5. **Initial Map data:** load all 196 compact mapped summaries on `/map`. Do not ship full restaurant records or large media payloads. Reassess bounding-box delivery near 1,000–1,500 mapped restaurants or earlier if measured payload/mobile performance/international density requires it.
6. **Marker personal state:** do not show Saved state on V1 markers. Saved and sync recovery belong in the preview, result row, and mobile sheet.
7. **Provider:** use MapTiler Cloud as the intended V1 production provider, pending plan, budget ceiling, alert owner, development/preview/production domains, production style, and separate environment keys. Keep the provider abstraction replaceable and never fall back silently to demo tiles in production.
8. **Legacy URLs:** accept `panel=list`, normalize it to `mode=list` with history replacement, preserve query/filters/camera/bounds/selection, and generate only `mode=list` going forward.

No Stage 4 product decision remains open. MapTiler operational values remain an explicit launch-configuration gate, not a reason to reopen the approved Map product direction.

## Hard stop

Stage 4 ends with this approved specification. Do not implement the Map redesign, modify map code/CSS, configure or purchase a provider, ingest media, commit, or push. The next Map action requires a separately authorized implementation plan and completion of the MapTiler operational gate.
