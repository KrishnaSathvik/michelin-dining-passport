# Dining Passport Shared Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the contradictory Passport journey model, establish a rights-safe restaurant media system, simplify the shared application shell, correct data-loading and synchronization boundaries, and make the existing MapLibre workspace production-ready before any page redesign begins.

**Architecture:** Personal state becomes four record families—bookmarks, one optional active plan per restaurant, appendable visit records, and collections whose members must be bookmarked. The app remains local-first, with a durable mutation outbox and visible sync status for signed-in users. Public restaurant data stays server-owned and route-scoped; media metadata is stored separately from the canonical roster; MapLibre remains the renderer with a production tile provider and a viewport-constrained workspace.

**Tech Stack:** Next.js 16.2.10 App Router, React 19.2.4, TypeScript, Tailwind CSS 4, Supabase Postgres/Auth/Storage, localStorage, MapLibre GL 5.24, react-map-gl 8.1, Playwright 1.61.

## Global Constraints

- Do not begin Homepage or other page-level redesign implementation until this plan is approved.
- Do not model the journey as one mutually exclusive status enum.
- User-facing journey language is Unsaved, Saved, Planned, and Visited.
- Planning and recording a visit automatically create a saved bookmark.
- A restaurant may have past visits and a future plan simultaneously.
- Collections may contain saved restaurants only.
- Favorite is not a restaurant-level state; `wouldReturn` and `personalFavorite` belong to individual visits.
- A favorite-only legacy record becomes a bookmark with internal `legacyFavorite` provenance; it does not create a visit.
- An undated migrated visit is allowed only when legacy content clearly proves a completed visit, and no date may be fabricated.
- Do not scrape restaurant imagery, redistribute Michelin imagery, or reuse Google Places photos outside Google's approved UI surface.
- Do not fake 271 restaurant images.
- Supabase Storage is the V1 verified-media store, with thumbnail, card, hero, and gallery variants created during ingestion rather than paid runtime transformations.
- Keep MapLibre unless verified evidence proves the renderer is the cause of failure.
- Cloud mutations must never look fully synchronized after a failed write.
- Account deletion must offer separate choices for cloud account/data deletion and clearing this device.
- Shared consumer UI must not use dataset, roster, ingestion, or import language.
- The only shared disclaimer is: “Dining Passport is an independent discovery platform and is not affiliated with the Michelin Guide.”
- No production implementation, commit, or push is authorized by Stage 1.

---

## 1. Verified screenshot evidence

### Capture method and scope

The required route matrix was captured from the local application with Playwright at 1440, 1280, 1024, 768, 430, 390, and 375 CSS-pixel widths. The full evidence set is in `output/playwright/stage1-foundation/`. Contact sheets provide a quick cross-width comparison; individual PNGs retain the original full-page evidence.

| Surface | Cross-width evidence | Individual filename pattern | Verified observations |
| --- | --- | --- | --- |
| Homepage | `output/playwright/stage1-foundation/contact-home.png` | `home-{width}.png` | Header breakpoints are consistent. The hero works responsively, but every featured restaurant is an initials fallback and the footer repeats source/disclaimer language. |
| Explore | `output/playwright/stage1-foundation/contact-explore.png` | `explore-{width}.png` | All restaurant cards are fallbacks. Mobile pages become very long. The 375 capture is 380px wide, proving residual horizontal overflow. |
| Map | `output/playwright/stage1-foundation/contact-map.png` | `map-{width}.png` | Desktop/tablet captures expand to roughly 32,000px and display a misleading mostly-blue map. Mobile uses a bounded 900px viewport. |
| Michelin Stars | `output/playwright/stage1-foundation/contact-michelin-stars.png` | `michelin-stars-{width}.png` | Responsive composition is stable, but source/independence explanations are repeated in both content and footer. |
| Restaurant detail | `output/playwright/stage1-foundation/contact-restaurant-detail.png` | `restaurant-detail-{width}.png` | Hero, related cards, and nearby cards all fall back. Save/Want/Planned/Visited/Favorite and separate plan/visit actions duplicate the journey UI. |
| Empty Passport | `output/playwright/stage1-foundation/contact-passport-empty.png` | `passport-empty-{width}.png` | The Save → Plan → Visit explanation is clearer than the current domain model and should become the canonical journey language. |
| Populated Passport | `output/playwright/stage1-foundation/contact-passport-populated.png` | `passport-populated-{width}.png` | Top-level Favorites and “To visit” expose the old flags. Footer repetition persists on the personal surface. |
| Login | `output/playwright/stage1-foundation/contact-login.png` | `login-{width}.png` | The authentication-shell exception works: no duplicate global header/footer. |
| Signup | `output/playwright/stage1-foundation/contact-signup.png` | `signup-{width}.png` | The form-first authentication shell works across all reference widths. |

The width files exist for every required surface. Their measured pixel dimensions confirm the requested width except `explore-375.png`, which is 380px wide because content expands the document.

### Fresh map diagnosis, 2026-07-18

Fresh development and production captures are:

- `output/playwright/stage1-foundation-2026-07-18/map-viewport-1440.png`
- `output/playwright/stage1-foundation-2026-07-18/map-production-1440.png`

The same failure occurs under `next dev` on port 3113 and the existing production build under `next start` on port 3114.

| Check | Development | Production | Conclusion |
| --- | --- | --- | --- |
| Page title/route | `Map · Dining Passport`, `/map` | Same | Correct app and route. |
| Style request | `https://demotiles.maplibre.org/style.json` → 200 | Same → 200 | Style URL is reachable. |
| TileJSON request | Demo TileJSON → 200 | Same → 200 | Provider metadata is reachable. |
| Vector tile requests | Mixture of 200 and 404 across a world-spanning range | Same | The oversized canvas requests excessive/out-of-range demo tiles. |
| Console | No errors or warnings beyond dev HMR messages | No errors or warnings | No JavaScript initialization failure. |
| WebGL | WebGL 1 and WebGL 2 available | Same | WebGL is not the blocker. |
| MapLibre canvas | One `.maplibregl-canvas` exists | Same | Renderer mounts successfully. |
| Map unavailable state | Not present | Not present | Current failure detection does not recognize the visual defect. |
| Viewport | 1440 × 900 | 1440 × 900 | Test viewport is correct. |
| Map stage | 1020 × 31,968.7px | Same | Root cause is container/flex sizing. |
| Document scroll height | 32,041px | Same | Desktop map incorrectly participates in full document flow. |
| CSP | No CSP configured in `src/`, `next.config.ts`, `vercel.json`, or `vercel.ts` | Same build | CSP is not the current cause. |
| Map environment | No `NEXT_PUBLIC_MAP_STYLE_URL` or `NEXT_PUBLIC_MAP_ATTRIBUTION` in local env files | Build uses same fallback | Public demo style is guaranteed when deployment env is absent. |

The visible blue plane is the top of a nearly 32,000px world canvas, not proof that tiles or MapLibre are unavailable. The map shell must be fixed before assessing visual style quality.

## 2. Explicit product decisions

These decisions were approved by the product owner on 2026-07-18 and are binding for later implementation unless a newer decision supersedes them:

1. The public journey progression is Unsaved → Saved → Planned → Visited, while Planned and Visited may coexist.
2. Saved is backed by a bookmark record, not a boolean on an aggregate restaurant row.
3. Each restaurant has at most one non-deleted active plan per user.
4. Visits are append-only records with independent edit/delete operations; repeat visits never overwrite history.
5. `wouldReturn` and `personalFavorite` are nullable/boolean fields on a visit.
6. Planning, visiting, and adding a restaurant to a collection create the bookmark in the same atomic mutation.
7. Removing a plan preserves the bookmark, visits, and collection membership.
8. Removing a visit preserves the bookmark, plan, other visits, and collection membership.
9. A plain bookmark can be removed directly. If a plan or any visits exist, “Unsave” is blocked and the UI offers an explicit destructive “Remove from Passport…” flow that names the dependent plan, visit count, and collection count.
10. Confirmed “Remove from Passport” deletes the plan and visits, removes collection memberships, and finally deletes the bookmark. This is never the default one-click action.
11. Removing a bookmark always removes the restaurant from collections because collection membership cannot outlive the bookmark.
12. A favorite-only legacy record becomes a bookmark with `legacyFavorite=true` migration provenance. It does not become a visit and Favorite does not return as a primary UI state.
13. A legacy record without `visited=true` becomes an undated visit only when favorite dishes, a completed-visit note, a would-return value, a rating, or another personal dining impression clearly proves a completed visit. It uses `visitedAt=null` and `datePrecision="unknown"` and displays “Visited · Date not recorded.”
14. Generic legacy notes that do not prove a completed visit become a private bookmark note. Migration never fabricates a visit date.
15. `wantToVisit=true` becomes a bookmark only; Want disappears from UI and storage.
16. Cloud sync is local-first: update the device immediately, persist an outbox operation, retry automatically, show Pending sync until acknowledged, and expose Retry when automatic attempts are exhausted.
17. The product distinguishes Saved on this device, Sync pending, Synced, and Sync failed. A local mutation never implies successful cloud synchronization.
18. Account deletion leaves device data intact by default. An unchecked “Also clear this device’s Passport data” option controls local deletion.
19. If device data is retained during cloud account deletion, the current in-memory cloud Passport snapshot is written to local storage after server deletion succeeds.
20. If cloud account deletion fails, local data is not cleared even if the checkbox was selected.
21. Restaurant media uses a separate verified-media catalog; the base roster remains factual and media-independent.
22. Supabase Storage is the approved V1 owned asset store. Thumbnail, card, hero, and gallery/full-size variants are generated during ingestion; paid runtime transformations are not approved for V1.
23. Remote hotlinks are allowed only when the license explicitly requires provider delivery.
24. Media activation requires automated metadata validation and accountable human review. A second human approver is not mandatory; unclear, high-risk, or insufficiently documented assets require manual escalation.
25. Curated fallback photography is visibly labeled “Representative image” on detail/gallery surfaces and must never be described as the restaurant.
26. MapLibre remains the renderer. The approximately 31,969px desktop map container is the confirmed cause of the current blank-map defect.
27. MapTiler Cloud is the approved initial production style/tile provider, using a domain-restricted browser key, environment-variable configuration, required attribution, usage monitoring, budget alerts, and a provider abstraction.
28. The public MapLibre demo style is allowed only in development. Production fails closed to the list-plus-error state when production map configuration is absent and never requests public demo tiles.
29. Deletion tombstones are retained for 90 days.
30. Collections remain private-only for V1.
31. The full restaurant catalog is removed from the global Passport provider; route-specific restaurant summaries are hydrated by identifier.
32. The map route has no footer. Authentication routes retain their dedicated shell with no global header/footer.
33. Global search does not load the catalog in the header. The trigger navigates to `/explore?focus=search`, where the route-owned search field receives initial focus.
34. Source methodology remains available at `/source-information`; it is removed from repeated shared/footer/detail copy.

## 3. Journey domain model

### Derived UI state

```ts
export type JourneyState = {
  isUnsaved: boolean;
  isSaved: boolean;
  isPlanned: boolean;
  isVisited: boolean;
  activePlan: ActiveRestaurantPlan | null;
  visits: RestaurantVisit[];
};

export function deriveJourneyState(input: {
  bookmark: SavedRestaurantBookmark | null;
  activePlan: ActiveRestaurantPlan | null;
  visits: RestaurantVisit[];
}): JourneyState {
  const isSaved = input.bookmark !== null;
  const isPlanned = input.activePlan !== null;
  const isVisited = input.visits.length > 0;
  return {
    isUnsaved: !isSaved && !isPlanned && !isVisited,
    isSaved,
    isPlanned,
    isVisited,
    activePlan: input.activePlan,
    visits: input.visits,
  };
}
```

The database and store invariants make `plan without bookmark` and `visit without bookmark` impossible, but `deriveJourneyState` still treats any dependent record as non-unsaved so corrupt legacy input cannot render a false Unsaved state during recovery.

### Proposed TypeScript contracts

```ts
export type IsoDate = `${number}-${number}-${number}`;
export type IsoTimestamp = string;
export type SyncRecordId = string; // UUID generated on the client

export type SavedRestaurantBookmark = {
  restaurantSlug: string;
  privateNote: string;
  legacyFavorite: boolean;
  createdAt: IsoTimestamp;
  updatedAt: IsoTimestamp;
  deletedAt: IsoTimestamp | null;
};

export type ActiveRestaurantPlan = {
  id: SyncRecordId;
  restaurantSlug: string;
  plannedFor: IsoDate | null;
  reservationProvider: string | null;
  confirmationNote: string | null;
  createdAt: IsoTimestamp;
  updatedAt: IsoTimestamp;
  deletedAt: IsoTimestamp | null;
  version: number;
};

export type RestaurantVisit = {
  id: SyncRecordId;
  restaurantSlug: string;
  visitedAt: IsoDate | null;
  datePrecision: "day" | "unknown";
  personalRating: 1 | 2 | 3 | 4 | 5 | null;
  privateNotes: string;
  favoriteDishes: string[];
  wouldReturn: boolean | null;
  personalFavorite: boolean;
  createdAt: IsoTimestamp;
  updatedAt: IsoTimestamp;
  deletedAt: IsoTimestamp | null;
  version: number;
  legacySourceKey: string | null;
};

export type PassportCollection = {
  id: SyncRecordId;
  slug: string;
  name: string;
  description: string;
  private: true;
  coverRestaurantSlug: string | null;
  createdAt: IsoTimestamp;
  updatedAt: IsoTimestamp;
  deletedAt: IsoTimestamp | null;
  version: number;
};

export type CollectionMembership = {
  id: SyncRecordId;
  collectionId: SyncRecordId;
  restaurantSlug: string;
  position: number;
  createdAt: IsoTimestamp;
  updatedAt: IsoTimestamp;
  deletedAt: IsoTimestamp | null;
  version: number;
};

export type SyncEntity =
  | "bookmark"
  | "plan"
  | "visit"
  | "collection"
  | "collectionMembership";

export type PassportMutation = {
  id: SyncRecordId;
  entity: SyncEntity;
  entityId: string;
  operation: "upsert" | "delete";
  payload: unknown;
  baseVersion: number | null;
  createdAt: IsoTimestamp;
  attempts: number;
  nextAttemptAt: IsoTimestamp | null;
  lastError: string | null;
};

export type PassportSyncState = {
  status: "local-only" | "synced" | "pending" | "offline" | "failed";
  pendingCount: number;
  lastAttemptAt: IsoTimestamp | null;
  lastSuccessfulSyncAt: IsoTimestamp | null;
  lastError: string | null;
};

export type PassportStoreV3 = {
  version: 3;
  bookmarks: Record<string, SavedRestaurantBookmark>;
  plans: Record<SyncRecordId, ActiveRestaurantPlan>;
  visits: Record<SyncRecordId, RestaurantVisit>;
  collections: Record<SyncRecordId, PassportCollection>;
  collectionMemberships: Record<SyncRecordId, CollectionMembership>;
  outbox: Record<SyncRecordId, PassportMutation>;
  sync: PassportSyncState;
  migration: {
    migratedFromVersion: 1 | 2 | null;
    migratedAt: IsoTimestamp | null;
    warnings: Array<{
      restaurantSlug: string;
      code:
        | "legacy_favorite_preserved_as_bookmark"
        | "legacy_visit_created_with_unknown_date"
        | "legacy_note_preserved_as_bookmark_note"
        | "unknown_restaurant_slug";
    }>;
  };
};
```

### Domain commands and invariants

All mutations go through commands; components never patch entity objects directly.

```ts
export type PassportCommandResult =
  | { ok: true; store: PassportStoreV3; mutationIds: string[] }
  | {
      ok: false;
      reason:
        | "bookmark_has_dependents"
        | "collection_requires_bookmark"
        | "active_plan_conflict"
        | "record_not_found"
        | "validation_failed";
      details?: Record<string, number | string>;
    };

export function saveRestaurant(
  store: PassportStoreV3,
  restaurantSlug: string,
): PassportCommandResult;

export function upsertActivePlan(
  store: PassportStoreV3,
  input: Omit<ActiveRestaurantPlan, "createdAt" | "updatedAt" | "deletedAt" | "version">,
): PassportCommandResult;

export function removeActivePlan(
  store: PassportStoreV3,
  restaurantSlug: string,
): PassportCommandResult;

export function recordVisit(
  store: PassportStoreV3,
  input: Omit<RestaurantVisit, "createdAt" | "updatedAt" | "deletedAt" | "version">,
): PassportCommandResult;

export function updateVisit(
  store: PassportStoreV3,
  visitId: string,
  patch: Partial<
    Pick<
      RestaurantVisit,
      | "visitedAt"
      | "datePrecision"
      | "personalRating"
      | "privateNotes"
      | "favoriteDishes"
      | "wouldReturn"
      | "personalFavorite"
    >
  >,
): PassportCommandResult;

export function removeVisit(
  store: PassportStoreV3,
  visitId: string,
): PassportCommandResult;

export function removeBookmark(
  store: PassportStoreV3,
  restaurantSlug: string,
): PassportCommandResult;

export function removeRestaurantFromPassport(
  store: PassportStoreV3,
  restaurantSlug: string,
  confirmation: { cascade: true },
): PassportCommandResult;

export function addRestaurantToCollection(
  store: PassportStoreV3,
  collectionId: string,
  restaurantSlug: string,
): PassportCommandResult;
```

`upsertActivePlan`, `recordVisit`, and `addRestaurantToCollection` must call the same bookmark-creation helper and enqueue both operations in one local transaction. The cloud endpoint applies the corresponding operations in one database transaction.

### Multiple-visit behavior

- “Record visit” always creates a new visit with a new client UUID.
- The restaurant detail page shows the most recent visit summary and a “View all visits” control when count is greater than one.
- Editing targets a visit ID, never the restaurant slug.
- Deleting one visit cannot delete another visit or the active plan.
- Visited remains true until all non-deleted visits are removed.
- Passport metrics count visit records for meals-by-year and distinct restaurants for restaurants-visited/states/cities/cuisines.
- `personalFavorite` and `wouldReturn` are evaluated per visit. A restaurant-level “has a favorite visit” badge may be derived but is not persisted.

## 4. Proposed database schema and migration strategy

### New tables

```sql
create table public.saved_restaurant_bookmarks (
  user_id uuid not null references public.profiles(id) on delete cascade,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  private_note text not null default '',
  legacy_favorite boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  primary key (user_id, restaurant_id)
);

create table public.restaurant_plans (
  id uuid primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  planned_for date,
  reservation_provider text,
  confirmation_note text check (char_length(confirmation_note) <= 280),
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create unique index restaurant_plans_one_active_idx
  on public.restaurant_plans (user_id, restaurant_id)
  where deleted_at is null;

create table public.restaurant_visits (
  id uuid primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  visited_at date,
  date_precision text not null default 'day'
    check (date_precision in ('day', 'unknown')),
  personal_rating smallint check (personal_rating between 1 and 5),
  private_notes text,
  favorite_dishes text[] not null default '{}',
  would_return boolean,
  personal_favorite boolean not null default false,
  legacy_source_key text,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  unique (user_id, legacy_source_key)
);

alter table public.collections
  add constraint collections_id_user_unique unique (id, user_id);

create table public.collection_memberships_v3 (
  id uuid primary key,
  collection_id uuid not null,
  user_id uuid not null,
  restaurant_id uuid not null,
  position integer not null default 0 check (position >= 0),
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  foreign key (collection_id, user_id)
    references public.collections(id, user_id) on delete cascade,
  foreign key (user_id, restaurant_id)
    references public.saved_restaurant_bookmarks(user_id, restaurant_id),
  unique (collection_id, restaurant_id)
);

create table public.passport_mutation_receipts (
  user_id uuid not null references public.profiles(id) on delete cascade,
  mutation_id uuid not null,
  applied_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, mutation_id)
);
```

RLS is enabled on every new table. Own-row policies use `(select auth.uid())`; membership access also verifies ownership through `(collection_id, user_id)`. Mutation receipt rows are insert/select only for their owner. Grants mirror the existing authenticated-only personal tables.

The database mutation function accepts one or more client operations, acquires an advisory lock scoped to `user_id`, ignores already-receipted mutation IDs, checks `baseVersion`, creates the bookmark before plan/visit/membership writes, increments entity versions, writes mutation receipts, and commits atomically.

### Backward migration from V1/V2

For each legacy `UserRestaurantRecord`, use this deterministic mapping:

| Legacy evidence | V3 result |
| --- | --- |
| `saved=true` | Bookmark. |
| `wantToVisit=true` | Bookmark; no separate Want record. |
| `planned=true` | Bookmark plus active plan. |
| Any planning field is non-null/non-empty while `planned=false` | Bookmark plus active plan; preserve fields. |
| `visited=true` | Bookmark plus one visit. |
| Clearly completed visit detail exists while `visited=false` | Bookmark plus one visit. Preserve a real legacy date when present; otherwise use `visitedAt=null`, `datePrecision='unknown'`, and warning `legacy_visit_created_with_unknown_date`. Qualifying evidence includes favorite dishes, a rating, would-return, a completed-visit note, or a personal dining impression. |
| `favorite=true` with an existing migrated visit | Set `personalFavorite=true` on that visit. |
| `favorite=true` without completed-visit evidence | Bookmark with `legacyFavorite=true`; add `legacy_favorite_preserved_as_bookmark`. Do not create a visit. |
| Generic note without completed-visit evidence | Bookmark with `privateNote` populated; add `legacy_note_preserved_as_bookmark_note`. Do not create a plan or visit solely from ambiguous prose. |
| No flags and no details | Drop the meaningless row. |
| Collection member without bookmark evidence | Create bookmark, then membership. |
| Unknown restaurant slug | Preserve in migration backup, skip cloud write, and report `unknown_restaurant_slug`. |

The deterministic visit `legacySourceKey` is `passport-v2:{restaurantSlug}:{createdAt}`. Re-running migration cannot create a second legacy visit because of the cloud uniqueness constraint and the local migration key.

### Rollout sequence

1. Add V3 tables, indexes, RLS, grants, mutation RPC, and idempotent backfill function without changing the application.
2. Add an old-to-new trigger so writes to `user_restaurants` during the rollout update bookmark, plan, and the deterministic legacy visit.
3. Backfill all existing cloud users in batches and record counts before/after.
4. Run reconciliation queries: bookmark coverage, one-active-plan uniqueness, migrated visit counts, orphan memberships, unknown restaurant IDs, and RLS tests.
5. Deploy V3-capable application code behind `NEXT_PUBLIC_PASSPORT_V3_ENABLED=false`.
6. Enable for internal accounts, then a small cohort, then all users while retaining the V2 local backup.
7. Freeze legacy `user_restaurants` writes after all active deployments use V3.
8. Keep the legacy table read-only for one full release and retain an export/reconciliation script.
9. Remove old-to-new triggers and legacy application code only in a separately approved cleanup migration.

No migration in this plan drops a legacy table or local backup.

### Local-storage migration

`migratePassportStore` becomes a version router:

```ts
export function migratePassportStore(raw: unknown): PassportStoreV3 {
  const version = readNumericVersion(raw);
  if (version === 3) return sanitizeV3(raw);
  if (version === 1 || version === 2 || version === null) {
    const legacy = sanitizeLegacyStore(raw);
    return migrateLegacyStoreToV3(legacy);
  }
  return recoverKnownEntitiesOrCreateEmptyV3(raw);
}
```

Before first V3 save:

1. Write the exact raw value to `mdp-passport-v2-backup`.
2. Migrate and validate V3.
3. Write V3 under `mdp-passport`.
4. Re-read and validate the persisted V3 value.
5. Set `mdp-passport-v3-migrated` only after verification.
6. On failure, restore/read V2 backup, keep the app in recovery mode, and show export/retry actions.

### Conflict resolution and merge behavior

- Different visit IDs merge additively.
- A repeated mutation ID is a no-op success.
- Scalar edits to the same entity require `baseVersion`; a stale edit becomes a conflict response rather than silent last-write-wins.
- For visit conflicts, preserve both payloads in the local recovery log and ask the user to keep device, keep cloud, or duplicate as a second visit.
- For the active plan, a stale edit keeps the newer cloud version active and preserves the device draft for explicit review. Never create two active plans implicitly.
- Bookmark creation is monotonic except for an explicit delete mutation.
- Deletion uses `deletedAt` tombstones until every known device has synced past the approved 90-day tombstone retention window.
- Collection ordering conflicts use the latest accepted collection version; membership additions/deletions remain entity-level operations so unrelated changes merge.
- Migration warnings and conflict payloads are exportable from Account and are never sent to analytics.

### Offline and error recovery

- Every command commits the local entity changes and outbox mutation in one `setStore` transaction.
- Offline mutations remain usable immediately and display “Saved on this device · Pending sync.”
- Retry on `online`, app focus, successful auth refresh, and exponential backoff at 2s, 5s, 15s, 60s, then 5 minutes.
- After five failed attempts, status becomes `failed`; background retry continues on later online/focus events and an explicit Retry button appears.
- Authentication/authorization failures pause the queue and ask the user to sign in again.
- Validation conflicts do not retry automatically; they open the recovery UI.
- Provider/network 5xx and timeouts retry; 4xx validation failures do not.
- A queue is removed only after the server acknowledges the mutation receipt.
- UI copy says “Synced” only when the outbox is empty and the last pull succeeded.

## 5. Restaurant media architecture

### Exact media contract

```ts
export type RestaurantMediaSourceType =
  | "official_restaurant"
  | "licensed_provider"
  | "curated_fallback";

export type RestaurantMediaUsageBasis =
  | "owned"
  | "written_permission"
  | "provider_license"
  | "stock_license"
  | "creative_commons";

export type RestaurantMediaRole = "hero" | "gallery" | "card";

export type RestaurantMediaVariantName =
  | "thumbnail"
  | "card"
  | "hero"
  | "gallery";

export type RestaurantMediaVariant = {
  name: RestaurantMediaVariantName;
  storageObjectPath: string;
  publicUrl: string;
  width: number;
  height: number;
  byteSize: number;
  format: "avif" | "webp" | "jpeg";
};

export type RestaurantMediaAsset = {
  id: string;
  restaurantSlug: string;
  storageObjectPath: string | null;
  remoteAssetUrl: string | null;
  sourceType: RestaurantMediaSourceType;
  sourcePageUrl: string;
  credit: string | null;
  usageBasis: RestaurantMediaUsageBasis;
  licenseReference: string;
  altText: string;
  width: number;
  height: number;
  focalPoint: { x: number; y: number }; // normalized 0...1
  roles: RestaurantMediaRole[];
  galleryOrder: number;
  verifiedAt: string;
  verifiedBy: string;
  rightsExpiresAt: string | null;
  active: boolean;
  representative: boolean;
  variants: RestaurantMediaVariant[];
};
```

Database checks require exactly one of `storage_object_path` and `remote_asset_url`, positive intrinsic dimensions, focal coordinates from 0 through 1, HTTPS source pages, non-empty license reference, non-empty alt text, and `representative=true` for every curated fallback.

### Resolution order

```ts
const SOURCE_PRIORITY: Record<RestaurantMediaSourceType, number> = {
  official_restaurant: 1,
  licensed_provider: 2,
  curated_fallback: 3,
};
```

The resolver filters inactive/expired assets, filters by requested role, sorts by source priority then gallery order, and returns the first usable asset. If image loading fails, it advances through the remaining verified candidates. If none load, `RestaurantFallback` renders initials. Google Places photo data never enters this resolver.

### Storage strategy

- Create public Supabase Storage bucket `restaurant-media` for assets Dining Passport is permitted to redistribute.
- Object path: `{restaurantSlug}/{assetId}/{sha256}.{ext}`.
- Store one archival-quality JPEG/PNG/WebP source per asset and generate immutable thumbnail, card, hero, and gallery/full-size variants during ingestion.
- The registry stores each variant's URL/path, format, byte size, width, and height. Page requests select an existing variant and do not depend on paid Supabase runtime transformations in V1.
- Proposed maximum V1 variant boxes are 320×240 thumbnail, 960×720 card, 1920×1080 hero, and 2400px-long-edge gallery. The ingestion worker preserves aspect ratio, applies the approved focal crop only for fixed-ratio variants, never upscales, and records actual output dimensions.
- Keep license evidence in a private `restaurant-media-rights` bucket; only admins can read it.
- Remote provider delivery is allowed only when the provider license forbids copying and permits hotlink/CDN use. `next.config.ts` must list that exact hostname/path with a narrow `remotePatterns` entry.
- Do not store binary data in Postgres or in `data/restaurants.json`.

### Ingestion and verification workflow

1. Create an intake record with restaurant slug, source type, source page, candidate asset, proposed credit, usage basis, and license reference.
2. A human verifies restaurant identity, image ownership/license, allowed surfaces, expiration, and required attribution.
3. Download/store only when the verified license permits redistribution.
4. Strip unneeded metadata, normalize color orientation, reject files under 1200px on the long edge for hero use, and compute SHA-256 to prevent duplicates.
5. Generate thumbnail, card, hero, and gallery/full-size variants during ingestion and record their exact dimensions, format, byte size, and storage URLs.
6. Run automated validation for required source URL, usage basis/license reference, credit requirement, verification date, dimensions, focal point, alt text, gallery order, active status, duplicate hash, and variant completeness.
7. The accountable reviewer activates a clearly documented asset. Unclear, high-risk, expired, contradictory, or insufficiently documented rights evidence is escalated for additional manual review; a second approver is not mandatory for routine V1 assets.
8. Re-verify expiring/provider assets at least annually; automatically deactivate expired records.
9. Keep an immutable audit record for activation, deactivation, and rights changes.

### Next.js image implications

- Replace the raw `<img>` in `src/components/stitch/restaurant/RestaurantMedia.tsx` with `next/image`, pointing it at an ingestion-generated variant.
- Provide intrinsic `width` and `height` from the media record or use `fill` inside an aspect-ratio parent.
- Add only the Supabase project storage hostname and any specifically approved provider CDN to `images.remotePatterns`.
- Set `sizes` per surface: card `(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw`; detail hero `(max-width: 1024px) 100vw, 60vw`; map preview `(max-width: 1024px) 100vw, 360px`.
- Use `priority`/preload only for the above-the-fold detail hero and homepage lead image.
- Do not configure a wildcard hostname or accept arbitrary query-string URLs.
- Cache versioned storage objects for one year with immutable filenames; activation changes select a new record/path rather than replacing binary content in place.

### Responsive, loading, failure, and gallery behavior

- Reserve the final aspect ratio before load to prevent layout shift.
- Use a generated dominant-color or blur placeholder only when produced during ingestion; never fake blur data from an unrelated image.
- On failure, try the next resolved verified asset, then curated fallback, then initials.
- Loading skeletons are `aria-hidden`; the final image supplies the approved alt text.
- Decorative repeated card images use empty alt text when the restaurant name is already the adjacent link. Detail hero/gallery images use descriptive alt text.
- Detail gallery opens in the accessible shared Dialog, supports previous/next keyboard controls, announces “Image N of M,” traps focus, restores focus, and shows credit/source attribution.
- Representative fallback images display “Representative image” in the detail/gallery caption. Card versions may use empty alt text but must never use restaurant-specific photo wording.
- Do not render an empty carousel when only one image exists.

### Attribution treatment

- Credits appear in the detail gallery caption and on `/source-information#media`.
- When a provider requires on-image credit, render it as persistent text with sufficient contrast; do not hide it behind hover.
- The database stores exact credit copy and source page separately from consumer alt text.
- Deactivated/expired images disappear from public resolution but remain in the rights audit.

### Ten-restaurant pilot

The pilot deliberately spans regions, cuisines, star levels, card/detail/map surfaces, long and short names, and official/provider availability:

1. `addison-san-diego-ca`
2. `alinea-chicago-il`
3. `atelier-crenn-san-francisco-ca`
4. `benu-san-francisco-ca`
5. `le-bernardin-new-york-ny`
6. `singlethread-healdsburg-ca`
7. `kasama-chicago-il`
8. `elcielo-miami-miami-fl`
9. `kato-los-angeles-ca`
10. `the-inn-at-little-washington-washington-dc`

Pilot acceptance requires a documented usage basis for every asset, complete automated metadata validation, manual escalation for uncertain/high-risk assets, zero Google/Michelin extraction, correct attribution, complete ingestion-time variants for every active asset, desktop/mobile visual checks, and intentional initials fallback for any restaurant that lacks an approved asset. The pilot may finish with fewer than ten photos; it must finish with ten verified media decisions.

### Remaining catalog

Process restaurants in batches prioritized by homepage features, traffic, three-star detail pages, and then alphabetical catalog coverage. Publish a coverage report with counts by source type and intentional fallback. Never measure success as “271 image URLs”; measure it as verified decisions, active licensed assets, expired assets, and honest fallbacks.

## 6. Shared application shell specification

### Canonical desktop header

- Sticky 72px header with one Dining Passport home link.
- Primary routes: Explore, Map, Michelin Stars, Passport.
- Route-family activity:
  - Explore is active for `/explore`, `/restaurants/*`, `/usa/*`, `/cities/*`, `/cuisines/*`, and `/stars/*`.
  - Map is active only for `/map`.
  - Michelin Stars is active for `/about-michelin-stars`.
  - Passport is active for `/passport`, `/saved`, `/planned`, `/visited`, and `/collections/*`.
- Search is a labeled icon control that navigates to `/explore?focus=search`; Explore owns the catalog and focus behavior.
- Signed out: visible Sign in link retaining a safe `next` path.
- Signed in: account trigger with name/email fallback, menu items Account, Passport, and Sign out.
- Account menu supports Arrow Up/Down, Home/End, Escape, outside pointer close, initial focus on first item, and trigger focus restoration.

### Canonical mobile header and navigation

- Wordmark, search control, and menu button in the same 72px header.
- One right-side modal drawer contains primary navigation plus Account/Sign in.
- Drawer uses the same route-family active state as desktop.
- Search is not duplicated inside the drawer.
- Menu closes on navigation, Escape, backdrop click, and viewport transition to desktop.
- Background becomes inert, body scroll is locked, focus starts on Close, Tab is trapped, and focus returns to Menu.

### Authentication-shell exception

- `/login`, `/signup`, `/forgot-password`, and `/reset-password` keep the current dedicated form-first shell.
- No global header or footer is mounted on auth routes.
- The Dining Passport wordmark remains a home link.
- The “Continue with device-only Passport” path remains available.

### Map-route shell

- Global header remains.
- Footer is omitted.
- Main/shell height is exactly `calc(100dvh - var(--dp-header-height))`.
- Document overflow is hidden on desktop map; the results list owns vertical scrolling.
- Mobile map uses the same bounded viewport with safe-area-aware bottom sheet.

### Simplified footer

Required copy:

> Dining Passport
>
> Discover Michelin-starred restaurants, plan future visits, and remember the meals you loved.
>
> Dining Passport is an independent discovery platform and is not affiliated with the Michelin Guide.

Footer links:

- About → `/about`
- Privacy → `/privacy`
- Terms → `/terms`
- Contact → `/contact`
- Source information → `/source-information`

The footer does not repeat primary navigation, account navigation, restaurant totals, dates, dataset/roster/import language, coverage notes, or a second disclaimer.

### Destination responsibilities

- `/about`: product purpose and independence.
- `/privacy`: local storage, cloud synchronization, private notes, deletion choices, analytics, and provider boundaries.
- `/terms`: user responsibilities, external links, reservation limitations, and intellectual property.
- `/contact`: support/correction channel without exposing developer language.
- `/source-information`: Michelin distinction sourcing, roster coverage methodology, map/geocode coverage, media credits/licensing, Google UI Kit boundary, and last substantive source update.

## 7. Shared primitive and accessibility specification

### Dialog

`Dialog` gains:

```ts
type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  initialFocusRef?: RefObject<HTMLElement | null>;
  returnFocusRef?: RefObject<HTMLElement | null>;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  children: ReactNode;
  footer?: ReactNode;
};
```

Required behavior:

- Render through a portal so it is not clipped by route overflow.
- Focus the supplied initial target, otherwise first focusable element, otherwise the dialog panel.
- Trap forward and reverse Tab.
- Escape closes only when enabled and never while a destructive submit is pending.
- Apply `inert` and `aria-hidden` to application siblings while open.
- Restore focus to the supplied trigger or the previously focused element.
- Use `aria-labelledby` and optional `aria-describedby`.
- Prevent nested dialogs; drawers and dialogs share one overlay manager.

### Drawer

Drawer adopts the same overlay manager, inertness, nested-overlay rule, pending-close rule, and focusable-element utility as Dialog. Mobile navigation, filters, and any future collection drawer use this one implementation.

### Fields and errors

- Inputs use a real `<label for>`, stable input ID, error ID, and hint ID.
- `aria-describedby` references every rendered hint/error.
- `aria-invalid=true` appears only on invalid fields.
- Submit-level errors use `role=alert`; status/success messages use `role=status`.
- On failed submit, focus moves to the first invalid field or the error summary.
- Textareas and selects receive the same field wrapper rather than hand-built labels.

### Pending and failure states

- Buttons expose `aria-busy` and retain a stable accessible name while visible copy changes to an ellipsis form.
- Disable only controls that would create duplicate/conflicting requests; keep Cancel available unless closing would corrupt a mutation.
- Optimistic Passport writes visibly distinguish “Saved on device,” “Pending sync,” “Synced,” and “Sync failed.”
- Failure messages contain a recovery action and do not disappear solely because the route changed.

### Icon-only controls

- Every icon-only button/link has an explicit accessible name and at least a 44×44px target.
- Active toggles use `aria-pressed`; disclosure controls use `aria-expanded`; menu triggers use `aria-haspopup`.
- Decorative SVGs are `aria-hidden`.
- Tooltips supplement but never replace accessible names.

### Accessibility baseline

- One H1 per route.
- Skip link targets focusable main content.
- Visible focus is never removed.
- Reduced motion disables map fly/fit animation, drawer motion, and gallery transitions.
- Color is not the sole carrier of saved/planned/visited/sync/error meaning.
- Automated checks cover keyboard-only completion, landmarks, labels, modal focus, error association, and 200% zoom at the seven reference widths.

## 8. Data and performance architecture

### Passport provider boundary

The provider needs only:

- V3 personal entities keyed by restaurant slug/record ID.
- Command functions.
- Authentication mode/user ID.
- Durable outbox and sync state.
- Lightweight derived counts that do not require restaurant metadata.

It must not receive `Restaurant[]`. Remove `getRestaurants()` from `src/app/layout.tsx` and remove the `restaurants` prop from `PassportClientShell` and `PassportProvider`.

### Server/client boundaries

- Root layout remains a Server Component for metadata, user verification, fonts, and static shell.
- The Passport provider is a deep Client Component around children but serializes no catalog.
- Public restaurant search/filter/detail data is loaded in route Server Components.
- Interactive save/plan/visit controls consume identifier-based personal state only.
- Anonymous local Passport list/collection routes hydrate restaurant summaries after the provider exposes slugs, through a bounded route handler request.
- Signed-in list/collection pages may load personal IDs and joined published restaurant summaries on the server, then reconcile with any pending local outbox.

### Route data loading

| Route | Data boundary |
| --- | --- |
| Homepage | Server selects configured featured slugs and resolved media only. |
| Explore | Server parses URL filters, returns one 24-item page plus facets and total; filter changes navigate through URL. |
| Map | Server returns a map-specific DTO for 271 restaurants with only slug/name/stars/cuisine/location, approved coordinates, and location-pending flag. |
| Restaurant detail | Server loads one restaurant, its active media, reservation, approved geocode, and bounded related/nearby summaries. |
| Passport lists | Client sends only local slugs; `/api/restaurants/summaries?slugs=` returns a capped list. Cloud users use server joins where available. |
| Collection detail | Same summary endpoint for local mode; collection-owned join for cloud mode. |
| Header/search | No restaurant data. Search navigates to Explore. |

The summaries endpoint accepts at most 100 unique validated slugs per request, preserves input order, returns published fields only, and never accepts arbitrary field selection.

### Cache behavior

- Canonical JSON reads remain server-only/module-cached.
- Database-backed public restaurant/media selectors use Next.js 16 `use cache` with tags `restaurants`, `restaurant:{slug}`, and `restaurant-media:{slug}`.
- Explore query results may use tagged server caching because they contain no personal state.
- User Passport records, outbox, account, and sync status are uncached and authenticated.
- Media objects use content-hash filenames and immutable browser/CDN caching.
- Mutation success invalidates only the user-owned client state; it does not invalidate public restaurant caches.

### Explore pagination

- Preserve the current 24-item page size.
- Do not serialize all 271 items into a client grid.
- URL owns `q`, facets, sort, view, and page.
- Pagination links are real links and prefetch only adjacent pages.
- Mobile infinite scrolling is not introduced in Stage 1.

### Cloud synchronization recommendation

Recommended behavior combines all four candidate behaviors:

- Retry automatically for transient failures.
- Queue locally so user work is not lost.
- Show Pending sync whenever the queue is non-empty/offline.
- Require explicit retry/resolution only after retries are exhausted or a conflict/validation error occurs.

This is preferable to rollback because private notes and visit history are more important than immediate cross-device consistency. It is preferable to silent fire-and-forget because current `void upsertCloud*` calls discard failures. It is preferable to explicit retry-only because mobile/offline transitions are common and most transient failures recover without user work.

## 9. Map diagnosis, recommendation, and partial-data behavior

### Renderer and provider

Keep `maplibre-gl`, `react-map-gl/maplibre`, current GeoJSON clustering, selected-marker layer, and URL-based search-area state.

Approved initial production provider: MapTiler Cloud.

- Configure a dedicated domain-restricted browser key.
- Set an explicit versioned style URL such as MapTiler Streets v4.
- Store the key/configuration in deployment environment variables.
- Do not silently fall back to demo tiles in production.
- Display the provider’s required attribution and logo according to the selected plan, plus OpenStreetMap contributors.
- Add usage monitoring and budget alerts before public launch.
- Resolve provider configuration through a small adapter so style URL, attribution, capability flags, and failure classification are not hard-coded to MapTiler inside map components.

Configuration contract:

```dotenv
NEXT_PUBLIC_MAP_PROVIDER_NAME=MapTiler
NEXT_PUBLIC_MAP_STYLE_URL=https://api.maptiler.com/maps/streets-v4/style.json?key=DOMAIN_RESTRICTED_BROWSER_KEY
NEXT_PUBLIC_MAP_ATTRIBUTION=© OpenStreetMap contributors
```

`NEXT_PUBLIC_MAP_STYLE_URL` is intentionally browser-visible and therefore must contain only a domain-restricted browser key, never an admin/service token. Deployment configuration supplies the real value; `.env.example` uses a clearly nonfunctional example.

Official references consulted:

- Bundled Next.js 16 guides: `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`, `06-fetching-data.md`, `08-caching.md`, and `12-images.md`.
- [MapLibre setup guidance](https://maplibre.org/maplibre-react-native/docs/setup/getting-started/) distinguishes demo tiles from production styles/tiles.
- [MapTiler’s MapLibre example](https://docs.maptiler.com/maplibre/examples/how-to-use-maplibre/) documents the compatible style URL.
- [MapTiler attribution guidance](https://docs.maptiler.com/sdk-js/examples/switch-from-maplibre/) documents plan-dependent logo treatment.
- [MapTiler pricing](https://www.maptiler.com/cloud/pricing/) must be reviewed to select the launch budget and alert thresholds before production traffic is enabled.

Alternatives considered:

- Stadia Maps: also MapLibre-compatible and viable; not preferred initially because the current evidence and documentation path is simplest with MapTiler.
- Self-hosted PMTiles/Protomaps: strongest cost/control at scale, but adds tile build, hosting, update, and observability work that is not justified for 271 restaurants.
- Google Maps/Mapbox replacement: rejected at Stage 1 because the current renderer, clustering, selection, and area-search logic work; the verified defect is CSS sizing.

### Layout correction

- Give the map route main element an explicit viewport height and `overflow:hidden`.
- Remove conflicting `flex-1`/percentage-height chains from `MapWorkspaceShell`.
- Desktop layout is a two-column grid: collapsible 360–420px results panel plus `minmax(0, 1fr)` map.
- Results panel body uses `min-height:0; overflow-y:auto`; header/selected preview remain sticky inside the panel.
- At 1024px and above, panel is desktop/collapsible.
- Below 1024px, map/list is a mode switch and selected restaurant is a bottom sheet.
- Add a Playwright assertion that map stage height equals viewport height minus header within 1px and document scroll height equals viewport height.

### Map behavior

- Clusters retain the current GeoJSON source, radius 50, and expansion zoom.
- Selected marker remains visually distinct and is paired with a selected restaurant preview.
- Selecting a list row flies only when approved coordinates exist; location-pending rows open detail without camera movement.
- Search this area appears only after a user-originated pan/zoom, not initial fit, selection fly, resize, or reset.
- Search-area bounds stay in the URL. Clearing area restores the filtered national fit.
- Desktop panel collapse preserves filters and selection.
- Mobile bottom sheet supports peek and expanded states, focusable controls, safe-area padding, and does not claim `aria-modal=true`.

### The 75 restaurants without approved geocodes

- Show `196 mapped · 75 locations pending` at the unfiltered national view.
- Keep all 271 in the results list unless an area bounds filter is active.
- Mark pending rows “Location pending” and disable/fallback map-focus controls.
- Area-search results explain that restaurants without approved coordinates are excluded from the geographic count.
- Never plot unapproved, uncertain, or fallback coordinates.
- Maintain the existing manual geocode review/override workflow and publish the coverage count on `/source-information`.

### Failure states

- Missing production map env: render list plus “Map configuration unavailable” and log a server configuration error without exposing secrets.
- Style/TileJSON failure: keep list, attribution, filters, and retry map action.
- Partial tile failure: keep last rendered map, show non-blocking degraded message, and avoid declaring the entire map unavailable after one tile 404.
- WebGL unavailable/context lost: replace canvas with list-first message and retry/reload guidance.
- Zero approved coordinates after filters: show empty map state while preserving location-pending list results.
- Container height below 320px: do not initialize until `ResizeObserver` reports a usable size.
- Initialization timing: call `map.resize()` after panel collapse/expand, font load, and sheet/layout transitions.

## 10. Testing plan

### Journey migration matrix

| Case | Expected bookmark | Expected plan | Expected visits | Warning |
| --- | ---: | ---: | ---: | --- |
| Empty legacy row | 0 | 0 | 0 | None |
| Saved only | 1 | 0 | 0 | None |
| Want only | 1 | 0 | 0 | None |
| Planned only | 1 | 1 | 0 | None |
| Plan fields, planned false | 1 | 1 | 0 | None |
| Visited only | 1 | 0 | 1 | None |
| Visit-specific details, visited false | 1 | 0 | 1 | Unknown-date warning when no real date exists |
| Favorite + visited | 1 | 0 | 1 favorite | None |
| Favorite only | 1 with `legacyFavorite` provenance | 0 | 0 | Favorite-preserved warning |
| Generic note only | 1 with private note | 0 | 0 | Ambiguous-note warning |
| Planned + visited | 1 | 1 | 1 | None |
| Collection-only member | 1 | As legacy evidence | As legacy evidence | None |
| Unknown slug | 0 cloud | 0 cloud | 0 cloud | Unknown-slug warning and backup |
| Migration rerun | Unchanged | Unchanged | No duplicate legacy visit | None |

### Domain tests

- Planning creates one bookmark and one active plan atomically.
- Recording two visits creates two IDs and one bookmark.
- Adding to a collection creates a bookmark before membership.
- Removing a plan preserves visits/bookmark/membership.
- Removing one visit preserves other visits and plan.
- Removing last visit changes derived Visited to false.
- Plain bookmark removal deletes memberships.
- Bookmark removal with plan/visits returns `bookmark_has_dependents`.
- Confirmed remove-from-Passport tombstones all dependents in one command.
- Favorite/would-return fields never appear on bookmark or plan types.
- Favorite-only migration does not create a visit; it preserves internal bookmark provenance.
- An undated visit is created only from clearly completed-visit evidence and displays “Visited · Date not recorded.”
- Generic notes do not create visits or plans and are preserved as private bookmark notes.
- Migration never fabricates a date.
- Metrics count distinct restaurants separately from total visit records.

### Sync tests

- Offline command survives reload and shows Pending sync.
- Reconnect flushes the queue in dependency order.
- Duplicate mutation ID is acknowledged once.
- Server 500 retries with the defined schedule.
- Auth 401 pauses and asks for sign-in.
- Validation 400 does not loop.
- Version conflict preserves both drafts and opens recovery.
- Queue item is retained until mutation receipt is returned.
- UI never shows Synced with a non-empty outbox.
- Account deletion with local-clear unchecked writes current snapshot locally.
- Account deletion with local-clear checked clears only after cloud success.
- Failed account deletion never clears local storage.

### Media tests and acceptance criteria

- Database rejects missing source page, license reference, alt text, dimensions, or invalid focal points.
- Resolver order is official → licensed → curated → initials.
- Inactive/expired media is skipped.
- Broken official media advances to licensed/curated/initials.
- Google/Michelin photo fields are absent from the media contract and ingestion paths.
- `next/image` receives dimensions/fill and accurate `sizes`.
- Every active media asset has ingestion-generated thumbnail, card, hero, and gallery variants with validated dimensions.
- V1 page requests do not invoke paid Supabase runtime image transformations.
- Card images do not duplicate accessible restaurant names.
- Gallery traps/restores focus and announces position.
- Representative image label appears where required.
- Ten pilot decisions have verification evidence, automated metadata validation, and manual escalation for uncertain/high-risk rights.
- 271-card test does not require 271 photos and intentional fallback remains valid.

### Shell/accessibility tests

- Route-family `aria-current` works on detail, taxonomy, list, and collection routes.
- Search navigation focuses Explore search without loading header catalog data.
- Signed-in account menu keyboard model and focus restoration work.
- Mobile drawer traps focus, makes background inert, closes on Escape/navigation, and restores Menu focus.
- Dialog initial focus, Tab wrap, Escape, background inertness, and trigger restoration work.
- Field errors are associated and focus moves to first invalid field.
- Pending controls expose busy state without losing accessible name.
- Auth routes have no global banner/contentinfo.
- Map has header and no footer; standard routes have exactly one footer.
- Footer contains exact approved copy and five destinations only.

### Data/performance tests

- Root RSC/HTML does not contain a known catalog tail slug on Homepage/Login.
- `src/app/layout.tsx` does not import `getRestaurants`.
- Explore returns no more than 24 restaurant cards per page.
- Summary endpoint rejects over 100 slugs and unknown fields.
- Detail route loads one primary restaurant plus bounded related/nearby DTOs.
- Map DTO omits website, guide URL, notes, media rights, and other unused fields.
- Client bundle analysis confirms restaurant JSON is not imported through the Passport provider graph.
- 375px Explore has no horizontal overflow.

### Map tests

- Development and production configured style requests succeed.
- Production without style configuration renders list-first failure and never requests demo tiles.
- WebGL available path creates one canvas.
- WebGL unavailable path preserves result list.
- Map stage is viewport-minus-header at every reference width.
- Desktop document has no 32,000px map scroll.
- Panel collapses/expands and calls map resize.
- Clusters expand; selected marker/preview agree.
- Search this area appears only after user camera movement.
- 196/75 coverage copy matches approved geocode fixtures.
- Bounds filtering excludes pending coordinates and explains the exclusion.
- Tile 404 does not destroy the entire map; style/TileJSON fatal failure does.

### Verification commands for implementation

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
npm run data:validate
npm run data:validate-geocodes
npm run supabase:rls:validate
```

Expected result: every command exits 0; Playwright includes all seven widths and the map height/overflow regression.

## 11. Ordered implementation tasks

Implementation must use TDD, remain behind a Passport V3 feature flag until migration reconciliation passes, and stop for review after each task.

### Task 1: Lock V3 domain contracts and migration fixtures

**Files**

- Create: `src/lib/passport-v3/types.ts`
- Create: `src/lib/passport-v3/derive.ts`
- Create: `src/lib/passport-v3/migrate.ts`
- Create: `scripts/test_passport_v3_migration.mjs`
- Modify: `package.json`

**Produces**

- The exact V3 types and `deriveJourneyState`.
- `migrateLegacyStoreToV3` implementing the migration table in Section 4.
- Deterministic legacy visit keys and migration warnings.

**Steps**

- [ ] Write fixture tests for every row in the migration matrix and verify they fail because V3 modules do not exist.
- [ ] Implement sanitizers, deterministic migration, and derived state without changing the current provider.
- [ ] Run `node --test scripts/test_passport_v3_migration.mjs`; expect all migration cases to pass.
- [ ] Run `npm run typecheck`; expect exit 0.
- [ ] Review serialized V3 fixtures and confirm no Want or restaurant-level Favorite field exists.
- [ ] After task review and implementation authorization, commit as `feat: define passport v3 domain`.

### Task 2: Add cloud V3 schema, RLS, and idempotent backfill

**Files**

- Create: `supabase/migrations/20260718000009_passport_v3.sql`
- Create: `supabase/tests/passport_v3.test.sql`
- Modify: `scripts/validate_rls.mjs`
- Regenerate: `src/lib/supabase/database.types.ts`

**Produces**

- Tables, constraints, RLS, mutation receipts/RPC, old-to-new trigger, and idempotent backfill from Section 4.

**Steps**

- [ ] Write pgTAP failures for ownership, collection-bookmark FK, one active plan, duplicate mutation receipt, auto-save transaction, and idempotent backfill.
- [ ] Add schema/RLS/RPC/backfill with no legacy drop.
- [ ] Run local database reset and pgTAP suite; expect all assertions to pass.
- [ ] Run backfill twice and verify counts are unchanged after the second run.
- [ ] Regenerate types and run `npm run typecheck`.
- [ ] After task review and implementation authorization, commit as `feat: add passport v3 database schema`.

### Task 3: Implement local commands and durable outbox

**Files**

- Create: `src/lib/passport-v3/store.ts`
- Create: `src/lib/passport-v3/commands.ts`
- Create: `src/lib/passport-v3/outbox.ts`
- Create: `src/lib/passport-v3/recovery.ts`
- Create: `scripts/test_passport_v3_commands.mjs`
- Create: `scripts/test_passport_v3_outbox.mjs`

**Produces**

- All command signatures in Section 3.
- Atomic local entity/outbox updates and retry classification.

**Steps**

- [ ] Write failing command-invariant and retry-schedule tests.
- [ ] Implement bookmark-first command composition, dependency-aware removal, tombstones, and outbox persistence.
- [ ] Implement retryable/non-retryable error classification and exact backoff schedule.
- [ ] Run both Node test files; expect all cases to pass.
- [ ] Corrupt a fixture intentionally and verify recovery preserves the backup and exposes an exportable warning.
- [ ] After task review and implementation authorization, commit as `feat: add passport v3 local commands`.

### Task 4: Replace fire-and-forget cloud repository behavior

**Files**

- Create: `src/app/passport-v3/actions.ts`
- Create: `src/lib/personal-data/v3-cloud-repository.ts`
- Create: `src/lib/personal-data/sync-controller.ts`
- Create: `src/lib/passport-v3/PassportProvider.tsx`
- Modify: `src/lib/passport/PassportProvider.tsx` to expose the feature-flagged compatibility boundary only
- Modify: `src/components/stitch/passport/PassportSyncNotice.tsx`
- Modify: `src/components/stitch/account/PassportSyncSection.tsx`

**Produces**

- Mutation receipt acknowledgements, pending/failed state, automatic retry, explicit Retry, and conflict recovery.

**Steps**

- [ ] Add tests proving a rejected server action remains queued and never reports Synced.
- [ ] Implement batch mutation action through the database RPC.
- [ ] Implement online/focus/auth retry triggers and queue acknowledgement.
- [ ] Implement pending/offline/failed UI copy and recovery action.
- [ ] Run sync tests with offline and 500/401/409 mocks; expect no silent completion.
- [ ] After task review and implementation authorization, commit as `feat: add durable passport sync`.

### Task 5: Remove catalog data from the global Passport provider

**Files**

- Modify: `src/app/layout.tsx`
- Modify: `src/components/passport/PassportClientShell.tsx`
- Modify: `src/lib/passport/PassportProvider.tsx`
- Modify: `src/lib/passport-v3/PassportProvider.tsx`
- Create: `src/app/api/restaurants/summaries/route.ts`
- Create: `src/lib/data/restaurant-summaries.ts`
- Modify: `src/components/stitch/passport/PassportPageView.tsx`
- Modify: `src/components/stitch/passport/PassportListPage.tsx`
- Modify: `src/components/stitch/collections/CollectionsPageView.tsx`
- Modify: `src/components/stitch/collections/CollectionDetailView.tsx`

**Produces**

- Identifier-only provider and bounded restaurant-summary hydration.

**Steps**

- [ ] Add a failing test that detects a catalog tail slug in root-route RSC/HTML.
- [ ] Remove the `restaurants` prop/import from the root/provider graph.
- [ ] Add the capped summaries endpoint and local-mode hydration.
- [ ] Use server joins for signed-in personal routes where available.
- [ ] Run build/bundle and route tests; confirm root serialization no longer contains the catalog.
- [ ] After task review and implementation authorization, commit as `perf: scope restaurant data by route`.

### Task 6: Replace journey UI and add multiple-visit flows

**Files**

- Replace: `src/components/stitch/restaurant-detail/JourneyControls.tsx`
- Modify: `src/components/stitch/restaurant-detail/RestaurantJourneySection.tsx`
- Modify: `src/components/stitch/restaurant-detail/PlanningDetailsDialog.tsx`
- Replace: `src/components/stitch/restaurant-detail/VisitDetailsDialog.tsx`
- Create: `src/components/stitch/restaurant-detail/VisitHistoryDialog.tsx`
- Modify: Passport cards/rows/adapters under `src/components/stitch/passport/`
- Modify: `e2e/passport.spec.ts`

**Produces**

- Save, Plan, Record visit, visit history, visit-level favorite/would-return, and simultaneous planned/visited presentation.

**Steps**

- [ ] Rewrite e2e expectations to remove Want and top-level Favorite and to require plan/visit auto-save.
- [ ] Implement record-derived controls with one Save action plus independent Plan and Visit actions.
- [ ] Implement new-visit creation and edit-by-visit-ID.
- [ ] Add dependency-aware remove-from-Passport confirmation.
- [ ] Run Passport e2e tests across desktop/mobile; expect multiple visits and coexisting plan/visited state.
- [ ] After task review and implementation authorization, commit as `feat: replace passport journey controls`.

### Task 7: Enforce collection membership invariants

**Files**

- Modify: `src/components/stitch/collections/AddRestaurantsDialog.tsx`
- Modify: `src/components/stitch/collections/adapters.ts`
- Modify: `src/components/stitch/collections/CollectionDetailView.tsx`
- Modify: `src/components/stitch/collections/CollectionRestaurantList.tsx`
- Modify: `src/components/stitch/collections/CollectionRestaurantRow.tsx`
- Modify: `src/components/stitch/collections/CollectionsPageView.tsx`
- Modify: `e2e/collections.spec.ts`

**Produces**

- Add-to-collection auto-save, bookmark-backed membership, and collection cleanup on bookmark removal.

**Steps**

- [ ] Add failing tests for collection-only add, bookmark removal, plan/visit preservation, and membership ordering.
- [ ] Route all membership changes through V3 commands.
- [ ] Remove copy claiming collection addition does not change Saved.
- [ ] Run collection e2e and database FK tests.
- [ ] After task review and implementation authorization, commit as `feat: enforce saved collection members`.

### Task 8: Add media schema, storage policy, resolver, and admin workflow

**Files**

- Create: `supabase/migrations/20260718000010_restaurant_media.sql`
- Create: `src/lib/media/types.ts`
- Create: `src/lib/media/resolve.ts`
- Create: `src/lib/media/ingestion.ts`
- Create: `scripts/validate_restaurant_media.mjs`
- Modify: `next.config.ts`
- Regenerate: `src/lib/supabase/database.types.ts`

**Produces**

- Exact media/variant contracts, rights checks, narrow image config, ingestion-time variant generation, and source-priority resolver.

**Steps**

- [ ] Write failing database/Node tests for contract validation, variant completeness, expiration, ordering, and forbidden sources.
- [ ] Add media, media-variant, rights-audit tables, and Storage policies.
- [ ] Add an idempotent ingestion worker that generates thumbnail, card, hero, and gallery/full-size variants and records their actual dimensions, format, byte size, and immutable URL.
- [ ] Implement resolver and validation report.
- [ ] Configure exact remote patterns only after storage/provider hostnames are approved.
- [ ] Run media validation with an empty catalog; initials fallback must remain a valid pass state.
- [ ] After task review and implementation authorization, commit as `feat: add verified restaurant media contract`.

### Task 9: Complete the ten-restaurant verified pilot

**Files**

- Create: `data/media/restaurant-media-pilot.json`
- Create: `docs/media/pilot-verification-report.md`
- Modify: `src/components/stitch/restaurant/RestaurantMedia.tsx`
- Modify: `src/components/stitch/restaurant/adapters.ts`
- Modify: `src/components/stitch/home/adapters.ts`
- Modify: `src/components/stitch/explore/adapters.ts`
- Modify: `src/components/stitch/map/adapters.ts`
- Modify: `src/components/stitch/restaurant-detail/adapters.ts`
- Modify: `e2e/restaurant-presentation.spec.ts`
- Modify: `e2e/restaurant-detail.spec.ts`
- Modify: `e2e/homepage.spec.ts`
- Modify: `e2e/explore.spec.ts`

**Produces**

- Ten verified media decisions and any legally usable active assets, without fake coverage.

**Steps**

- [ ] Verify source/rights for each pilot slug and record approve/reject/fallback decision.
- [ ] Ingest only approved redistributable assets.
- [ ] Run automated metadata validation, generate all four V1 variants for every active asset, and manually escalate uncertain/high-risk evidence.
- [ ] Replace raw `<img>` with `next/image` and focal-point rendering.
- [ ] Add gallery credit/representative treatment and failure cascade.
- [ ] Capture pilot surfaces at all reference widths and publish the coverage report.
- [ ] After task review and implementation authorization, commit as `feat: add verified restaurant media pilot`.

### Task 10: Consolidate shell, footer, destinations, and primitives

**Files**

- Modify: `src/components/shell/AppChrome.tsx`
- Modify: `src/components/shell/AppHeaderClient.tsx`
- Modify: `src/components/shell/SiteFooter.tsx`
- Modify: `src/config/navigation.ts`
- Modify: `src/config/site.ts`
- Create: `src/app/about/page.tsx`
- Create: `src/app/privacy/page.tsx`
- Create: `src/app/terms/page.tsx`
- Create: `src/app/contact/page.tsx`
- Create: `src/app/source-information/page.tsx`
- Modify: `src/components/stitch/Dialog.tsx`
- Modify: `src/components/stitch/Drawer.tsx`
- Modify: `src/components/stitch/Input.tsx`
- Create: `src/components/stitch/Field.tsx`
- Create: `src/components/stitch/Textarea.tsx`
- Modify: `src/components/stitch/Select.tsx`
- Modify: `src/components/stitch/Button.tsx`
- Modify: `src/components/stitch/IconButton.tsx`
- Modify: `e2e/shell.spec.ts`

**Produces**

- One canonical shell, exact footer copy, route-family activity, accessible overlays/fields, and required destinations.

**Steps**

- [ ] Add failing shell, footer-copy, route-family, overlay-focus, inertness, and error-association tests.
- [ ] Implement navigation/search/account states and simplified footer.
- [ ] Add the five routes with consumer-facing copy.
- [ ] Consolidate overlay/field behavior and migrate existing dialogs/drawers.
- [ ] Run keyboard and seven-width shell/auth checks.
- [ ] After task review and implementation authorization, commit as `feat: unify application shell and primitives`.

### Task 11: Fix map sizing and configure production provider

**Files**

- Modify: `src/components/shell/AppChrome.tsx`
- Modify: `src/components/shell/MapWorkspaceShell.tsx`
- Modify: `src/components/map/MapCanvas.tsx`
- Modify: `src/components/map/RestaurantMap.tsx`
- Modify: `src/components/stitch/map/MapWorkspaceView.tsx`
- Modify: `src/components/stitch/map/MapResultsPanel.tsx`
- Modify: `src/components/stitch/map/MapMobileSheet.tsx`
- Modify: `src/config/map.ts`
- Modify: `.env.example`
- Modify: `e2e/map.spec.ts`

**Produces**

- Viewport-bounded map, production fail-closed configuration, collapsible panel, accurate 196/75 coverage, and resilient failure states.

**Steps**

- [ ] Add failing height/scroll/style-env/coverage/search-area tests using real container dimensions.
- [ ] Replace the flex-height chain with explicit route viewport/grid constraints.
- [ ] Configure MapTiler variables and remove production demo fallback.
- [ ] Add `ResizeObserver`, user-origin camera tracking, partial failure handling, panel collapse, and map resize hooks.
- [ ] Re-run fresh development/production Playwright diagnostics; expect a ~828px stage at 900px viewport and visible U.S. basemap.
- [ ] After task review and implementation authorization, commit as `fix: constrain and configure map workspace`.

### Task 12: Account deletion choices and final regression gate

**Files**

- Modify: `src/components/stitch/account/DeleteAccountDialog.tsx`
- Modify: `src/components/stitch/account/DangerZone.tsx`
- Modify: `src/app/personal-data/actions.ts`
- Modify: `e2e/auth.spec.ts`
- Modify: `e2e/passport.spec.ts`
- Create: `docs/migrations/passport-v3-reconciliation.md`

**Produces**

- Cloud deletion plus optional device clearing, retained local snapshot behavior, and final reconciliation/rollback evidence.

**Steps**

- [ ] Add three deletion-path tests: retain device, clear device after success, and preserve device after cloud failure.
- [ ] Implement client choice and exact sequencing from Section 2.
- [ ] Run full lint/type/unit/build/e2e/data/RLS suite.
- [ ] Capture the required seven-width regression set and compare map height, Explore overflow, shell copy, and journey controls.
- [ ] Publish migration counts, conflicts, unknown slugs, rollback window, and feature-flag decision for approval.
- [ ] After task review and implementation authorization, commit as `feat: finalize account deletion and v3 rollout gate`.

## 12. Files likely to change

High-confidence existing files:

- `src/app/layout.tsx`
- `src/app/personal-data/actions.ts`
- `src/lib/passport/types.ts`
- `src/lib/passport/store.ts`
- `src/lib/passport/PassportProvider.tsx`
- `src/components/passport/PassportClientShell.tsx`
- `src/lib/personal-data/merge.ts`
- `src/lib/personal-data/repository.ts`
- `src/components/stitch/restaurant-detail/JourneyControls.tsx`
- `src/components/stitch/restaurant-detail/RestaurantJourneySection.tsx`
- `src/components/stitch/restaurant-detail/PlanningDetailsDialog.tsx`
- `src/components/stitch/restaurant-detail/VisitDetailsDialog.tsx`
- `src/components/stitch/collections/AddRestaurantsDialog.tsx`
- `src/components/shell/AppChrome.tsx`
- `src/components/shell/AppHeaderClient.tsx`
- `src/components/shell/SiteFooter.tsx`
- `src/components/shell/MapWorkspaceShell.tsx`
- `src/components/stitch/Dialog.tsx`
- `src/components/stitch/Drawer.tsx`
- `src/components/stitch/Input.tsx`
- `src/components/map/MapCanvas.tsx`
- `src/components/map/RestaurantMap.tsx`
- `src/components/stitch/map/*`
- `src/config/map.ts`
- `src/config/navigation.ts`
- `src/config/site.ts`
- `src/components/stitch/restaurant/RestaurantMedia.tsx`
- `next.config.ts`
- `.env.example`
- `supabase/migrations/*`
- `src/lib/supabase/database.types.ts`
- `e2e/passport.spec.ts`
- `e2e/collections.spec.ts`
- `e2e/map.spec.ts`
- `e2e/shell.spec.ts`
- `e2e/auth.spec.ts`
- `scripts/test_passport_merge.mjs`
- `scripts/test_passport_phase8.mjs`
- `scripts/test_collections_phase9.mjs`
- `scripts/test_map_ui.mjs`
- `scripts/test_restaurant_presentation.mjs`
- `scripts/test_restaurant_detail.mjs`
- `package.json`

Likely new modules/routes are enumerated in the ordered tasks and should be created rather than continuing to enlarge the current provider/store/action files.

## 13. Risks and mitigations

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Legacy boolean combinations do not map cleanly to record entities. | High | Deterministic evidence-based matrix, favorite provenance without invented visits, unknown-date visits only for completed-visit evidence, warnings, raw backups, idempotent keys, cohort rollout. |
| Multiple visits increase sync/conflict complexity. | High | Client UUIDs, per-entity versions, additive merge, mutation receipts, explicit conflict UI. |
| Bookmark deletion could destroy visit history unexpectedly. | High | Block one-click unsave when dependents exist; explicit dependency summary and destructive remove-from-Passport flow. |
| Old and new app versions write concurrently during rollout. | High | Old-to-new trigger, feature flag, staged cohort, freeze legacy writes, reconciliation before cleanup. |
| Local clock skew produces incorrect last-write-wins behavior. | High | Optimistic versions and conflict responses instead of timestamp-only scalar merge. |
| Cloud account deletion succeeds but device clearing fails. | Medium | Clear synchronously after success, report retained-device warning on the next local session, never claim both succeeded without verification. |
| Image rights are ambiguous or expire. | High | Automated completeness checks, accountable review, manual escalation for uncertain/high-risk assets, private evidence, expiry/deactivation, immutable audit, honest fallback. |
| Ingestion-generated media variants increase storage and pipeline work. | Medium | Deterministic four-variant contract, immutable hashed paths, byte budgets, idempotent regeneration, and no runtime transformation dependency. |
| Public image URLs are abused through broad Next config. | Medium | Exact `remotePatterns`, owned hashed paths, no arbitrary URL input. |
| Production map key leaks/gets abused. | Medium | Browser key is public by design but domain-restricted; monitor usage/budget; never expose admin tokens. |
| Map provider outage leaves discovery unusable. | Medium | List-first fallback, route filters remain functional, retry map independently. |
| CSS regression recreates oversized map canvas. | High | Exact Playwright height/document-scroll assertions in dev and production. |
| 75 pending geocodes mislead area counts. | Medium | Separate mapped/pending count, pending row label, exclude only with explanation. |
| Provider decoupling causes local Passport hydration flashes. | Medium | Identifier-first skeleton, bounded summary fetch, preserve order, cache public summaries. |
| Route-owned data queries increase navigation latency. | Medium | Server caching, 24-item pagination, adjacent prefetch, bounded DTOs, loading states. |
| Footer/source cleanup removes useful transparency. | Low | Centralize complete methodology at `/source-information` and link once in footer. |

### Migration risk summary

Migration risk is **high but containable**. The current one-row aggregate cannot represent multiple visits, and contradictory legacy booleans require semantic decisions. The safest properties are: no destructive legacy drop, exact raw local/cloud backups, deterministic one-time visit IDs, idempotent backfill, a feature flag, explicit warnings, cohort rollout, and a rollback/reconciliation window. The largest irreversible mistake would be deleting the legacy row/table before V3 cloud and local counts reconcile.

## 14. Decision-log resolution

All Stage 1 approval questions were resolved by the product owner on 2026-07-18:

| Topic | Approved resolution | Rejected/deferred alternative |
| --- | --- | --- |
| Favorite-only migration | Bookmark plus internal `legacyFavorite=true`; no visit. | Automatically creating an undated visit is rejected because it invents dining history. |
| Visit-detail migration | Create an unknown-date visit only when content clearly proves a completed visit; generic notes become private bookmark notes. | No fabricated dates and no visit inferred from ambiguous planning prose. |
| Bookmark removal | Block ordinary Unsave when dependents exist; provide explicit cascading Remove from Passport. | A second “unsaved but retained history” state is rejected for V1. |
| Map provider | Keep MapLibre; use MapTiler Cloud with restricted key, monitoring, alerts, attribution, provider abstraction, and fail-closed production configuration. | Renderer replacement and production public-demo fallback are rejected. |
| Asset storage/variants | Use Supabase Storage and generate thumbnail/card/hero/gallery variants at ingestion. | Paid runtime Supabase transformations are not approved for V1. |
| Media review | Automated metadata validation plus accountable review; escalate uncertain/high-risk assets. | A mandatory second approver for every V1 asset is rejected. |
| Sync | Immediate local mutation, durable outbox, automatic retry, visible Pending, explicit Retry after exhaustion, four truthful sync states. | Local success may not be presented as cloud success. |
| Tombstones | Retain deletion tombstones for 90 days. | Shorter/longer retention is not part of V1. |
| Collections | Private-only for V1. | Sharing/public collections are out of scope. |
| Provider boundary | Remove the complete catalog from the global Passport provider; hydrate route-specific summaries by identifier. | Global catalog hydration is rejected. |

## Hard stop before implementation

Stage 1 ends with this document and screenshot evidence. The product owner has approved the decisions above and separately authorized Stage 2 Homepage specification work only. Do not modify production source, create Supabase migrations, ingest images, change provider configuration, implement the Homepage, commit, or push until a later implementation approval.
