# Places UI Kit cost model

Pricing changes; verify against the [Google Maps Platform pricing list](https://developers.google.com/maps/billing-and-pricing/pricing) before budgeting.

## What is billed

A billable **Places UI Kit Query** occurs when a Place Details (or Place Search) UI Kit element requests a place. One element request counts as one UI Kit query regardless of how many supported fields the component displays.

As of the planning date for this work:

- First **10,000** UI Kit Query events / month: **$0**
- Next tier commonly cited: **$1 per 1,000** queries

This excludes the one-time Places API (New) matching workflow, taxes, and future pricing changes.

## Expected product usage

```text
Monthly UI Kit queries =
  restaurant detail modules loaded
  + selected map restaurants enriched
```

| Monthly detail/selection queries | Estimated UI Kit cost |
| ---: | ---: |
| 5,000 | $0 |
| 10,000 | $0 |
| 20,000 | ~$10 |
| 50,000 | ~$40 |
| 100,000 | ~$90 |

## Cost protections in this codebase

- Feature flag default `false`
- Lazy mount near viewport (detail)
- No UI Kit on Homepage / Explore / Passport / collections / map list rows
- No automatic prefetch of next/previous restaurants
- One full element per detail view; one compact element per deliberate selection
- Debounced map selection changes
- Stable Place ID keys to avoid remount churn
- Development-only query-intent counter (not billing-authoritative)

## Matching workflow cost

GP2 matching uses Places API (New) text/search endpoints with the server matching key. That cost is one-time (plus occasional rematches), separate from monthly UI Kit query volume.
