# Provider attribution and image sources

## Michelin

This product is independent and not affiliated with Michelin. Michelin Guide distinctions shown in the atlas come from our verified workbook roster. We do not ingest or rehost Michelin Guide photography.

## First-party / approved imagery

Homepage, Explore, Passport, collections, and ordinary restaurant cards use approved restaurant imagery or designed fallbacks. Discovery surfaces do not request Google Place Photos.

## Google Places UI Kit

When `NEXT_PUBLIC_GOOGLE_PLACES_UI_KIT_ENABLED=true` and a browser key is configured:

- Restaurant detail pages may show one full Places UI Kit Place Details element.
- The deliberately selected map restaurant may show one compact Places UI Kit element.

Google-provided photos, ratings, hours, phone numbers, websites, summaries, and reviews remain Google content, rendered inside Google’s component with required attribution. We do not download, cache, proxy, or rehost Google photography. We store Google Place IDs only.

We do not claim independent verification of Google reviews and do not imply Google sponsorship or product endorsement.

See also:

- [architecture.md](./architecture.md)
- [data-policy.md](./data-policy.md)
- [cost-model.md](./cost-model.md)
