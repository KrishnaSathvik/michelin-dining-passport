# Phase 9 — Collections baselines

Captured against Stitch references under `docs/designs/` and implementation under `src/components/stitch/collections/`.

## Product decisions (locked)

### Featured collection

Most recently updated **non-empty** collection, ordered by `updatedAt` descending then `id` ascending. If every collection is empty, the same ordering picks the first collection overall. There is no separate pin field.

### Search and sort

Index search and sort are **local presentation state** only (React state). They are not URL-backed; refresh resets to defaults (`query=""`, `sort=updated-desc`).

### Post-create navigation

Creating a collection navigates to `/collections/[slug]` for the new collection, preserving the prior product flow.

### Stale members

Member IDs that do not resolve in the restaurant catalog are omitted from display rows and from the progress denominator (visited / total). Membership slugs remain in the store until the collection is edited. Duplicate slugs in `restaurantSlugs` count once for display/progress.

### Member order

Resolved members render in `restaurantSlugs` array order (after de-duplication).

### Omitted Stitch controls (OD-11)

Public toggle and Share are omitted from the product surface.

### Cover resolution

Cover image resolves in order: `coverRestaurantSlug` → first resolved member → `RestaurantFallback` keyed by collection id/name. No cover upload and no stock travel hero image.

## Deviations from Stitch

| Area | Accepted deviation |
|---|---|
| Share | Not implemented (OD-11) |
| Public / private toggle | Not implemented (OD-11); collections remain private |
| Cover upload | Not implemented; cover follows restaurant/fallback rules above |
| Detail hero imagery | No invented stock travel photography |
| Member list on detail | Restaurant rows added below the hero; the Stitch detail mock lacked rows |

## Capture set

| Folder | Files |
|---|---|
| `references/` | `collections-overview-reference.png`, `collection-detail-reference.png` |
| `index/` | `index-1440`…`390`, `featured-collection`, `collection-grid`, `search-sort`, `index-empty`, `index-loading` |
| `dialogs/` | `create-dialog-1440/390`, `create-validation`, `edit-dialog-1440/390`, `delete-dialog-1440/390` |
| `detail/` | `detail-1440`…`390`, `detail-hero`, `collection-progress`, `member-rows`, `detail-empty`, `detail-loading`, `add-restaurants`, `remove-restaurant`, `stale-member-state`, `long-collection-name`, `fallback-cover`, `truthful-reservation-labels` |
| `states/` | Reserved for shared edge-state crops |

Seed store includes `california-celebration-trip` (with stale slug `missing-stale-slug`), `empty-collection`, and a long-name collection.

Capture: `node scripts/capture_collections_baselines.mjs` with app on `:3000` (or `BASE_URL`).
