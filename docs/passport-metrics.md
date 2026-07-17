# Passport metrics

Personal Passport metrics are calculated from local (and later cloud) visit records.

## Stars experienced

Use a simple additive star experience total:

- Visiting a **one-star** restaurant adds **1**
- Visiting a **two-star** restaurant adds **2**
- Visiting a **three-star** restaurant adds **3**

Each visited restaurant contributes once. Unvisiting removes that restaurant’s contribution.

## Other metrics

| Metric | Definition |
| --- | --- |
| Restaurants visited | Count of restaurants marked visited |
| States explored | Distinct `stateSlug` values among visited restaurants |
| Cities explored | Distinct `citySlug` values among visited restaurants |
| Cuisines tried | Distinct `cuisineSlug` values among visited restaurants |
| Three-star restaurants visited | Visited restaurants with `stars === 3` |
| Saved restaurants | Count of restaurants marked saved |
| Visits by year | Counts of visited restaurants that have a `visitDate`, grouped by year |
