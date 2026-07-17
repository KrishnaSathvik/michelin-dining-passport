# Data update workflow

Safe developer-run process for Michelin roster changes. No admin dashboard is required for launch.

## Pipeline

```text
Updated workbook/CSV
        ↓
npm run data:diff -- --file ./data/new-guide.xlsx
        ↓
Review data/reports/restaurant-diff.json
        ↓
Set "reviewed": true (and notes)
        ↓
npm run data:apply-update -- --file ./data/new-guide.xlsx --diff ./data/reports/restaurant-diff.json
        ↓
(dry-run by default)
        ↓
npm run data:apply-update -- ... --confirm --update-supabase-seed
        ↓
Validate → commit → deploy
```

## Commands

| Command | Purpose |
| --- | --- |
| `npm run data:diff -- --file <path>` | Compare incoming XLSX/CSV/JSON to `data/restaurants.json` |
| `npm run data:apply-update -- --file <path> --diff <diff>` | Dry-run apply (default) |
| `npm run data:apply-update -- ... --confirm` | Write local artifacts after review |
| `npm run data:geocodes:maintain -- <command>` | Geocode maintenance |
| `npm run data:reservations:maintain -- <command>` | Reservation maintenance |

## Diff statuses

- `new`
- `removed_from_current_import` (requires review; not auto-closed)
- `updated` (with typed field changes)
- `unchanged`
- `possibleDuplicates` (report section)

Field change types include star upgrades/downgrades, name, address, city/state, cuisine, price, website, and Michelin Guide URL changes.

## Safety rules

1. Apply defaults to **dry-run**.
2. Requires a reviewed diff and matching file checksum.
3. Creates a timestamped backup under `data/backups/` before writing.
4. Preserves canonical restaurant slugs (and therefore deterministic UUIDs) so user saves/visits/collections stay attached.
5. Does not modify approved coordinates or verified reservation URLs.
6. Direct production DB apply is **blocked**. Deploy through regenerated seed + normal release process.
7. `removed_from_current_import` rows remain in the local roster until a developer decides otherwise.

## Overrides

- `data/restaurant-identity-overrides.json` — exceptional identity matches
- `data/restaurant-field-overrides.json` — field corrections that must survive imports
- Existing geocode / reservation override files remain authoritative for enrichment

Document `reason` and verification date on every override.

## Rollback

```bash
cp data/backups/restaurants-<timestamp>.json data/restaurants.json
npm run data:validate
npm run data:validate-geocodes
npm run data:reservations:validate
npm run supabase:seed:generate
```

Then redeploy the previous application revision if needed.
