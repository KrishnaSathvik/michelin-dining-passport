# Google Place ID matching report

Generated: 2026-07-17T18:48:40.167557+00:00

## Coverage

- Roster restaurants: **271**
- Match records: **271**
- matched: **214**
- manually_approved: **57**
- needs_review: **0**
- rejected: **0**
- no_match: **0**
- Enrichment coverage (approved Place ID): **100.0%** (271/271)
- Duplicate approved Place IDs: **0**
- All 3-star restaurants approved: **yes** (16)

## Shared-address sibling groups

- Groups: **7**

- `melisse-santa-monica-ca=manually_approved, citrin-santa-monica-ca=manually_approved`
- `kizaki-denver-co=manually_approved, margot-denver-co=manually_approved`
- `saga-new-york-ny=manually_approved, crown-shy-new-york-ny=manually_approved`
- `bom-new-york-ny=manually_approved, oiji-mi-new-york-ny=manually_approved`
- `joji-new-york-ny=manually_approved, le-pavillon-new-york-ny=manually_approved`
- `l-abeille-new-york-ny=manually_approved, muku-new-york-ny=manually_approved`
- `isidore-san-antonio-tx=manually_approved, nicosi-san-antonio-tx=manually_approved`

## Unresolved limitations

- Server-side matching requires an IP-allowlisted matching API key.
- Prefer verified `no_match` over forcing weak Place IDs when confidence is insufficient.

## Policy

- Only Place IDs and internal match metadata are stored.
- Google photos, ratings, reviews, hours, phones, websites, and raw payloads are not committed.
- Shared-address siblings require distinct Place IDs and manual review when ambiguous.

