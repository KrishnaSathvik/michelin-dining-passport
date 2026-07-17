# Restaurant reservations (Phase 5.5)

Outbound reservation actions only. This product does **not** implement availability calendars, checkout, reservation management, or third-party booking APIs.

## Core principle

Never label a control **Reserve now** unless it points to a verified restaurant-specific booking destination.

| Situation | CTA label |
| --- | --- |
| Verified direct Resy / Tock / OpenTable / SevenRooms / restaurant booking page | **Reserve now** |
| Official website, no verified direct booking URL | **Check availability** |
| No website (Michelin listing fallback) | **View booking options** |
| Explicitly no online booking / phone-only | **Visit restaurant website** (or Michelin if no website) |

## Data model

Keyed by stable restaurant slug:

- `data/reservations.json` — approved runtime records
- `data/reservation-candidates.json` — discovery output (not published directly)
- `data/reservation-overrides.json` — manual corrections and explicit statuses

Runtime loaders apply overrides on top of approved records (`src/lib/reservations/data.ts`). Unverified candidate URLs never ship as verified.

Fields: `reservationUrl`, `provider`, `status`, `sourceUrl`, `sourceType`, `confidence`, `verifiedAt`, `notes`.

Statuses: `verified` · `needs_review` · `no_online_booking` · `phone_only` · `temporarily_unavailable` · `unknown`

Providers: `resy` · `tock` · `opentable` · `sevenrooms` · `restaurant_direct` · `michelin` · `other` · `none`

## Resolution order

`getRestaurantReservationAction(restaurant, reservationRecord)`:

1. Verified direct reservation URL (high/medium confidence, not a provider homepage)
2. Official restaurant website → Check availability
3. Michelin Guide listing → View booking options

Restricted statuses (`no_online_booking`, `phone_only`) never claim Reserve now.

Do **not** invent provider search URLs from restaurant names.

## Discovery workflow

```bash
npm run data:reservations:discover   # respectful crawl from official websites
npm run data:reservations:validate
npm run data:reservations:report
python3 scripts/review_reservations.py --report --needs-review
python3 scripts/review_reservations.py --approve <slug>
python3 scripts/review_reservations.py --no-online <slug>
npm run data:reservations:check-links
```

Discovery:

- Starts from each restaurant `website`
- Descriptive User-Agent, delays, timeouts, robots respect, page cache, resume
- Finds reservation-related anchors and known booking hosts
- Scores candidates; auto-approves only strict high-confidence cases
- Never scrapes availability, party size, or time slots
- Never runs in the browser or during page loads

Manual decisions write to `reservation-overrides.json`.

## UI

Shared `ReservationButton` (compact / full) with safe external-link attributes:

- `target="_blank"`
- `rel="noopener noreferrer"`
- accessible “opens in a new tab” text
- external indicator (↗)

Surfaces: homepage, Explore grid/list, restaurant detail, taxonomy, related, map list / marker / mobile sheet, saved / planned / visited / collections.

Detail primary actions:

```text
Reserve now   Official website   Michelin Guide
```

Duplicate destinations are de-duplicated on the detail page.

## Passport extras

Optional local fields (schema v2):

- `reservationPlannedFor`
- `reservationProvider`
- `reservationConfirmationNote`

Clicking Reserve does **not** mark a restaurant planned or visited.

## Analytics preparation

Provider-neutral `reservation_clicked` event via `trackReservationClicked` (DOM custom event + dev console). No analytics SaaS installed in this phase. Private confirmation notes are never logged.

## Link freshness

`npm run data:reservations:check-links` classifies valid / redirect / temporary failure / permanent not found / blocked / auth required. Temporary failures are retained; repeated failures flag manual review — links are not auto-deleted after one failure.

## Legal / attribution

- Outbound links only; no scraped Guide prose or images
- No provider logos without confirmed usage rights
- Future authorized booking APIs (e.g. OpenTable partner API) are out of scope until terms and access are in place

## Known limitations

- Coverage of verified direct links grows with discovery + manual review
- JavaScript-only booking widgets may not yield crawlable anchors
- Shared group booking pages may require human judgment
- Prepaid ticket / experience flows may use “Reserve now” only when the destination is a verified restaurant-specific booking page
