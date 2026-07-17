# Restaurant identity

Stable identity keeps user Passport data attached across roster refreshes.

## Public identity

- **Slug** is the stable public key: `{name}-{city}-{stateCode}` (lowercased, slugified).
- **Supabase UUID** is deterministic UUID v5 from `mdp:restaurant:{slug}`.

Never renumber restaurants casually. Prefer preserving the existing slug when a restaurant is merely renamed or relocated.

## Match order for incoming roster rows

1. Michelin Guide URL (normalized)
2. Stable existing slug
3. Normalized name + city + state
4. Normalized name + address
5. Manual mapping in `data/restaurant-identity-overrides.json`

Do **not** match on name alone when multiple candidates exist. Ambiguous matches are reported as possible duplicates for developer review.

## Identity overrides

Each override should include:

- One or more incoming keys (`incomingMichelinGuideUrl`, `incomingSlug`, `incomingNameCityState`, `incomingNameAddress`)
- `canonicalSlug` of the existing restaurant
- `reason`
- `verificationDate`

## Field overrides

`data/restaurant-field-overrides.json` can force corrected websites, publication decisions, or other fields after matching. Use sparingly and document why.

## Award history

Star changes append/retain rows in `restaurant_awards` (and `data/restaurant-awards.json`). Previous guide-year values remain; `is_current` marks the active award. There is no admin UI for award history in Phase 7.
