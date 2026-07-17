# Seed reconciliation report

Generated: 2026-07-17T14:30:40.288Z

| Metric | Value |
| --- | --- |
| Restaurants | 271 |
| 1★ | 216 |
| 2★ | 39 |
| 3★ | 16 |
| With coordinates | 196 (72.3%) |
| Reservation records | 271 |
| Award history rows | 271 |

## Reservation status counts

| Status | Count |
| --- | --- |
| needs_review | 106 |
| unknown | 42 |
| verified | 123 |

## Notes

- Restaurant IDs are deterministic UUID v5 values from slug.
- Seed upserts restaurants, reservations, and award history only; user personal data is never deleted.
- Runtime reservation rows come from `data/reservations.json` (+ overrides), not candidate files.
