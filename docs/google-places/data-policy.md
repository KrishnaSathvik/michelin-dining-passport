# Google Places data policy

## What we store

Only Google **Place IDs** and our internal match metadata:

- `restaurantSlug`
- `placeId` (when matched / manually approved)
- `status`
- `confidence`
- `method`
- `reviewedAt`
- optional internal `notes`

Stored in `data/google-place-ids.json` (and overrides). Place IDs may be stored indefinitely per Google Places policies.

## What we never store

Do **not** commit or cache Google-returned:

- Photos or photo resource names
- Ratings or review counts
- Reviews or summaries
- Hours, phone, website, Google address/coordinates
- Raw provider search/details payloads

Photo resource names can expire and must not be cached. We do not download, proxy, rehost, or persist Google photography.

## Runtime display

Google photos, ratings, hours, phone, website, summaries, and reviews appear only inside Places UI Kit web components. Attribution remains visible. Michelin distinctions are always shown separately from Google ratings.

## Editorial claims

- Google-provided content remains Google content.
- We do not claim independent verification of Google reviews.
- We do not imply Google sponsorship or product endorsement.
- This product remains independent of Michelin.

## Fallbacks

When Place ID, feature flag, API key, script load, quota, or component request fails, show a quiet unavailable message. The rest of the restaurant experience continues on first-party data.
