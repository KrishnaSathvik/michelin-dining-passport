# Restaurant detail visual QA notes

Compared implementation against `docs/designs/restaurant_profile_benu/screen.png` (copied as `stitch-benu-reference.png`).

## Complete page silhouette
- Breadcrumbs → 58/42 identity hero → Details + Google band → Related → Nearby → source note → footer.
- Matches Benu section order; Nearby is quieter secondary list beneath Related.

## Hero split ratio
- Desktop media `md:w-[58%]` / identity `md:w-[42%]`; media height locked to 500px on md+.
- At 1024 the flex split still holds; stacks on mobile (media first).

## Image treatment
- First-party approved image when present; otherwise Phase 3 `RestaurantFallback`.
- No Google photography in the hero.

## Distinction / title / metadata
- MichelinDistinction detail badge with gold treatment above Literata title (`clamp(2rem,4vw,3rem)` — not 80–100px).
- Meta: cuisine • city/state • price; address beneath.

## Action hierarchy
- Primary `ReservationAction` (truthful label) + secondary Website when not duplicated.
- Michelin Guide as restrained text link.

## Journey controls
- Circular controls: Save / Want / Plan / Visited / Favorite with text labels.
- Progressive disclosure via planning and visit dialogs (Phase 1 Dialog → sheet on mobile).

## Details / Google / map
- Details grid with address/cuisine/price/location + OSM map preview (h-48).
- Google frame ~380px, clear provider copy; single lazy `GooglePlaceDetails`.

## Related / Nearby
- Related: Phase 3 discovery cards, 1–3 columns.
- Nearby: quieter rows; no Google mounts.

## Mobile
- Sticky reservation + save bar at 390; hidden when dialog open.
- Dialogs become bottom sheets via Phase 1 Dialog primitives.

## Accepted deviations
- Breadcrumbs keep Home → Explore → State → City → Name (more accurate than Stitch Home/Explore/Name).
- Private planning note field maps to existing `reservationConfirmationNote` (no schema change).
- Visit dialog omits personal rating UI but preserves existing rating on save.
- Google disabled/error/limited screenshots captured under flag-off local defaults (no live key).
- Loading screenshot may show partial hydration rather than pure skeleton.

## Provider boundary
- No Google content in view models or structured data.
- One full UI Kit mount on detail; none on related/nearby.
