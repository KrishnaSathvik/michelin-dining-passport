# Google Places hybrid architecture

## Locked model

Keep **MapLibre** for `/map`. Use **Google Places UI Kit** only where trust matters most:

1. Restaurant detail pages — one full `gmp-place-details` element
2. Deliberately selected map restaurant — one compact `gmp-place-details-compact` element

Do **not** use Places UI Kit (or raw Place Photos) on Homepage, Explore cards, Passport cards, collection cards, or map result list rows.

## Surface strategy

| Surface | Imagery / data |
| --- | --- |
| Homepage hero, destinations, cuisines | Owned or licensed generic imagery |
| Named homepage cards | Approved restaurant image or designed fallback |
| Explore cards | Approved image or designed fallback |
| Restaurant detail | Full Places UI Kit details component |
| Map result list | First-party compact card |
| Selected map restaurant | Compact Places UI Kit component |
| Passport and collections | Approved image or designed fallback |
| Place identity | Persist Google Place ID only |

## Ownership boundary

**Our product owns:** restaurant name, Michelin distinction, cuisine, location, price, canonical address, Save/Passport, truthful reservation CTA, related Michelin restaurants.

**Google’s component owns:** photos, Google rating, hours, phone, website, place summary, review summary, reviews, and required attribution — rendered inside the UI Kit. We do not scrape the shadow DOM, extract photo URLs, or re-create Google reviews in custom React cards.

## Why

- Retain the approved MapLibre experience (Batch 5).
- Avoid 16–24 billable photo requests every time Explore opens.
- Show real Google photos/reviews where diners need trust.
- Store Place IDs indefinitely (permitted); never cache photo resource names.
- Feature-disable leaves discovery fully functional.

## Query model

```
Monthly UI Kit queries ≈
  restaurant detail modules loaded
  + selected map restaurants enriched
```

One visible full element per detail visit. One compact element per deliberate map selection. No prefetch of neighbors. No remount on unrelated React state.

## References

- [Places UI Kit getting started](https://developers.google.com/maps/architecture/places-ui-kit-getting-started)
- [Place Details elements](https://developers.google.com/maps/documentation/javascript/places-ui-kit/place-details)
- [Get started (enable + load)](https://developers.google.com/maps/documentation/javascript/places-ui-kit/get-started)
