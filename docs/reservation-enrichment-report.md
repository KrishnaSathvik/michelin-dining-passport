# Reservation enrichment report

Generated: 2026-07-17 05:15 UTC

## Coverage

- Total restaurants: **271**
- With official website: **267**
- Verified direct reservation links: **123**
- Official-website fallbacks (unverified booking): **144**
- Michelin listing fallbacks (no website): **4**
- Phone-only: **0**
- No online booking: **0**
- Needs review: **106**
- Unknown: **42**
- Temporarily unavailable: **0**

## Provider breakdown (verified only)

- `restaurant_direct`: 63
- `resy`: 39
- `sevenrooms`: 12
- `tock`: 8
- `opentable`: 1

## Discovery

- Restaurants with discovery entries: **271**
- Candidate links found: **676**
- Auto-approved from discovery: **121**
- Manual overrides: **3**

## Process notes

- Candidates live in `data/reservation-candidates.json`.
- Approved runtime records live in `data/reservations.json`.
- Manual decisions are written to `data/reservation-overrides.json`.
- Low/medium confidence candidates are never auto-published as verified.
- Availability, party size, and time slots are not scraped.

## Commands

```bash
npm run data:reservations:discover
npm run data:reservations:validate
npm run data:reservations:report
python3 scripts/review_reservations.py --report --needs-review
```
