# Dining Passport Journey Actions and Visit History Specification

**Stage:** 7 — Passport Journey Actions and Visit History  
**Date:** 2026-07-18  
**Status:** Product review  
**Surfaces:** Restaurant Detail, Passport, Saved, Planned, Visited, Collections, Explore cards, Map previews, related restaurant cards  
**Scope:** Specification only. This document does not authorize production implementation, database migrations, Supabase changes, local-storage schema changes, commits, or pushes.

## Executive direction

Replace five independent restaurant flags with a local-first record system that reads simply in the interface:

- **Save** creates a bookmark.
- **Plan a visit** creates or edits one active plan and ensures the bookmark exists.
- **Record a visit** appends a private visit record and ensures the bookmark exists.
- **Collections** reference bookmarked restaurants.
- **Unsave** removes only a dependency-free bookmark.
- **Remove from Passport** is the explicit cascading deletion for a restaurant and all of its personal records.

Normal local actions complete immediately. Signed-in synchronization is a second, durable process backed by an outbox, idempotency keys, server revisions, mutation receipts, and 90-day deletion markers. Routine successful synchronization stays quiet. Pending, failed, or conflicting work becomes visible only when it is useful or requires recovery.

The V1 forms remain intentionally focused:

- Plan: required date; optional time, reservation provider, confirmation/reference, and private planning notes.
- Visit: required date; optional favorite dishes, private notes, Would return, and Personal favorite.
- Party size, numeric rating, public review, photo upload, spending, companions, meal type, and service rating remain outside V1.

---

## 1. Current journey findings

### Evidence reviewed

- Stage 1 shared foundation and approved V3 architecture:
  - `docs/superpowers/plans/2026-07-17-dining-passport-shared-foundation.md`
- Approved Stage 6 Restaurant Detail contract:
  - `docs/superpowers/plans/2026-07-18-dining-passport-restaurant-detail-redesign.md`
- Current local state:
  - `src/lib/passport/types.ts`
  - `src/lib/passport/store.ts`
  - `src/lib/passport/PassportProvider.tsx`
- Current local/cloud boundary:
  - `src/lib/personal-data/repository.ts`
  - `src/lib/personal-data/local-adapter.ts`
  - `src/lib/personal-data/merge.ts`
  - `src/lib/personal-data/migration-state.ts`
  - `src/app/personal-data/actions.ts`
- Current database:
  - `supabase/migrations/20260717000004_user_restaurants.sql`
  - `supabase/migrations/20260717000005_collections.sql`
  - `supabase/migrations/20260717000007_rls_policies.sql`
- Current interaction surfaces:
  - `JourneyControls.tsx`
  - `PlanningDetailsDialog.tsx`
  - `VisitDetailsDialog.tsx`
  - `RestaurantJourneySection.tsx`
  - `SaveAction.tsx`
  - `PassportSyncNotice.tsx`
  - `DeviceSaveNotice.tsx`
- Current automated coverage:
  - `e2e/passport.spec.ts`
  - `e2e/restaurant-detail.spec.ts`
  - `e2e/collections.spec.ts`
  - `scripts/test_passport_merge.mjs`
  - `scripts/test_passport_phase8.mjs`
  - `scripts/test_collections_phase9.mjs`
- Existing visual evidence:
  - `output/playwright/stage1-foundation/passport-*.png`
  - `output/playwright/stage1-foundation/restaurant-detail-*.png`
  - `docs/stitch-redesign/baselines/passport/**`
  - `docs/stitch-redesign/baselines/restaurant-detail/**`

### Confirmed current behavior

1. Local storage uses schema version 2 under `mdp-passport`.
2. One `UserRestaurantRecord` stores Save, Want, Planned, Visited, Favorite, one plan date, one visit date, one note, one rating, and one favorite-dishes list.
3. The cloud mirrors that aggregate shape in one `user_restaurants` row per user and restaurant.
4. The aggregate cannot represent multiple visits, simultaneous visit-specific memories, independent record deletion, or per-record revisions.
5. Components patch partial booleans directly instead of issuing domain commands.
6. Planning and visiting can be toggled independently from Save.
7. Want and Favorite are still top-level actions.
8. Planning fields are optional and unvalidated; the dialog closes immediately after calling the mutation.
9. Visit date is optional, future dates are not rejected, and saving overwrites the single existing visit.
10. Cloud writes are launched with `void upsertCloudRestaurant(...)`; their result does not update a durable outbox or truthful per-mutation UI.
11. Local storage read failures recover to an empty store without distinguishing unavailable storage from genuinely empty data.
12. The current merge ORs booleans, unions dishes, and chooses some scalar values from `updatedAt`; only note/rating differences are reported as conflicts.
13. Client timestamps are therefore able to choose winners even when device clocks are wrong.
14. Collection membership is an array of restaurant slugs and is not constrained locally to a bookmark entity.
15. The current dialog primitive locks body scrolling and closes on Escape/backdrop, but does not provide portal rendering, focus trapping, inert background, initial-focus control, focus restoration, or field-linked error summaries.
16. Existing tests require Want, boolean Planned/Visited toggles, and a one-visit overwrite flow; those expectations must be replaced, not preserved.
17. Stage 1 already approves bookmarks, one active plan, appendable visits, bookmark-backed memberships, a durable outbox, versions, mutation receipts, deterministic migration, and 90-day deletion markers.

### Foundations to preserve

- Device-only Passport remains fully usable without an account.
- Local mutation succeeds before cloud synchronization.
- Planning, visiting, and adding to a collection ensure a bookmark.
- Past visits and one future plan may coexist.
- Private personal content never becomes public restaurant content.
- Collections remain private in V1.
- Account deletion keeps device data by default unless the user separately asks to clear it.
- Route-specific personal hydration replaces a global full-catalog dependency.

---

## 2. Functional defects

1. **Contradictory status model:** five booleans can produce states the interface cannot explain.
2. **No visit history:** a second visit overwrites the first.
3. **Duplicate actions:** Planned/Visited are both toggles and form entry points.
4. **Favorite at the wrong level:** restaurant Favorite competes with Save instead of describing a visit.
5. **Want duplicates Save:** it adds no distinct record or behavior.
6. **Invalid dependency states:** plan, visit, or collection membership can exist without Save.
7. **Unsafe Unsave:** a bookmark can be cleared without explaining dependent personal data.
8. **No deliberate cascade:** there is no single consequence-aware Remove from Passport command.
9. **No deletion protection:** records deleted on one device can return from another.
10. **No idempotency:** rapid actions can enqueue or send duplicate writes.
11. **No durable outbox:** refresh/offline/network failure can lose the cloud mutation.
12. **False confidence:** local success can look like cloud success.
13. **Timestamp winner risk:** clock skew can destroy newer private text.
14. **Partial migration ambiguity:** Favorite, generic notes, and completed-visit evidence are not separated rigorously.
15. **Form validation gaps:** invalid/past plan dates, future visit dates, and excessive private text are not handled.
16. **Draft-loss risk:** dialogs close before local persistence is proven and recoverable failures can discard input.
17. **Incomplete accessibility:** focus, validation association, pending protection, and mobile keyboard behavior are underspecified.
18. **Privacy ambiguity:** confirmation numbers and notes lack explicit masking, logging, export, and cloud-storage rules.
19. **Merge ambiguity:** signing in can combine local/cloud aggregates without a user-visible summary or safe record-level conflict flow.
20. **Surface inconsistency:** cards, detail, Passport lists, and collections expose different journey vocabulary.

---

## 3. Journey product goal

A person should understand the journey without learning a state machine:

- Save a restaurant for later.
- Add one future plan when the meal becomes intentional.
- Record each completed meal as its own private memory.
- Organize saved restaurants into collections.
- Remove a single plan or visit without disturbing the rest.
- Remove everything only through a clearly destructive flow.

The system must be:

- immediate on the current device;
- private by default;
- fully useful without an account;
- reliable offline;
- quiet when cloud sync succeeds;
- transparent when work is pending or failed;
- recoverable when two devices disagree;
- capable of repeat visits without overwriting history.

It must not resemble task management, CRM software, a public review platform, or a reservation database. The product records the visitor’s private journey; it does not claim that an external reservation was created, changed, or cancelled.

---

## 4. Canonical record architecture

### Record families

1. **PassportBookmark**
   - One active bookmark per owner scope and restaurant.
   - Carries bookmark-only private note and migration provenance.
2. **RestaurantPlan**
   - Zero or one non-deleted active plan per restaurant.
   - Represents a future intention or unresolved migrated/overdue plan.
3. **RestaurantVisit**
   - Zero or more independently identified records.
   - Carries all visit-specific reflection fields.
4. **CollectionMembership**
   - Zero or more membership records.
   - Requires a bookmark.
5. **PassportMutation**
   - Durable local outbox entry for signed-in synchronization.
6. **DeletionMarker**
   - Prevents a deleted entity from returning during the approved 90-day window.
7. **SyncRevision**
   - Records server-acknowledged entity/account revisions without trusting device clocks.
8. **MigrationMetadata**
   - Records source schema, deterministic legacy keys, provenance, warnings, and recoverable legacy values.

### Invariants

- A plan, visit, or collection membership cannot outlive its bookmark.
- Planning automatically ensures a bookmark exists.
- Recording a visit automatically ensures a bookmark exists.
- Plan/visit/membership creation and bookmark creation commit in one local command.
- Cloud application of dependent operations is transactional and bookmark-first.
- At most one non-deleted active plan exists per owner/restaurant.
- Visit IDs are client-generated UUIDs; repeat visits never reuse an ID.
- Components call commands; they never patch record objects directly.
- Deletion is an operation with revision history, not an omitted object.
- Consumer states are derived from non-deleted records.
- Local and cloud representations share stable IDs and schema versions.
- No record contains public-sharing fields in V1.

### Active-plan definition

“Active” means the plan has not been removed. A newly created plan must be today or future. If its date later passes, the same record becomes an **overdue active plan** and continues to derive Planned until the user records, reschedules, or removes it. Time passing never creates a visit.

---

## 5. Derived-state matrix

### Exact derivation

Let:

- `B` = active bookmark exists.
- `P` = non-deleted active plan exists.
- `V` = one or more non-deleted visits exist.
- `C` = one or more non-deleted collection memberships exist.

Then:

- `isUnsaved = !B && !P && !V && !C`
- `isSaved = B`
- `isPlanned = P`
- `isVisited = V`
- `isSavedOnly = B && !P && !V`
- `isPlannedAndPreviouslyVisited = B && P && V`
- `hasCollections = C`
- `needsInvariantRepair = (!B && (P || V || C))`

Normal data never sets `needsInvariantRepair`. If corrupted or partially migrated data does, the UI must not offer Save as if nothing exists. It shows the dependent records, labels the restaurant `Saved · Repairing Passport`, creates the missing bookmark locally, and blocks destructive actions until repair succeeds.

### Canonical combinations

| B | P | V | C | Consumer presentation | Primary actions |
| ---: | ---: | ---: | ---: | --- | --- |
| 0 | 0 | 0 | 0 | Unsaved | Save · Plan a visit · Record a visit |
| 1 | 0 | 0 | 0 | Saved | Saved · Plan a visit · Record a visit |
| 1 | 1 | 0 | 0 | Saved + Planned · date | Plan summary/Edit · Record a visit |
| 1 | 0 | 1+ | 0 | Saved + Visited summary | Plan a visit · Record another visit |
| 1 | 1 | 1+ | 0 | Planned · date + Visited count/last date | Edit plan · Record another visit |
| 1 | 0 | 0 | 1+ | Saved · In {n} collections | Plan a visit · Record a visit |
| 1 | 1 | 0 | 1+ | Planned + collection context | Edit plan · Record a visit |
| 1 | 0 | 1+ | 1+ | Visited + collection context | Plan a visit · Record another visit |
| 1 | 1 | 1+ | 1+ | Planned + Visited + collection context | Edit plan · Record another visit |
| 0 | 1 | any | any | Invalid; repair bookmark | No Unsave/Remove until repair result |
| 0 | any | 1+ | any | Invalid; repair bookmark | No Unsave/Remove until repair result |
| 0 | any | any | 1+ | Invalid; repair bookmark | No Unsave/Remove until repair result |

Collection membership does not create another top-level journey status. It contributes context and blocks simple Unsave.

### Summary ordering

When Planned and Visited coexist:

1. upcoming/overdue plan summary;
2. visit-count and latest-visit summary;
3. collection context;
4. exceptional sync status.

The interface never chooses only one of Planned or Visited.

---

## 6. Save behavior

### First save

1. Generate the bookmark ID deterministically from owner scope plus restaurant ID/slug.
2. Begin one local transaction.
3. If an active bookmark already exists, return idempotent success.
4. Persist the bookmark.
5. For signed-in mode, persist one outbox mutation in the same transaction.
6. Commit locally.
7. Render Saved immediately.
8. Flush the outbox asynchronously.

If local persistence fails, do not render Saved. Keep the control actionable and show `Couldn’t save on this device · Try again`.

### Device-only presentation

- Button state: `Saved`.
- Contextual status on detail/Passport management surfaces: `Saved on this device`.
- Explore/Map/related cards do not add a permanent device notice.
- Account creation is never required or modalized after Save.

### Signed-in presentation

- Normal state: `Saved`.
- Do not show a permanent `Synced` badge.
- Hide a successful pending transition for the first two seconds.
- If still pending after two seconds, show restrained `Sync pending`.
- If offline, show `Saved on this device · Will sync when online` immediately on management surfaces.
- After retry exhaustion, show `Couldn’t sync · Retry`.

### Duplicate-action protection

- Bookmark identity is unique by owner/restaurant.
- The button disables only while the local transaction is committing.
- Rapid taps share the same in-flight command promise.
- One mutation ID/idempotency key is created per logical Save.
- An existing equivalent pending bookmark mutation is reused instead of duplicated.
- A server mutation receipt makes replay a no-op success.
- A stale acknowledgment updates only sync metadata; it cannot overwrite a newer bookmark deletion or revision.
- Multi-tab mutation ownership prevents two tabs from flushing the same entry concurrently.

### Save button states

| State | Visible label | Behavior |
| --- | --- | --- |
| Unsaved | Save | Available |
| Local transaction | Saving… | Disabled; `aria-busy=true` |
| Device-only success | Saved | Pressed |
| Signed-in success/quiet sync | Saved | Pressed |
| Extended pending | Saved · Sync pending | Pressed; management status available |
| Offline | Saved on this device | Pressed |
| Retry exhausted | Saved · Couldn’t sync | Pressed; Retry adjacent/contextual |
| Destructive removal | Removing… | Disabled until local cascade resolves |

Accessible names always include restaurant context:

- `Save SingleThread to your Passport`
- `SingleThread is saved in your Passport`
- `Retry syncing SingleThread`

Status changes use a polite live region; local failure uses an assertive error only after the action was attempted.

---

## 7. Unsave behavior

### Simple Unsave eligibility

Ordinary Unsave is allowed only when all are true:

- active bookmark exists;
- no active plan;
- no non-deleted visit;
- no collection membership;
- bookmark private note is empty;
- no unresolved conflict or recovery payload depends on the bookmark;
- no pending dependent mutation exists beyond a compactable bookmark Save.

### Simple Unsave flow

1. User opens the Saved control/menu and selects `Unsave`.
2. Run dependency checks against the current local transaction snapshot.
3. If eligible, remove the bookmark locally.
4. Compact an unacknowledged Save followed by Unsave to no cloud operation when the bookmark never existed on the server.
5. Otherwise enqueue an idempotent bookmark deletion marker.
6. Update the UI to Unsaved after local commit.
7. If cloud synchronization later fails, keep the local Unsaved presentation and show a recovery notice that the deletion has not reached other devices.

No confirmation dialog is required for a dependency-free, note-free bookmark.

### Blocked Unsave messaging

Do not silently cascade. Explain the actual dependency:

- `This restaurant has an upcoming plan. Remove the plan before unsaving, or remove everything from Passport.`
- `This restaurant has 2 recorded visits. Delete the visits individually, or remove everything from Passport.`
- `This restaurant belongs to 2 collections. Remove it from those collections, or remove everything from Passport.`
- `This saved restaurant has a private note. Remove the note before unsaving, or remove everything from Passport.`

When several dependencies exist, show a compact summary and the actions:

- `Manage plan`
- `View visits`
- `View collections`
- `Remove from Passport…`
- `Cancel`

---

## 8. Remove-from-Passport behavior

### Scope

The explicit cascade removes, for one restaurant:

- bookmark and bookmark-only private note;
- active plan and its private fields;
- every visit, including notes, dishes, Would return, Personal favorite, and migration-only values;
- every collection membership, but not the collections themselves;
- unresolved drafts/conflict copies after they are included in the consequence summary;
- superseded pending mutations for these entities.

### Consequence summary

Use record-aware natural language:

> Removing SingleThread from your Passport will delete one upcoming plan, two recorded visits, private notes, and membership in two collections.

Omit zero-value clauses. Identify an undated migrated visit as `one visit with no recorded date`. Never use vague `associated data`.

### Desktop dialog

- Centered, maximum 560px.
- Title: `Remove SingleThread from Passport?`
- Initial focus: `Cancel`.
- Destructive button: `Remove everything from Passport`.
- Supporting copy: `This removes your private Passport records. It does not cancel a restaurant reservation or delete the collections themselves.`
- Escape/backdrop close only before submission.
- Focus restores to the trigger after cancellation; after success, focus moves to the nearest stable page heading/status.

### Mobile sheet

- Full available width minus 16px gutters at 430/390/375px.
- Bottom sheet with safe-area padding and bounded internal scrolling.
- Consequence list remains above sticky actions.
- Cancel and destructive action stack at 375/390; destructive action does not truncate.
- No 212px-width regression or horizontal overflow.

### Command behavior

1. Re-read dependencies inside the local transaction.
2. Build a cascade ID and one consequence snapshot.
3. Mark all dependent records deleted and create deletion markers atomically.
4. Remove memberships before the bookmark in operation order.
5. Replace/supersede pending updates with one cascade mutation graph.
6. Commit locally.
7. Hide the restaurant from personal lists and announce success.
8. Signed-in cloud synchronization applies the cascade transactionally and returns mutation receipts/revisions.

Offline removal is allowed. Show `Removed on this device · Pending sync` on the recovery surface, not a blocking warning.

### Failure/retry

- Local transaction failure: nothing is removed; dialog remains open with preserved summary.
- Cloud transient failure: local deletion remains; retry through outbox.
- Authentication expiry: local deletion remains; ask the user to sign in to finish synchronization.
- Cloud validation/conflict: preserve the deletion intent, pause related updates, and open recovery.
- A partial cloud cascade is treated as a consistency fault. Do not claim success across devices; retry the idempotent cascade and escalate diagnostics without logging private content.
- Screen reader completion: `SingleThread was removed from this device. Synchronization is pending.` or `SingleThread was removed from your Passport.`

---

## 9. Planning fields and validation

### Final V1 fields

| Field | Requirement | V1 decision |
| --- | --- | --- |
| Planned date | Required for new plans | Include |
| Planned time | Optional | Include |
| Party size | Optional proposal | Exclude from V1 |
| Reservation provider | Optional | Include |
| Confirmation/reference | Optional, private | Include |
| Private planning notes | Optional | Include |

Party size is excluded because Dining Passport is recording intention, not managing a reservation. It adds validation and staleness without improving the core journey.

### Date and time contract

- New plan date is required and must be the restaurant-local current date or later.
- Store the calendar date as `YYYY-MM-DD`; never convert it through UTC.
- Optional time is stored as local wall time `HH:mm`.
- Store an IANA time-zone snapshot when the restaurant’s reviewed location can resolve one.
- Also store `timeZoneSource: "restaurant" | "device" | "unknown"`.
- When restaurant time zone is unknown, allow the optional time, label it `Time as entered`, and do not convert it on another device.
- Travel or device time-zone changes never shift the saved date/time.
- For known time zones, reject a nonexistent daylight-saving wall time and explain the next valid range.
- For repeated fall-back times, retain wall time plus zone without pretending an exact instant is known.
- Display locale-friendly dates, but edit/storage always use the date-only source value.

### Legacy exceptions

- A migrated plan may have `plannedDate=null` and `datePrecision="unknown"`.
- A migrated past date remains visible as overdue.
- Editing a legacy undated plan requires a valid current/future date before saving substantive changes.
- Editing an overdue dated plan requires rescheduling to today/future; use Record this visit or Remove plan when the past date should remain historical.
- Migration never inserts today as a fabricated date.

### Field limits

- Reservation provider uses a short known-provider selector when available plus `Other`; it may be left empty and never proves a reservation exists.
- Reservation provider: 80 UI characters; 120 storage characters.
- Confirmation/reference: 120 UI characters; 256 storage characters.
- Planning notes: 1,000 UI characters; 2,000 storage characters.
- Leading/trailing whitespace is trimmed on commit; internal line breaks are preserved.
- Control characters and unsafe markup are rejected/sanitized; text is rendered as text.

---

## 10. Plan creation behavior

1. User selects `Plan a visit`.
2. The bookmark command commits first if absent; selecting Plan therefore saves the restaurant even if the form is later cancelled.
3. If local bookmark persistence fails, do not imply a plan can be saved; show recovery.
4. Open the shared Plan interaction with restaurant identity and privacy context.
5. Default planned date to empty; do not guess a date.
6. Validate on blur and submit without erasing input.
7. On submit, re-check that no active plan now exists.
8. Persist the plan and its outbox mutation atomically.
9. Close only after local commit succeeds.
10. Show `Planned · August 12, 2026` immediately.
11. Flush bookmark/plan mutations in dependency order or one transactional batch.

### Existing-plan guard

If another tab/device/local action creates an active plan while the form is open:

- do not create a second plan;
- preserve the draft;
- show `A plan already exists for this restaurant`;
- offer `Review existing plan` and `Discard this draft`;
- when safe, offer field-by-field merge into the existing plan.

### Primary-action state

After creation, replace `Plan a visit` with:

> Planned · August 12

Selecting it opens the plan summary with Edit and Remove plan controls. A second future plan can be created only after the current plan is removed or completed through a recorded visit.

---

## 11. Plan editing behavior

### Editable fields

- Planned date
- Planned time
- Reservation provider
- Confirmation/reference
- Private planning notes

The plan ID, restaurant, owner, creation timestamp, and migration provenance are immutable.

### Interaction

1. Open from the plan summary’s `Edit plan` action.
2. Initialize a draft from the current local revision.
3. Validate against the same rules as creation.
4. Keep Save disabled until the draft differs and passes validation.
5. On Save, include `baseRevision` from the draft’s source.
6. Commit locally and add/compact the outbox mutation atomically.
7. Update the summary immediately.
8. Close after local commit; cloud sync remains non-blocking.

### Dirty-state protection

- Cancel with no changes closes immediately.
- Close, Escape, backdrop, route change, or browser back with changes opens `Discard changes?`.
- Options: `Keep editing` and `Discard changes`.
- A pending local commit disables close/Escape.
- A cloud-pending state does not trap the user in the dialog.

### Offline and conflict behavior

- Offline edit is allowed and marked pending.
- A stale server revision does not overwrite either draft.
- The server-active plan remains the acknowledged version.
- The device edit is preserved as a recoverable draft.
- Conflict actions are `Keep this device’s plan`, `Keep synced plan`, or `Review fields`.
- Choosing a version creates a new mutation based on the latest acknowledged revision.
- There is never an implicit second active plan.

### Accessible errors

- Date/time errors attach to their fields.
- A submit error summary links to the first invalid field.
- Conflict messaging uses `role=status` on detection and a labeled conflict dialog when user action is required.
- Successful local update announces `Plan updated on this device`.

---

## 12. Plan cancellation behavior

### Final term

Use **Remove plan**, not Cancel plan.

Reason: Dining Passport removes its private planning record; it cannot cancel an external reservation. Supporting copy always says:

> Removing this Passport plan does not cancel a restaurant reservation.

### Consequences

Removing a plan:

- deletes/tombstones only the active plan;
- preserves the bookmark;
- preserves all visits;
- preserves collection memberships;
- preserves bookmark-only notes;
- never creates a visit;
- recalculates Planned to false;
- queues deletion synchronization when signed in.

### Confirmation threshold

- Date/time/provider only: selecting `Remove plan` is the intentional action; no modal confirmation.
- Confirmation/reference or private planning notes present: show a confirmation dialog/sheet naming the private details generically.
- Pending conflicting plan draft: require conflict resolution before removal unless the user chooses the broader Remove from Passport flow.

Confirmation copy:

> Remove your August 12 plan? Your private planning details will be deleted. This will not cancel a restaurant reservation.

Buttons: `Keep plan` and `Remove plan`.

### Failure

- Local failure preserves the plan and draft.
- Offline/cloud failure removes it locally and shows pending synchronization.
- A delete-versus-edit cloud conflict follows deletion rules in Section 27.

---

## 13. Overdue-plan behavior

A plan becomes overdue after the end of its stored restaurant-local calendar date. If the restaurant time zone is unknown, use the device-local date boundary and label calculations as approximate internally; never alter the stored plan date.

### Presentation

- Status: `Planned date passed`.
- Supporting date remains visible.
- Actions:
  - `Record this visit`
  - `Reschedule`
  - `Remove plan`
- Do not mark Visited.
- Do not create a modal, push notification, or repeated banner automatically.

### Passport continuation

- From the day after the plan through 30 days after, one most-recent overdue plan may appear in the Passport continuation module.
- Show no more than one overdue continuation at a time.
- After 30 days, the plan remains in Planned under `Plans to review` but stops occupying the primary Passport continuation.
- A user dismissal hides the continuation for that session; it does not remove the plan.
- The Planned page always retains the unresolved plan until the user acts.

### Actions

- `Record this visit` opens the visit flow with plan-aware defaults.
- `Reschedule` opens Edit plan with date focus.
- `Remove plan` follows Section 12.

---

## 14. Visit fields and validation

### Final V1 fields

| Field | Requirement | Decision |
| --- | --- | --- |
| Visit date | Required for new visits | Include |
| Favorite dishes | Optional | Include |
| Private notes | Optional | Include |
| Would return | Optional tri-state | Include |
| Personal favorite | Optional boolean | Include |
| Numeric rating | Proposed | Exclude from V1 UI |
| Public review | Proposed | Exclude |
| Photo upload | Proposed | Exclude |
| Spending total | Proposed | Exclude |
| Dining companions | Proposed | Exclude |
| Meal type | Proposed | Exclude |
| Service rating | Proposed | Exclude |

The privacy line appears once below the title:

> Your visit details are private and stored in your Passport.

### Visit date

- Default to today in the restaurant’s reviewed local time zone.
- If restaurant time zone is unknown, default to the device-local calendar date.
- If opened from `Record this visit` on an overdue plan, default to the plan date.
- New visit date is required.
- Same-day and past dates are valid.
- Future dates are rejected.
- Store as `YYYY-MM-DD` date-only; never convert through UTC.
- Display in the user’s locale without changing its calendar meaning.
- Migrated `visitedAt=null`, `datePrecision="unknown"` remains valid until the user chooses a date.

### Same-day duplicate protection

If another visit exists for the same restaurant/date:

- do not merge automatically;
- show `You already recorded a visit on this date`;
- allow `Record another visit` because separate meals on the same day are possible;
- require that explicit confirmation before commit.

### Field limits

- Favorite dishes: up to 10 items, 80 UI characters each, 100 storage characters each, 1,000 storage characters total.
- Private visit notes: 2,000 UI characters; 4,000 storage characters.
- Would return: `Yes`, `No`, or `Not set`.
- Personal favorite: one boolean on this visit.
- Migration-only numeric rating may be retained privately for lossless export but is not editable or promoted in V1.

---

## 15. First-visit behavior

1. User selects `Record a visit`.
2. Ensure the bookmark locally; selecting Record therefore saves the restaurant even if the form is cancelled.
3. Open a new draft with a fresh client UUID.
4. Default date according to Section 14.
5. Keep optional reflection fields unset/empty.
6. Validate without clearing input.
7. If a same-day record exists, require explicit duplicate confirmation.
8. Commit bookmark, visit, and outbox entries atomically.
9. Close after local success.
10. Update derived state and summaries immediately.

### Summary after local success

- One dated visit: `Visited once` and `Last visited · May 4, 2026`.
- One undated migrated visit: `Visited · Date not recorded`.
- If signed in and pending unusually long: append contextual `Sync pending`.

### Plan independence

Recording a visit does not silently remove an active plan. The form displays the plan-completion choice described in Section 17 when a plan exists.

---

## 16. Multiple-visit behavior

### Record model

- Every visit has a separate client-generated UUID.
- `Record another visit` always opens a new draft.
- Editing or deleting targets a visit ID, never the restaurant slug.
- One restaurant may have any number of non-deleted visits.

### Ordering

1. Dated visits sort by `visitedAt` descending.
2. Same-date visits sort by `createdAt` descending.
3. Undated migrated visits follow dated visits and sort by `createdAt` descending.
4. Stable ID is the final deterministic tie-breaker.

### Summaries

- 1 dated visit: `Visited once`
- 2 visits: `Visited twice`
- 3 or more: `{n} visits`
- Latest dated: `Last visited · May 4, 2026`
- Only undated visits: `Visited · Date not recorded`
- Dated plus undated: count includes all; latest line uses latest known date and history labels unknown records individually.

### History presentation

- Detail/Passport summary initially renders the 10 most recent visits.
- `Load earlier visits` adds 20 at a time.
- Do not use infinite scrolling.
- Visit history remains keyboard-navigable and retains focus after edit/delete.
- Global Visited surfaces paginate restaurant summaries separately; they do not load every visit body into each card.

### Empty history

When the last visit is deleted:

- Visited derives false;
- bookmark remains;
- active plan remains;
- history component closes or shows `No recorded visits`;
- primary action returns to `Record a visit`.

---

## 17. Record-from-plan behavior

### User control

When an active plan exists, the visit form includes:

> This visit completes your August 12 plan

Use a checkbox/switch with explicit supporting text:

> Completing the plan removes it from Planned. It does not change or cancel a restaurant reservation.

### Defaults

- Exact plan-date match: checked by default.
- Visit date after the plan date by 1–7 days: checked by default with `This looks like your planned meal`.
- Visit date before the plan date: unchecked.
- Visit date more than 7 days after the plan date: unchecked.
- Undated plan: unchecked.
- Clearly separate future plan: unchecked.

Changing the visit date recalculates the suggestion only until the user manually changes the checkbox. User choice then remains authoritative.

### Prefill

- From an overdue plan’s `Record this visit`: prefill visit date from plan.
- From the general Restaurant Detail `Record a visit`: default to today and show the plan-completion choice.
- Do not copy confirmation numbers or planning notes into visit notes.

### Commit

When checked, one local transaction:

1. ensures the bookmark;
2. creates the visit;
3. creates a plan deletion marker;
4. compacts/supersedes pending plan mutations;
5. enqueues dependency-ordered cloud operations.

When unchecked, create the visit and preserve the plan unchanged.

---

## 18. Visit editing behavior

Editable fields:

- visit date;
- favorite dishes;
- private notes;
- Would return;
- Personal favorite.

Migration-only rating/provenance is read-only and exportable.

### Interaction

- Open from a VisitHistoryItem menu or `Edit visit`.
- Title includes date: `Edit May 4, 2026 visit`; undated: `Edit visit with no recorded date`.
- Draft records the source revision.
- Same validation and same-day duplicate warning apply.
- Save commits locally with a new mutation or compacted pending create.
- Update summary/order immediately after local success.
- Cloud synchronization remains non-blocking.

### Dirty state and conflict

- Protect dirty drafts on close/navigation.
- Local failure keeps the form and input.
- Stale server revision preserves both device and synced payloads.
- Conflict options:
  - `Keep this device’s changes`
  - `Keep synced changes`
  - `Save device version as another visit`
- The duplicate option receives a new visit ID and leaves the synced visit unchanged.
- No choice silently discards private text; discarded versions remain in the recovery log until resolution/export.

### Announcements

- `May 4 visit updated on this device`
- `Visit update is waiting to sync`
- `Visit changes need your review`

---

## 19. Visit deletion behavior

### Consequences

Deleting one visit:

- preserves all other visits;
- preserves the bookmark;
- preserves the active plan;
- preserves collection memberships;
- removes that visit’s notes, dishes, Would return, Personal favorite, and migration-only private values;
- recalculates count/latest summaries;
- creates a deletion marker;
- can queue offline.

### Confirmation

Dated:

> Delete your May 4, 2026 visit?

Undated:

> Delete this visit with no recorded date?

Supporting copy says the visit’s private details will be removed. Buttons: `Keep visit` and `Delete visit`.

### Sync behavior

- Local deletion hides the visit immediately after commit.
- Pending cloud delete stays in the outbox.
- An edit received after the delete’s base revision becomes a conflict; deletion remains the acknowledged intent and the edit is retained as a recoverable copy.
- Deleting the last visit does not unsave the restaurant.

---

## 20. Legacy visit treatment

### Approved mappings

| Legacy evidence | V3 presentation |
| --- | --- |
| Favorite only, no completed-visit evidence | Bookmark with hidden migration provenance; no visit |
| Want only | Bookmark; Want removed |
| `planned=true` or planning fields | Bookmark + active plan |
| `visited=true` with real date | Bookmark + dated visit |
| `visited=true` without date | Bookmark + undated visit |
| Favorite dishes, rating, would-return, or completed-meal note | Bookmark + dated/undated visit based on source date |
| Generic note without visit evidence | Bookmark private note; no invented visit |
| Collection member without bookmark | Bookmark + membership |

### Undated visits

- `visitedAt=null`
- `datePrecision="unknown"`
- Display: `Visited · Date not recorded`
- Actions: `Add a date`, `Edit details`, `Delete visit`
- Do not show repair banners repeatedly.
- Passport may show one restrained migration note in the visit editor/history information area.

### Preservation

- Deterministic `legacySourceKey` prevents duplicate migration.
- Favorite-only provenance never creates Personal favorite in a fabricated visit.
- Legacy numeric rating is preserved privately for export/recovery but not exposed as a V1 rating feature.
- Raw V2 backup remains available through the migration recovery window.
- Users are not forced to repair undated records before using other Passport features.

---

## 21. Favorite and would-return model

### Would return

- Optional tri-state reflection on one visit: `Yes`, `No`, `Not set`.
- It describes that visit’s experience, not a permanent restaurant judgment.
- Unset remains distinct from No.

### Personal favorite

Final model:

1. Personal favorite belongs only to a visit record.
2. A restaurant-level `hasFavoriteVisit` value is derived when any active visit is marked favorite.
3. Multiple visits at the same restaurant may be favorites.

Do not restrict a restaurant to one favorite visit; separate meals can each matter. Do not persist a restaurant-level Favorite record or restore Favorite as a primary action.

### Presentation

- Visit editor label: `Mark this as a personal favorite`.
- Visit history item may show `Personal favorite`.
- Restaurant/Passport summary may show a restrained `Includes a favorite visit`, never a competing heart button.
- Would return and Personal favorite are never public, included in restaurant recommendations without separate approval, or logged to analytics.

---

## 22. Collection dependencies

### Invariants

- Adding to a collection ensures a bookmark in the same local transaction.
- Repeating collection add is idempotent.
- Removing from one collection deletes only that membership.
- Deleting a collection removes its memberships and preserves every bookmark, plan, and visit.
- Simple Unsave is blocked while any membership exists.
- Remove from Passport removes all memberships for the restaurant and preserves the collection records/other members.

### Messaging

Blocked Unsave:

> SingleThread is in California Celebration Trip and one other collection. Remove it from those collections, or remove everything from Passport.

Remove from Passport:

> Membership in 2 collections will be removed. The collections and their other restaurants will stay intact.

### Surface scope

Stage 7 defines dependency behavior only. Collection creation, organization, cover behavior, and page layout remain for the later Collections redesign.

---

## 23. Device-only behavior

### Local persistence

- V1 remains a versioned, adapter-owned local store as approved in Stage 1.
- The V3 store is written as one validated snapshot so entity and outbox changes cannot be persisted separately.
- Keep stable record maps keyed by restaurant/record ID for indexed lookup; do not scan a global restaurant catalog.
- Re-read and validate after schema migration before marking migration complete.
- Preserve the exact V2 backup until the approved migration/reconciliation window closes.

### User experience

- Save, Plan, Visit, history, removal, collections, export, and clear-data work without an account.
- Normal actions do not trigger sign-in prompts.
- One subtle settings/Passport notice may say:

  > Your Passport is stored on this device. Sign in to sync supported data across devices.

- Cards do not repeat this notice.

### Export

- Export all active local Passport entities, migration metadata, unresolved recovery copies, and recent deletion markers in a versioned JSON document.
- Tell the user that export contains private notes and confirmation references.
- Do not include browser/device secrets or analytics identifiers.
- Export remains available when sync is failed or the catalog is unavailable.

### Clear local data

- Entry point belongs in Account/Passport settings, not restaurant actions.
- Consequence summary includes bookmarks, plans, visits, collections, pending mutations, conflicts, and local deletion markers.
- Offer `Export first`.
- Destructive label: `Clear this device’s Passport`.
- Clearing one device does not delete signed-in cloud data unless a separate cloud deletion flow is chosen.
- On successful clear, remove local snapshots, backups approved for removal, outbox, recovery payloads, and device scope ID; create a new device scope on next use.

### Browser limitations

- Storage unavailable: present Passport as temporarily read-only and do not claim mutations succeeded.
- Storage quota exceeded: preserve the prior valid snapshot, keep the draft, offer export/cleanup, and avoid partial writes.
- Private/incognito browsing: show one contextual warning that data may disappear when the session closes.
- Clearing browser/site data deletes device-only Passport data.
- Device-only records do not appear on another browser/device.
- V1 local private fields are plaintext within browser storage; UI copy must not imply device encryption.

---

## 24. Sign-in merge behavior

### Recommended flow

Do not require a blocking preview for conflict-free merge.

1. Freeze outbox flushing briefly and read a validated local snapshot.
2. Write an exact local backup.
3. Pull cloud records, revisions, deletion markers, and account sync epoch.
4. Classify every entity as identical, local-only, cloud-only, safely mergeable, deleted, or conflicting.
5. Apply safe merges automatically.
6. Preserve conflicts without overwriting either side.
7. Queue required local-to-cloud operations.
8. Resume outbox processing.
9. Show a concise merge summary and open conflict resolution only when required.

Example:

> Passport connected: 8 saved restaurants, 2 plans, and 5 visits were combined. One plan needs review.

### Automatic merges

- Bookmark exists on one side only: retain/create it unless a newer valid deletion marker applies.
- Same bookmark ID and same content/revision: no-op.
- Distinct visit IDs: additive union.
- Same visit ID and identical fields: retain one.
- Distinct memberships: additive union when collection/bookmark ownership is valid.
- Same membership ID and same state: no-op.
- Pending mutations already acknowledged by receipt: mark complete without replay.
- Local-only collection with unique normalized name: retain.
- Cloud-only records: retain.

### Conflicts requiring choice

- Two distinct active plans for one restaurant.
- Same plan revision lineage with different private/scalar edits.
- Same visit ID with different notes, dishes, date, or reflection fields.
- Edit of an entity deleted on the other side.
- Remove-from-Passport competing with any later-looking unacknowledged update.
- Same collection identity with conflicting name/description/order.

### Duplicate and collection-name handling

- Different visit IDs on the same date remain separate; flag possible duplicates but do not merge.
- Same normalized collection name with different IDs remains two collections initially.
- Display the local copy as `{name} (from this device)` until the user renames or merges it in the later Collections flow.
- Do not silently combine collection memberships based on name alone.

### Plan conflict

- Keep the server-acknowledged plan active during review.
- Preserve the device plan as a recovery draft.
- Choices:
  - keep device plan;
  - keep synced plan;
  - review and combine fields into one plan.
- Never create two active plans implicitly.

### Visit conflict

- Choices:
  - keep device visit;
  - keep synced visit;
  - save device version as another visit.
- Both text payloads remain exportable until resolution.

### Failure

- A failed merge does not clear local data or mark migration complete.
- Retry resumes from mutation receipts/classification rather than restarting destructive writes.
- User can continue device-only from the preserved local snapshot.

---

## 25. Synchronization state model

### Internal states

| State | Meaning | Normal UI |
| --- | --- | --- |
| `local_success` | Local transaction committed; no cloud obligation or flush not started | Saved/Planned/Visited |
| `pending` | Outbox contains eligible/in-flight work | Hidden for first 2s; then Sync pending |
| `retry_scheduled` | Transient failure; automatic retry scheduled | Usually same as pending |
| `synced` | Outbox empty and latest pull/ack succeeded | No permanent badge |
| `sync_failed` | Non-retryable auth/validation/conflict or transport failure needs attention | Recovery message |
| `retry_exhausted` | Initial attempt plus five scheduled retries failed | `Couldn’t sync · Retry` |

Offline is a connectivity condition layered on pending, not a replacement for local success.

### Visibility rules

Show sync UI only when:

- pending lasts more than two seconds;
- browser is offline;
- retry is exhausted;
- authentication/permission requires action;
- conflict requires resolution;
- a destructive delete has not reached other devices.

Do not show `Synced` on every card or visit.

### Retry schedule

- Retry transient failures after approximately 2s, 5s, 15s, 60s, and 5 minutes.
- Add ±20% jitter so tabs/devices do not synchronize together.
- The initial flush is attempt 1; the five delayed retries are attempts 2–6.
- After the fifth scheduled retry fails, mark exhausted and retain the entry.
- A later `online`, authenticated app focus, successful auth refresh, or explicit Retry may start a new retry cycle.
- Client-library transport retries do not replace the durable application outbox.

### Recovery triggers

- Browser `online`
- App/tab focus after at least 30 seconds backgrounded
- Successful session refresh
- Explicit Retry
- Another tab’s successful acknowledgment
- Initial app bootstrap/reload

### Truth conditions

`Synced` is true only when:

- durable outbox is empty for the owner;
- no unresolved conflict blocks an entity;
- latest server acknowledgment/pull succeeded;
- server revisions have been applied locally.

Do not infer sync from elapsed time or network availability.

---

## 26. Mutation-outbox contract

### Required entry fields

- Mutation ID
- Entity type
- Entity ID
- Operation
- Versioned payload or patch
- Base server revision
- Local entity revision
- Created timestamp
- Client sequence number
- Attempt count
- Last-attempt timestamp
- Next-retry timestamp
- Dependency mutation IDs
- Idempotency key
- Status
- Last error classification
- Owner user ID or device scope
- Device ID
- Schema version
- Cascade ID when applicable

### Operations

- `create`
- `update`
- `delete`
- `remove_restaurant_cascade`
- `acknowledge_conflict_resolution`

### Ordering

- Preserve client sequence within one entity.
- Resolve explicit dependency IDs before dependents.
- Bookmark create precedes plan, visit, and membership create.
- Membership/plan/visit deletes precede bookmark delete.
- Independent visits may batch together but keep deterministic sequence.
- One tab/device flusher owns a lease; other tabs observe and may take over after lease expiry.

### Example: plan lifecycle

1. Bookmark create, if absent.
2. Plan create depends on bookmark create.
3. Plan edit depends on create/latest edit.
4. Plan delete depends on latest acknowledged or pending plan mutation.

### Example: visit lifecycle

1. Bookmark create, if absent.
2. Visit create depends on bookmark create.
3. Visit edit depends on create/latest edit.
4. Visit delete depends on latest visit mutation.

### Queue compaction

- Repeated identical Save: one bookmark create.
- Unacknowledged bookmark create then eligible Unsave: remove both when no server bookmark/dependent exists.
- Plan create + edits before acknowledgment: one create with latest valid payload.
- Plan create + remove before acknowledgment: remove plan mutations; preserve auto-created bookmark.
- Several pending edits to one acknowledged plan: one latest patch with original base revision.
- Plan edit + delete: keep delete.
- Visit create + edits before acknowledgment: one create with latest payload.
- Visit create + delete before acknowledgment: remove visit mutations; preserve bookmark.
- Visit edit + delete: keep delete.
- Remove from Passport supersedes pending entity updates and becomes one dependency-ordered cascade; never compact away a delete that may be needed against cloud state.
- A mutation with a server receipt is removed only after the acknowledgment and returned revision are durably stored.

### Idempotency

- Mutation ID is a client UUID and the default idempotency key.
- Server stores per-user mutation receipts.
- Replaying a receipt returns success plus the original/current revision.
- Idempotency scope includes user, mutation ID, and operation schema version.

---

## 27. Conflict-resolution rules

| Conflict | Classification | Rule |
| --- | --- | --- |
| Same bookmark created on two devices | Safe automatic merge | One bookmark; merge non-conflicting note/provenance |
| Bookmark notes differ | User-visible | Preserve both; choose/merge text |
| Same plan edited on two devices | User-visible | Server-acknowledged version remains active; preserve device draft |
| Plan deleted vs edited | Deletion wins + recovery copy | Keep deleted; offer Restore as new plan from preserved edit |
| Distinct visit IDs | Safe additive merge | Keep both |
| Same visit ID edited identically | No-op | Keep one |
| Same visit ID with scalar-only non-overlap | Safe field merge | Merge only when base revisions prove fields did not overlap |
| Same visit ID with overlapping/private edits | User-visible | Keep device, keep synced, or duplicate |
| Visit deleted vs edited | Deletion wins + recovery copy | Keep deleted; offer restore as new visit |
| Possible same-day duplicate visits | User confirmation | Keep both unless user explicitly deletes/merges later |
| Membership added on one device | Safe additive merge | Keep membership and ensure bookmark |
| Membership deleted vs unchanged | Deletion wins | Keep deleted |
| Collection order edited on two devices | Last acknowledged server revision | Preserve losing order snapshot for later collection review |
| Remove from Passport vs pending edits | Deletion wins + recovery copy | Block edits; retain private draft for explicit restore/export |
| Reconnect after >90 days | Full rebase required | Do not replay stale updates automatically |

### General principles

- Server revision and mutation receipt are authoritative; device timestamps are informational.
- Generic last-write-wins is forbidden for private notes, confirmation references, dishes, or plan/visit identity.
- Safe automatic merge requires either different entity IDs or proven non-overlapping fields from a shared base revision.
- Deletion wins for the original entity to prevent resurrection.
- A losing private update remains encrypted-in-transit/protected-at-rest as a local recovery copy until the user resolves, exports, or discards it.
- Conflict resolution itself is an idempotent mutation based on the latest server revision.
- No conflict payload is sent to analytics or error logs.

### Offline longer than deletion window

If `lastSuccessfulSyncAt` is older than 90 days:

1. pause outbox replay;
2. pull a full active snapshot and account sync epoch;
3. classify existing-ID local updates absent from the server as potentially deleted;
4. preserve them as recovery copies, not recreated records;
5. allow brand-new entity IDs to merge after validation;
6. require user review before restoring any potentially deleted entity.

---

## 28. Deletion and tombstone behavior

### Consumer language

Never use `tombstone`. Use:

- `Recent deletion`
- `Removed on this device`
- `Waiting to update other devices`
- `This item was removed on another device`

### Creation

- Deleting a synced or potentially synced entity creates a local DeletionMarker in the same transaction.
- Marker records entity type/ID, owner, deletion revision/base revision, deleted timestamp, expiry timestamp, device, schema version, and cascade ID.
- Cloud synchronization writes the equivalent user-owned marker transactionally with the entity deletion.
- A local-only create deleted before any acknowledgment may compact away without a marker when no other device could know the ID.

### Reconciliation

- A valid deletion marker suppresses older/equal updates.
- A newer-looking device timestamp cannot override it.
- Only an explicit user Restore from a recovery copy creates a new entity ID or approved revision.
- Other devices receiving the marker delete/hide the entity and acknowledge the deletion revision.
- Remove-from-Passport uses one cascade ID across bookmark, plan, visits, and memberships.

### Retention and expiry

- Retain markers for 90 days from server-acknowledged deletion.
- Local markers remain until cloud acknowledgment plus the 90-day expiry, or until a device-only marker is no longer needed for any local merge/recovery.
- At expiry, purge marker metadata and any attached deleted private payload.
- Keep only non-content operational audit totals where legally/operationally necessary.
- A device offline beyond 90 days uses the full-rebase behavior in Section 27.

### Account deletion

- Cloud account deletion removes active records, mutation receipts according to account-deletion policy, conflict payloads, and deletion markers through the account cascade.
- Revoke/sign out sessions as part of the account flow; do not assume deleting the auth user instantly invalidates every existing access token.
- Device data remains by default under the approved Stage 1 decision.
- If `Also clear this device’s Passport data` is selected, clear local active records, outbox, markers, backups approved for deletion, and recovery copies only after cloud deletion succeeds.
- Cloud deletion failure never clears local data.

### Export

Export includes a machine-readable `recentDeletions` section with entity type, ID, deleted date, and expiry date—but no deleted private content. Consumer help describes these as recent deletion markers used to keep devices consistent.

---

## 29. Dialog and sheet specifications

### Shared behavior

Every Plan, Visit, Remove, and Conflict surface uses the shared portal/overlay manager:

- accessible title and optional description;
- initial focus;
- forward/reverse focus trap;
- background inertness and `aria-hidden`;
- Escape/backdrop close when safe;
- focus restoration;
- no nested dialogs;
- field-linked errors;
- pending-state close protection;
- dirty-state confirmation;
- reduced-motion treatment.

### Desktop

| Surface | Maximum width | Initial focus |
| --- | ---: | --- |
| Plan create/edit | 560px | Planned date or first invalid field |
| Visit create/edit | 640px | Visit date or first invalid field |
| Remove plan/visit | 520px | Keep/Cancel |
| Remove from Passport | 560px | Cancel |
| Conflict resolution | 720px | Conflict heading/summary |

- Maximum height: `min(90dvh, 760px)`.
- Body scroll belongs to dialog content; title/footer remain visible.
- Actions align right except destructive dialogs, where Cancel precedes the destructive action in reading order.

### Mobile

- 430/390/375px: width is viewport minus 16px gutters, maximum 100%.
- Plan/Visit editors use a near-full-height bottom sheet/full-height dialog with `100dvh` ceiling and safe areas.
- Remove confirmations use a content-height bottom sheet unless consequence content requires expansion.
- On-screen keyboard uses the visual viewport; focused field and error remain visible.
- Sticky footer actions stay inside the sheet and above `env(safe-area-inset-bottom)`.
- No fixed child, input, date control, error summary, or long restaurant name may widen the document.

### Pending close rules

- Local commit in progress: disable close/Escape/backdrop.
- Cloud sync pending after local success: allow close.
- Conflict resolution submit in progress: disable competing choices, keep accessible status.

---

## 30. Form validation

### Plan

- Planned date required for new plans: `Choose a planned date.`
- Past date rejected: `Choose today or a future date.`
- Invalid date: `Enter a valid calendar date.`
- Optional time must be valid `HH:mm`: `Enter a valid time.`
- Known DST gap: `That local time does not occur on this date. Choose another time.`
- Provider length: `Use 80 characters or fewer.`
- Confirmation/reference length: `Use 120 characters or fewer.`
- Planning notes length: `Use 1,000 characters or fewer.`
- Party size has no V1 control or validation.

### Visit

- Visit date required for new records: `Choose the date you visited.`
- Future date rejected: `Visit date cannot be in the future.`
- Invalid date: `Enter a valid calendar date.`
- Migrated undated record may remain undated until the user chooses to add a date.
- Favorite dish item: `Use 80 characters or fewer for each dish.`
- More than 10 dishes: `Add up to 10 favorite dishes.`
- Notes length: `Use 2,000 characters or fewer.`
- Same-day duplicate: non-error confirmation, `A visit is already recorded for this date.`

### Collection-related references

- Collection name: 80 UI characters; 120 storage/cloud characters.
- Collection description: 500 UI characters; 1,000 storage/cloud characters.
- Membership references use stable collection/restaurant IDs and do not introduce another free-text reference field.
- These limits protect journey dependencies; the later Collections redesign may recommend a stricter display limit but may not exceed the storage contract without a migration review.

### Behavior

- Validate on submit and after an interacted field loses focus.
- Do not show all errors on initial open.
- Preserve every valid/invalid value after failure.
- Error text uses stable IDs and `aria-describedby`.
- Invalid controls use `aria-invalid=true`.
- When multiple errors exist, render a concise linked summary and focus it; otherwise focus the first invalid field.
- Do not use only native browser validation bubbles.
- Server/cloud validation errors map to fields when safe; unknown errors remain at form level.

---

## 31. Privacy and security

### Classification

All bookmark notes, plans, visits, collections, confirmation references, conflicts, recovery copies, outbox payloads, and migration metadata are private user data.

### V1 confirmation-reference recommendation

Store confirmation/reference values as ordinary protected private data:

- local plaintext inside the versioned browser store;
- cloud synchronization allowed for signed-in users;
- TLS in transit;
- Supabase user-owned RLS at rest;
- masked in plan summaries by default;
- fully visible only in the editor or an explicit reveal/copy action;
- included in user-requested export with a private-data warning;
- excluded from analytics, logs, notifications, URLs, and error reports.

Local encryption is not recommended for V1 because a same-origin key stored beside ciphertext does not materially protect against an already-compromised origin, while portable key management would make recovery/merge substantially harder. Do not claim end-to-end encryption. Tell users not to store payment-card data, account passwords, or security answers.

### Supabase expectations for future implementation

- Enable RLS on every personal table in an exposed schema.
- Grant only required operations to `authenticated`; Data API exposure/grants and RLS are separate checks.
- Every SELECT/INSERT/UPDATE/DELETE policy scopes rows with `(select auth.uid()) = user_id`.
- UPDATE policies use both `USING` and `WITH CHECK`.
- Collection membership policies also prove collection ownership.
- Do not use user-editable metadata for authorization.
- Never expose service-role/secret keys to the browser.
- Privileged mutation functions require explicit ownership checks, constrained `search_path`, revoked default `PUBLIC` execution, least-privilege grants, and security review; do not add `SECURITY DEFINER` merely to bypass RLS.
- Mutation receipts and deletion markers are user-owned private tables.
- Test cross-user denial and same-user access for every operation.

### Account/device deletion

- Cloud account deletion and device clearing remain separate choices.
- Export is available before either destructive action.
- Private records do not enter public page HTML, metadata, structured data, cache, provider widgets, or search.

### Logging and analytics

Never log or send:

- private/planning/visit notes;
- favorite dishes;
- confirmation references;
- Would return or Personal favorite values;
- collection private descriptions;
- plan/visit dates;
- exact itinerary details;
- conflict payloads;
- exports;
- outbox payloads.

Error reports may include coarse error class, entity type, schema version, attempt count, and opaque mutation ID. Redact all payload values.

### Current platform references

- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Securing the Data API](https://supabase.com/docs/guides/api/securing-your-api)
- [2026 Data API exposure change](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)
- [Automatic transient PostgREST retries](https://supabase.com/changelog/45071-automatic-postgrest-retries-for-transient-errors)

Transport-level retries are useful but do not provide local durability, domain ordering, idempotent cascade semantics, or user-visible recovery; the application outbox remains required.

---

## 32. Loading and pending states

| Operation | Local presentation | Cloud presentation |
| --- | --- | --- |
| Store initialization | Stable action skeleton; no false Unsaved | Pull/reconcile status only on Passport management surfaces |
| Save | `Saving…` for local transaction | Quiet <2s; then pending/offline/failure |
| Plan submit/update | Keep form; `Saving plan…` | Close after local success; contextual sync state |
| Remove plan | `Removing plan…` | Local plan stays hidden; pending recovery if needed |
| Visit submit/update | Keep form; `Saving visit…` | Close after local success; contextual sync state |
| Visit delete | Confirmation shows `Deleting…` | Visit stays hidden; pending recovery if needed |
| Remove from Passport | Dialog shows `Removing…`; lock close | Restaurant hidden after local commit; cascade status in recovery |
| Sign-in merge | Continue showing validated local state; merge notice | Progress/summary; conflicts isolated |
| Outbox replay | No blocking overlay | Small status only if extended/actionable |
| Conflict resolution | Selected choice `Applying…` | Close after local resolution is persisted |

### Principles

- Routine local operations use no long spinner.
- Never clear or replace a full page because one personal mutation is pending.
- Skeleton dimensions remain stable.
- Local commit is the boundary for optimistic success.
- Cloud acknowledgment may update status/revision but may not replay stale UI.
- Buttons retain stable accessible names while visible text changes.

---

## 33. Error and recovery states

| Failure | User behavior | Recovery |
| --- | --- | --- |
| Browser storage unavailable | Passport read-only; no false success | Retry storage, export existing accessible snapshot if possible |
| Local transaction failure | Preserve prior state and form draft | Try again; export/clear space guidance |
| Storage quota exceeded | Preserve last valid snapshot | Export, remove unused local data, retry |
| Authentication expired | Keep local result/outbox | Sign in again; resume |
| Network unavailable | Local actions continue | Retry on online |
| Cloud permission/RLS failure | Pause affected mutation | Sign in/account support; no automatic loop |
| Cloud validation failure | Preserve draft/record locally | Correct mapped field or open recovery |
| Version conflict | Preserve both versions | ConflictResolutionDialog |
| Retry exhausted | Keep local state | Explicit Retry; later online/focus cycle |
| Migration failure | Preserve raw backup and V2-readable recovery | Retry migration/export; do not mark complete |
| Partial cascade response | Local desired deletion remains | Pause scope; idempotent cascade retry and diagnostics |
| Unsupported record schema | Do not rewrite unknown data | Read-only recovery/export and update-app guidance |
| Account removed elsewhere | Stop cloud flush; keep local snapshot | Continue device-only or sign in to another account |

### Draft preservation

- Form drafts survive all recoverable errors while the surface remains open.
- Before route/app reload recovery, persist a local draft only when storage is available and clearly mark it as a draft.
- Drafts never create Planned/Visited until the entity transaction commits.
- Recovery copy retention and deletion are explicit; no private text is silently discarded.

### Error wording

Use precise natural language:

- `Couldn’t save on this device. Your plan has not been added.`
- `Saved on this device. We’ll sync when you’re back online.`
- `Your visit is saved here, but it couldn’t sync. Retry.`
- `This plan changed on another device. Review both versions.`

Avoid `Unknown error`, raw database messages, stack traces, or internal schema terminology.

---

## 34. Desktop layouts

### 1440px

- Restaurant Detail Passport actions fit one intentional row; management actions live in summaries/menus.
- Plan dialog: 560px; Visit: 640px; Conflict: 720px; Remove: 560px.
- Form labels and fields use one column; paired date/time may use a 2:1 two-column row.
- Plan/visit private textareas span the dialog.
- Visit history uses full-width rows with date/summary left and one More menu right.
- Sync recovery panel is bounded to 720px and does not stretch across the page.
- Remove consequences use a semantic list with counts aligned for scanning.

### 1280px

- Same composition with reduced surrounding whitespace.
- Primary Passport action group may wrap after Save without changing priority.
- Dialog widths remain unchanged when viewport gutters stay at least 32px.
- Visit-history metadata may wrap within its row; actions never overlap.

### 1024px

- Compact desktop/tablet-landscape composition.
- Action group uses two rows when needed:
  1. Save + Plan/plan summary + Record/another visit
  2. exceptional sync recovery only
- Dialog maximum width is viewport minus 64px.
- Date/time remain paired only when both fields retain at least 200/140px respectively.
- Conflict comparison uses stacked Device and Synced panels rather than two narrow columns.

### Desktop action hierarchy

- Primary: Save, Plan, Record.
- Existing Plan replaces Plan button with summary trigger.
- Visited state changes Record to `Record another visit`; visit management stays in history.
- Unsave, Remove from Passport, Retry, Edit/Remove plan, Edit/Delete visit are contextual.
- No action row contains more than three Passport actions.

---

## 35. Tablet layouts

### 1024px landscape

- Follow compact desktop rules.
- Touch targets remain at least 44px.
- Modal widths never exceed viewport minus 64px.
- Long private content scrolls inside the dialog.

### 768px portrait

- Primary journey actions use a 2+1 wrap or full-width stack based on label length.
- Plan and Visit use a large centered dialog when a hardware keyboard/landscape affords it; otherwise use the mobile sheet behavior.
- Maximum dialog width: viewport minus 40px.
- Date and time stack when either would fall below a comfortable input width.
- Visit history rows use date/title, concise summary, sync exception, and a 44px More button.
- Conflict versions stack vertically with persistent labels `This device` and `Synced`.
- Remove consequences remain visible without horizontal tables.
- Orientation change preserves draft, focus target, dialog mode, and scroll position.

### Keyboard and browser chrome

- Use `dvh`/visual viewport for overlays.
- Recalculate sheet height on orientation/keyboard changes without closing or resetting fields.
- Sticky actions remain reachable above the software keyboard.

---

## 36. Mobile layouts

### Shared 430/390/375px contract

- No horizontal document overflow.
- Sheet width is `calc(100vw - 16px)` with safe-area-aware margins.
- Long restaurant/collection names wrap; they never widen controls.
- Native date/time inputs use `min-width:0; max-width:100%`.
- Sticky action footer respects `env(safe-area-inset-bottom)`.
- Main content gets enough bottom padding that fixed/sticky actions never cover the last field.
- All controls are at least 44px high/wide.

### 430px

- Plan/Visit editors use one-column fields and a near-full-height sheet.
- Footer may place Cancel and Save side by side when both labels fit at 44px height.
- Visit history supports two concise metadata lines plus More.
- Remove consequences may use a compact two-column count/label list only when it fits.

### 390px

- Actions stack when three primary labels cannot fit without truncation.
- Plan/Visit footer actions stack full width if software keyboard reduces usable width.
- Date and time are always separate rows.
- Conflict choices use full-width buttons after each version preview.
- No filter/dialog-style 212px width constraint may be inherited.

### 375px

- All modal actions stack full width.
- Destructive label `Remove everything from Passport` wraps to two lines within a minimum 48px button.
- Visit-history count/date and More control remain within one-dimensional flow.
- Error-summary links wrap without forcing width.
- Confirmation/reference masking/copy controls use a new row when necessary.

### Mobile action placement

- Restaurant Detail may use the approved sticky action area for Reserve/Save, while Plan/Record remain immediately below identity; opening a journey sheet hides the sticky bar.
- Explore cards, Map previews, and related cards expose Save only.
- Passport/Saved/Planned/Visited/Collections rows use one primary contextual action plus a More menu; full forms open in shared sheets.

---

## 37. Accessibility requirements

- Every action name includes restaurant context when ambiguity is possible.
- Save uses `aria-pressed`; Plan/Visit summary triggers do not pretend to be toggles.
- Status announcements distinguish local success, pending, failure, and conflict.
- One polite live region per action scope prevents duplicate announcements.
- Errors use assertive announcement only after a failed action/submit.
- Dialogs/sheets provide focus trap, initial focus, Escape handling, background inertness, and focus restoration.
- Destructive dialogs initially focus Cancel and state exact consequences.
- Field labels use native `<label>` relationships.
- Hint/error IDs are included in `aria-describedby`.
- Error summaries link to invalid fields.
- Date/time controls have explicit format/context labels; date errors never rely on native formatting alone.
- Visit-history items use semantic list/article structure; More menus support keyboard navigation and Escape.
- Touch targets are approximately 44px.
- Focus rings are visible, contrast-compliant, and unclipped.
- Pending/sync meaning never depends on spinner, icon, or color alone.
- Reduced motion removes sheet transitions and status animation but not state changes.
- Private confirmation/reference is masked in summaries and its reveal state is announced.
- Screen-reader copy for an undated migrated visit is `Visited. Date not recorded.`
- Conflict comparison labels each version before its content.
- At 200% zoom/effective 320px, forms remain one-dimensional and usable.
- Mobile keyboard appearance does not hide the focused field, error, or submit action.

---

## 38. Performance architecture

### State boundary

- Hydrate personal state by restaurant ID/slug and record IDs, not by full restaurant catalog.
- Public restaurant summaries remain server/route-owned.
- Passport provider owns only V3 entities, derived indexes, command functions, outbox, auth mode, and sync state.
- Components subscribe to per-restaurant selectors so one Save does not rerender every card.

### Local reads/writes

- Maintain indexes:
  - bookmark by restaurant;
  - active plan ID by restaurant;
  - visit IDs by restaurant sorted by date;
  - membership IDs by restaurant/collection;
  - outbox IDs by entity/status/sequence.
- Validate/migrate once at bootstrap, not on every selector.
- Persist one transactional snapshot; debounce only non-critical derived cache writes, never domain/outbox commits.
- Broadcast compact entity-change messages across tabs.

### Cloud

- Batch eligible mutation acknowledgments when dependency order allows.
- Do not reload the full Passport after every mutation.
- Apply returned entity revisions/receipts to affected IDs only.
- Request cancellation/stale-response protection prevents an old pull replacing newer local state.
- Authenticated personal responses are uncached/shared with no public cache.

### Visit history

- Render 10 recent visits, then 20 per explicit request.
- Do not ship all private notes into global Visited cards.
- Fetch/hydrate full visit details only on history/editor surfaces.
- Virtualization is unnecessary in V1 unless measured histories justify it.

### UI stability

- Optimistic labels reserve stable space.
- Sync messages insert in bounded status regions.
- Dialog/sheet dimensions remain stable across loading/error.
- No global client island receives the restaurant catalog.

### Multi-tab

- `BroadcastChannel` when available; storage-event fallback.
- One short-lived outbox leader lease per owner scope.
- Lease expiration/fencing token prevents two leaders from acknowledging the same sequence as current.
- Idempotent server receipts remain the final duplicate protection.

---

## 39. Analytics events

Use consent-aware, coarse events:

| Event | Allowed properties |
| --- | --- |
| `restaurant_saved` | restaurant slug, surface, device/cloud mode |
| `restaurant_unsaved` | restaurant slug, surface |
| `remove_passport_opened` | restaurant slug, dependency type counts |
| `restaurant_removed_passport` | restaurant slug, dependency type counts, offline flag |
| `plan_form_opened` | restaurant slug, create/edit, surface |
| `plan_created` | restaurant slug, has_time/provider/confirmation/notes booleans only |
| `plan_edited` | restaurant slug, changed-field categories only |
| `plan_removed` | restaurant slug, overdue boolean |
| `visit_form_opened` | restaurant slug, first/another/from-plan |
| `visit_created` | restaurant slug, from-plan, completed-plan boolean |
| `visit_edited` | restaurant slug, changed-field categories only |
| `visit_deleted` | restaurant slug, remaining-count bucket |
| `another_visit_added` | restaurant slug, prior-count bucket |
| `sync_pending_visible` | entity category, offline flag |
| `sync_failed` | entity category, coarse error class, attempt bucket |
| `sync_retry_selected` | entity category, failure class |
| `passport_merge_completed` | local/cloud/merged count buckets, conflict count |
| `conflict_resolution_opened` | entity type, conflict class |

### Exclusions

Never send:

- dates/times;
- notes or text length precise enough to fingerprint;
- favorite dishes;
- confirmation/reference;
- Would return or Personal favorite;
- collection names/descriptions;
- conflict payloads;
- mutation payloads;
- exact itinerary;
- exported data;
- user email/account identifiers beyond the analytics system’s approved pseudonymous scope.

No event fires for every automatic retry attempt; log exhaustion/actionable failure to avoid noise.

---

## 40. Conceptual data types

These types refine the approved Stage 1 model. They are conceptual and do not authorize implementation.

```ts
type IsoDate = `${number}-${number}-${number}`;
type IsoTime = `${number}:${number}`;
type IsoTimestamp = string;
type RecordId = string;
type RestaurantSlug = string;
type DeviceId = string;
type UserId = string;

type OwnerScope =
  | { mode: "device"; deviceId: DeviceId; userId: null }
  | { mode: "account"; deviceId: DeviceId; userId: UserId };

type EntityType =
  | "bookmark"
  | "plan"
  | "visit"
  | "collection"
  | "collectionMembership";

type RecordSyncMetadata = {
  revision: number;
  serverRevision: number | null;
  createdAt: IsoTimestamp;
  updatedAt: IsoTimestamp;
  deletedAt: IsoTimestamp | null;
  createdByDeviceId: DeviceId;
  lastMutatedByDeviceId: DeviceId;
  privacy: "private";
};

type PassportBookmark = RecordSyncMetadata & {
  id: RecordId;
  owner: OwnerScope;
  restaurantSlug: RestaurantSlug;
  privateNote: string;
  legacyFavorite: boolean;
  migration: MigrationMetadata | null;
};

type RestaurantPlan = RecordSyncMetadata & {
  id: RecordId;
  owner: OwnerScope;
  restaurantSlug: RestaurantSlug;
  plannedDate: IsoDate | null;
  datePrecision: "day" | "unknown";
  plannedTime: IsoTime | null;
  timeZone: string | null; // reviewed IANA zone when known
  timeZoneSource: "restaurant" | "device" | "unknown";
  reservationProvider: string | null;
  confirmationReference: string | null;
  privateNotes: string;
  migration: MigrationMetadata | null;
};

type RestaurantVisit = RecordSyncMetadata & {
  id: RecordId;
  owner: OwnerScope;
  restaurantSlug: RestaurantSlug;
  visitedAt: IsoDate | null;
  datePrecision: "day" | "unknown";
  favoriteDishes: string[];
  privateNotes: string;
  wouldReturn: boolean | null;
  personalFavorite: boolean;
  legacyPersonalRating: 1 | 2 | 3 | 4 | 5 | null; // migration-only
  legacySourceKey: string | null;
  migration: MigrationMetadata | null;
};

type CollectionMembership = RecordSyncMetadata & {
  id: RecordId;
  owner: OwnerScope;
  collectionId: RecordId;
  restaurantSlug: RestaurantSlug;
  position: number;
};

type PassportMutation = {
  id: RecordId;
  owner: OwnerScope;
  entityType: EntityType | "restaurantCascade";
  entityId: RecordId;
  operation:
    | "create"
    | "update"
    | "delete"
    | "remove_restaurant_cascade"
    | "acknowledge_conflict_resolution";
  payload: unknown;
  baseServerRevision: number | null;
  localRevision: number;
  clientSequence: number;
  dependencyIds: RecordId[];
  idempotencyKey: string;
  cascadeId: RecordId | null;
  createdAt: IsoTimestamp;
  attemptCount: number;
  lastAttemptAt: IsoTimestamp | null;
  nextRetryAt: IsoTimestamp | null;
  status:
    | "queued"
    | "in_flight"
    | "retry_scheduled"
    | "blocked"
    | "conflict"
    | "exhausted";
  lastErrorClass:
    | "offline"
    | "transient"
    | "auth"
    | "permission"
    | "validation"
    | "conflict"
    | "unknown"
    | null;
  schemaVersion: 3;
};

type DeletionMarker = {
  id: RecordId;
  owner: OwnerScope;
  entityType: EntityType;
  entityId: RecordId;
  restaurantSlug: RestaurantSlug | null;
  cascadeId: RecordId | null;
  baseServerRevision: number | null;
  deletionRevision: number | null;
  deletedAt: IsoTimestamp;
  expiresAt: IsoTimestamp; // 90 days after server acknowledgment
  createdByDeviceId: DeviceId;
  serverAcknowledgedAt: IsoTimestamp | null;
  schemaVersion: 3;
};

type SyncRevision = {
  owner: OwnerScope;
  entityType: EntityType | "account";
  entityId: RecordId;
  serverRevision: number;
  accountSyncEpoch: number;
  acknowledgedMutationId: RecordId | null;
  acknowledgedAt: IsoTimestamp;
  serverTimestamp: IsoTimestamp;
};

type MigrationMetadata = {
  sourceSchemaVersion: 1 | 2;
  sourceRecordKey: string;
  migratedAt: IsoTimestamp;
  provenance:
    | "saved"
    | "want_to_bookmark"
    | "planned"
    | "visited"
    | "visit_evidence"
    | "favorite_to_bookmark"
    | "generic_note_to_bookmark"
    | "collection_membership";
  dateWasUnknown: boolean;
  warningCodes: Array<
    | "legacy_favorite_preserved_as_bookmark"
    | "legacy_visit_created_with_unknown_date"
    | "legacy_note_preserved_as_bookmark_note"
    | "legacy_rating_preserved"
    | "unknown_restaurant_slug"
  >;
};
```

### Ownership/local-cloud representation

- Device-only records use a stable local `deviceId` and `userId=null`.
- On sign-in merge, stable entity IDs remain; owner scope becomes account-bound only after successful classification/merge.
- Cloud rows store `user_id`; device IDs are metadata, never authorization.
- Supabase authorization is always based on authenticated ownership, not device ID.
- Payload serialization carries schema version and validates every field/limit before persistence.

---

## 41. Component architecture

```text
PassportJourneyProvider (client, no catalog)
├── JourneySelectors
├── PassportCommands
├── OutboxCoordinator
├── MultiTabCoordinator
└── SyncStatusRegion

Shared lightweight actions
├── SaveButton
├── PassportActionGroup
└── SyncStatusMessage

Planning
├── PlanVisitDialog
│   ├── RestaurantIdentitySummary
│   ├── PlanFields
│   ├── PrivacyHint
│   └── FormErrorSummary
└── PlanSummaryCard
    └── PlanManagementMenu

Visits
├── VisitEditorDialog
│   ├── RestaurantIdentitySummary
│   ├── VisitFields
│   ├── PlanCompletionControl
│   ├── PrivacyHint
│   └── FormErrorSummary
├── VisitHistory
│   ├── VisitHistoryItem
│   └── LoadEarlierVisits
└── VisitManagementMenu

Destructive/recovery
├── RemoveFromPassportDialog
├── SyncRecoveryPanel
├── DeviceOnlyNotice
├── ConflictResolutionDialog
└── MigrationRecoveryPanel
```

### Surface matrix

| Surface | Save | Plan | Visit | History/management | Sync exception |
| --- | --- | --- | --- | --- | --- |
| Restaurant Detail | Full | Open/summary | Open/another | Conditional Your Passport | Contextual |
| Passport | Summary/action | Summary/edit | Summary/history | Full | Global + entity recovery |
| Saved | Full Save/Unsave rules | Open | Open | More menu | Contextual |
| Planned | Saved implied | Summary/edit/remove | Record this visit | More menu | Contextual |
| Visited | Saved implied | Open/summary | Record another | Full history entry | Contextual |
| Collections | Saved implied | Link/open where earned | Link/open where earned | Membership management | Contextual |
| Explore card | Save only | None | None | None | Failure/retry only |
| Map preview | Save only | None | None | None | Failure/retry only |
| Related card | Save only | None | None | None | Failure/retry only |

Explore, Map, and related cards never mount Plan/Visit forms or full histories.

---

## 42. Server/client boundaries

| Responsibility | Boundary | Reason |
| --- | --- | --- |
| Public restaurant identity | Server/route | Stable, public, cacheable |
| Initial signed-in personal summary when route supports it | Server-authenticated bounded payload | Faster truthful first render |
| Device-only local records | Client | Browser-owned data |
| Journey selectors/commands | Client domain module | Local-first interaction |
| Local persistence/outbox | Client adapter | Offline durability |
| Save/Plan/Visit/Remove UI | Focused client islands | Interaction/forms |
| Outbox flush endpoint/RPC | Server/Supabase boundary | Auth, transaction, revisions, receipts |
| Conflict classification | Shared deterministic domain logic; server validates | Same rules, authoritative revisions |
| RLS/ownership/transaction | Database | Cross-user isolation and atomic cloud apply |
| Analytics emission | Client/server adapter with redaction | No private payload leakage |
| Export assembly | Client for device-only; authenticated server for cloud; combined locally | Correct ownership/private data |

### Rules

- Do not hydrate entire Restaurant Detail, Explore, Map, or Passport pages for journey actions.
- Do not put full catalog data in PassportJourneyProvider.
- Server HTML/metadata never contain private notes, confirmation references, visits, conflicts, or outbox payloads.
- Cloud mutation endpoints accept versioned validated commands, not arbitrary table patches.
- Server acknowledgment contains mutation receipt, authoritative revision, and safe error classification—never another user’s content.

---

## 43. Files likely to change

This is a future implementation forecast, not authorization to edit these files.

### Existing local/domain boundary

- `src/lib/passport/types.ts`
- `src/lib/passport/store.ts`
- `src/lib/passport/PassportProvider.tsx`
- `src/components/passport/PassportClientShell.tsx`
- `src/lib/personal-data/repository.ts`
- `src/lib/personal-data/local-adapter.ts`
- `src/lib/personal-data/merge.ts`
- `src/lib/personal-data/migration-state.ts`
- `src/app/personal-data/actions.ts`

### Likely new focused V3 modules

- `src/lib/passport-v3/types.ts`
- `src/lib/passport-v3/schema.ts`
- `src/lib/passport-v3/derive.ts`
- `src/lib/passport-v3/commands.ts`
- `src/lib/passport-v3/dependencies.ts`
- `src/lib/passport-v3/outbox.ts`
- `src/lib/passport-v3/compaction.ts`
- `src/lib/passport-v3/sync.ts`
- `src/lib/passport-v3/conflicts.ts`
- `src/lib/passport-v3/migrate.ts`
- `src/lib/passport-v3/export.ts`
- `src/lib/passport-v3/local-repository.ts`
- `src/lib/passport-v3/selectors.ts`
- `src/lib/passport-v3/multi-tab.ts`

### Shared interaction components

- replace `src/components/stitch/restaurant-detail/JourneyControls.tsx`
- replace `PlanningDetailsDialog.tsx`
- replace `VisitDetailsDialog.tsx`
- replace `RestaurantJourneySection.tsx`
- update `src/components/stitch/restaurant/SaveAction.tsx`
- likely new `src/components/passport-actions/SaveButton.tsx`
- `PassportActionGroup.tsx`
- `PlanVisitDialog.tsx`
- `PlanSummaryCard.tsx`
- `VisitEditorDialog.tsx`
- `VisitHistory.tsx`
- `VisitHistoryItem.tsx`
- `RemoveFromPassportDialog.tsx`
- `SyncStatusMessage.tsx`
- `SyncRecoveryPanel.tsx`
- `DeviceOnlyNotice.tsx`
- `ConflictResolutionDialog.tsx`
- `MigrationRecoveryPanel.tsx`
- shared form field/error-summary primitives

### Consuming surfaces

- Restaurant Detail components from Stage 6
- `src/components/stitch/passport/*`
- `src/components/stitch/collections/*`
- Explore card/save components
- Map preview/result components
- Related restaurant card components
- `src/app/(passport)/passport/page.tsx`
- `src/app/(passport)/saved/page.tsx`
- `src/app/(passport)/planned/page.tsx`
- `src/app/(passport)/visited/page.tsx`
- collection routes

### Future database/migration boundary

- new imperative Supabase migration created through the approved workflow
- `src/lib/supabase/database.types.ts`
- future transactional mutation RPC/server action
- future RLS/grant/pgTAP tests

Stage 7 does not create or name the final migration file. At implementation time, discover the then-current Supabase CLI workflow and create the migration through that workflow rather than inventing a timestamp.

### Tests/evidence

- `e2e/passport.spec.ts`
- `e2e/restaurant-detail.spec.ts`
- `e2e/collections.spec.ts`
- Explore/Map save tests
- `scripts/test_passport_merge.mjs`
- `scripts/test_passport_phase8.mjs`
- `scripts/test_collections_phase9.mjs`
- likely new V3 migration, command, outbox, conflict, and accessibility tests
- Stage 7 screenshot capture script/evidence directory

---

## 44. Existing components to reuse

- Shared `Button` visual variants after pending/destructive semantics are verified.
- Shared Dialog visual language, upgraded to the Stage 1 portal/focus contract.
- Shared Input typography/tokens, upgraded to stable IDs, descriptions, and errors.
- Canonical restaurant identity summaries and Michelin distinction text.
- `PassportSyncNotice` placement concepts, simplified to exceptional/status-aware messaging.
- `DeviceSaveNotice` account/settings placement, with less repetition.
- Current export/account deletion entry points, updated for V3 content and separate device/cloud choices.
- Current Supabase authenticated session boundary.
- Current local migration backup pattern.
- Existing collection dialogs/menu primitives after invariant-aware commands replace direct patches.
- Stage 6 Passport action placement and conditional Your Passport section.
- Stage 1 route-specific personal-summary boundary.

Reuse styling and trustworthy boundaries; do not reuse boolean-state assumptions or fire-and-forget mutations.

---

## 45. Components to retire

- `UserRestaurantRecord` aggregate as the active domain model.
- `saved`, `wantToVisit`, `planned`, `visited`, and `favorite` independent flags.
- restaurant-level Favorite action/state.
- Want action/state.
- one `visitDate`, one note, one rating, and one dishes array per restaurant.
- current five-control `JourneyControls`.
- Planned/Visited `aria-pressed` toggles.
- duplicate `Add planning details` and `Record visit` links.
- current Plan dialog with optional/unvalidated date and immediate close.
- current Visit dialog that overwrites one record.
- direct component calls to `updateRestaurant(slug, patch)`.
- fire-and-forget `void upsertCloudRestaurant(...)`.
- boolean-OR/timestamp-based aggregate merge as the V3 strategy.
- always-visible `Synced with your account` copy on every detail journey summary.
- collection arrays that can contain an unbookmarked restaurant.
- destructive `removeRestaurant` without dependency summary.
- tests and screenshots that require Want, top-level Favorite, or one-visit overwrite.

Legacy V2 readers/migration code remain only for the approved transition and are retired in a separately reviewed cleanup after reconciliation.

---

## 46. Migration dependencies

### Blocking dependencies

1. Approved Stage 1 V3 record architecture.
2. Future local V2→V3 deterministic migration and backup.
3. Future Supabase tables for bookmarks, plans, visits, memberships, mutation receipts, and deletion markers.
4. Future user-owned RLS and least-privilege grants.
5. Future transactional/idempotent mutation endpoint with server revisions.
6. Feature flag/cohort rollout and reconciliation.
7. Updated route-specific personal hydration.

### Local migration requirements

- Exact raw V2 backup before first V3 write.
- Deterministic legacy visit IDs/source keys.
- Want→bookmark.
- Favorite-only→bookmark provenance, not visit.
- Completed-visit evidence→dated/undated visit.
- Generic note→bookmark note.
- Collection member→bookmark + membership.
- Unknown restaurant slug retained in backup/recovery report.
- Migration rerun creates no duplicate records.
- Validate persisted V3 before setting completion flag.

### Cloud migration requirements

- Imperative migration workflow is currently in use; implementation must confirm the contemporary CLI/documentation before changes.
- New personal tables in exposed schemas require explicit Data API grants where project settings do not expose them automatically; grants do not replace RLS.
- Every personal table enables RLS with own-row policies.
- One-active-plan uniqueness is enforced in the database.
- Membership cannot outlive bookmark.
- Mutation receipts enforce idempotency.
- Backfill is repeatable and reconciled before legacy write freeze.
- Old/new application concurrency is addressed during rollout.
- No legacy table or local backup is dropped in the first V3 release.

### Launch gates

- Migration fixture matrix passes.
- Local/cloud counts reconcile.
- Cross-user RLS tests pass.
- Outbox survives reload/offline.
- 90-day deletion behavior is tested with simulated time.
- Current V2 app can coexist safely during rollout.
- Feature flag rollback does not delete V3 or legacy data.

---

## 47. Risks and unknowns

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Aggregate legacy rows do not map cleanly | High | Evidence-based deterministic migration, backups, warnings, no fabricated visits/dates |
| Remove from Passport destroys meaningful history | High | Dependency summary, explicit destructive flow, initial focus Cancel, atomic cascade |
| Deleted records return from stale devices | High | 90-day markers, revisions, full rebase after retention window |
| Private notes lost in conflict | High | Base revisions, preserve both, explicit resolution/recovery export |
| One active plan conflicts across devices | High | Server uniqueness, acknowledged plan stays active, device draft preserved |
| Fire-and-forget behavior survives in one surface | High | One command/outbox API; surface matrix and tests across all consumers |
| Browser storage failure appears as empty Passport | High | Distinct unavailable/read-only state; preserve last valid snapshot |
| LocalStorage quota from long history | Medium | Practical limits, compact indexes/outbox, explicit history loading, export/cleanup |
| Confirmation references expose sensitive data | High | Optional, masked, RLS, log/analytics redaction, no URLs, clear plaintext limitation |
| Party size/time turns Passport into reservation management | Medium | Exclude party size; time remains optional intention metadata |
| Date shifts across time zones | High | Date-only storage, wall time + zone snapshot, no UTC conversion |
| DST makes plan time invalid | Medium | Validate known zone gaps; retain wall time semantics |
| Same-day visits duplicate accidentally | Medium | Warn/explicitly confirm; never auto-merge |
| Merge overwhelms first-time sign-in | Medium | Auto-merge safe cases; concise summary; conflict flow only when needed |
| Collection-name collision merges unrelated intent | Medium | Preserve both with device suffix; no name-only merge |
| Outbox compaction drops required deletion | High | Receipt/base-revision-aware compaction; never remove potentially needed cloud delete |
| Multiple tabs race | Medium | Leader lease/fencing, BroadcastChannel, server idempotency |
| Cloud client retries plus outbox duplicate requests | Low | Mutation receipts make repeats safe; application controls semantic retry state |
| Overdue plan nags users | Medium | No modal/push; one 30-day continuation; Planned page retains it |
| Legacy numeric rating is silently lost | Medium | Preserve as migration-only private value/export; no V1 rating UI |
| RLS/grant mismatch exposes or blocks records | High | Explicit grants + own-row RLS + UPDATE checks + cross-user tests |
| Old access tokens survive account deletion briefly | High | Session revocation/sign-out and sensitive-operation verification in future account work |
| Stage 7 grows into Passport/Collections redesign | Medium | Keep page composition outside scope; define only shared interaction contracts |

### Unknowns requiring measured validation

- Maximum real visit-history size and local snapshot byte growth.
- Browser quota behavior on target mobile browsers.
- Whether current analytics can deduplicate local/sync events without new infrastructure.
- Exact server mutation batching limit.
- Operational definition of known devices for deletion reconciliation.
- Whether restaurant time zones are available for all mapped/unmapped catalog records.

---

## 48. Test matrix

### Save

| Case | Expected |
| --- | --- |
| Device-only Save | Bookmark persists; `Saved on this device` in management context |
| Signed-in Save | Bookmark + one outbox mutation; quiet after ack |
| Offline Save | Local success; immediate offline/pending message |
| Duplicate click/rapid tap | One bookmark, one logical mutation |
| Two tabs Save | One effective entity; idempotent receipt |
| Sync success | Outbox removed only after durable ack |
| Sync transient failure | Retry schedule; local Saved preserved |
| Retry exhaustion | Retry action visible |
| Reload before ack | Bookmark and outbox recover |
| Local storage failure | No Saved claim |

### Unsave

| Case | Expected |
| --- | --- |
| Bookmark only | Immediate simple Unsave |
| Bookmark create then Unsave before ack | Safe compaction when never on server |
| Active plan dependency | Block; show Manage plan/Remove Passport |
| One/multiple visits | Block with exact count |
| Collection membership | Block with collection context |
| Bookmark private note | Block |
| Multiple dependencies | Combined summary |
| Sync conflict | Block until recovery/destructive flow |

### Plan

| Case | Expected |
| --- | --- |
| Create valid future plan | Bookmark + one active plan |
| Same-day plan | Valid |
| Past date | Rejected for new plan |
| Missing date | Rejected for new plan |
| Optional time known zone | Wall time/zone retained |
| DST nonexistent time | Field error |
| Unknown time zone | Time as entered, no conversion |
| Edit all fields | New revision, one compacted mutation |
| Dirty close | Discard confirmation |
| Offline edit | Local update/pending |
| Remove date-only plan | No modal required; bookmark remains |
| Remove plan with notes/confirmation | Confirmation required |
| Overdue plan | No auto-visit; three recovery actions |
| Legacy undated plan | Visible; date required on substantive edit |
| Existing visits + plan | Both summaries preserved |
| Active-plan conflict | One active, second draft preserved |

### Visit

| Case | Expected |
| --- | --- |
| First visit | Bookmark + new visit ID |
| Same-day/past visit | Valid |
| Future date | Rejected |
| Multiple visits | Separate records/count/latest |
| Record another | New UUID; no overwrite |
| Same-day duplicate | Explicit confirmation, both allowed |
| Edit one visit | Others unchanged |
| Delete one | Others/plan/bookmark/memberships unchanged |
| Delete last | Visited false; Saved remains |
| Undated migrated visit | Date-not-recorded label/edit/delete |
| Favorite/Would return | Visit-only |
| Legacy rating | Preserved privately, no V1 control |
| Offline create/edit/delete | Local success/outbox recovery |
| Same-ID conflict | Both payloads preserved |

### Record from active plan

| Case | Default |
| --- | --- |
| Exact date | Complete plan checked |
| 1–7 days after | Checked with suggestion |
| Before plan | Unchecked |
| >7 days after | Unchecked |
| Separate future plan | Unchecked |
| Undated plan | Unchecked |
| User changes checkbox | Choice remains authoritative |
| Checked commit | Visit create + plan delete atomically |
| Unchecked commit | Plan preserved |

### Remove from Passport

| Case | Expected |
| --- | --- |
| Bookmark only | Exact one-record summary |
| Plan | Plan included; external reservation disclaimer |
| One/multiple visits | Exact count and private-detail summary |
| Collections | Memberships removed; collections preserved |
| Notes/confirmation | Private details named generically |
| Offline | Local cascade; pending sync |
| Local failure | Nothing removed; dialog retained |
| Cloud transient failure | Local deletion retained; retry |
| Partial/inconsistent response | Pause scope; no cross-device success claim |
| Tombstone reconciliation | Stale device cannot resurrect |

### Merge/conflict

| Case | Expected |
| --- | --- |
| Local only | Queued to cloud |
| Cloud only | Pulled locally |
| Identical | No-op |
| Distinct visits | Additive |
| Conflicting plan | User review; one active |
| Conflicting visit | Keep device/cloud/duplicate |
| Delete vs edit | Delete wins; edit recovery copy |
| Same collection name/different IDs | Preserve both; device suffix |
| Pending outbox already receipted | Mark acknowledged, no replay |
| Offline >90 days | Full rebase; no stale auto-replay |

### Synchronization/outbox

- Dependency ordering
- Queue compaction for every lifecycle
- Retry backoff/jitter
- Auth pause/resume
- Validation non-retry
- Receipt idempotency
- Stale acknowledgment protection
- Multi-tab leader failover/fencing
- Server revision over device timestamp
- Reload recovery
- Conflict-resolution mutation
- Marker expiry with simulated time

### Accessibility/responsive

- Keyboard-only Save/Plan/Visit/Remove
- Screen-reader action/status labels
- Dialog initial focus/trap/Escape/restoration
- Focus restoration after close, cancellation, success, and visit deletion
- Dirty-state dialog
- Field/error association
- Error-summary links
- Destructive consequence announcement
- Mobile software keyboard
- 200% zoom/effective 320px
- Reduced motion
- No horizontal overflow at 430/390/375
- 44px targets
- Private reference masking/reveal

---

## 49. Acceptance criteria

### Domain/state

- [ ] Bookmark, active plan, visits, memberships, outbox, deletion markers, revisions, and migration provenance are distinct records.
- [ ] Want and restaurant-level Favorite do not exist in V1 UI/domain.
- [ ] Consumer Unsaved/Saved/Planned/Visited states derive exactly from active records.
- [ ] Planned and Visited may display together.
- [ ] One active plan and multiple visits are supported.
- [ ] Corrupt dependent-without-bookmark state enters repair rather than false Unsaved.

### Save/Unsave/removal

- [ ] Save commits locally before cloud and is idempotent.
- [ ] Device-only use never requires sign-in.
- [ ] Normal successful sync stays quiet.
- [ ] Simple Unsave is allowed only with no plan, visits, memberships, bookmark note, or unresolved dependent recovery.
- [ ] Blocked Unsave names actual dependencies and offers relevant management.
- [ ] Remove from Passport names plan/visit/note/collection consequences.
- [ ] Destructive cascade is atomic locally and transactionally/idempotently applied in cloud.
- [ ] Offline removal remains locally effective and visibly pending.
- [ ] Collections remain while memberships are removed.

### Plans

- [ ] New plan date is required and current/future.
- [ ] Optional time uses wall-time/IANA-zone semantics without UTC date shifts.
- [ ] Party size is absent from V1.
- [ ] Provider, confirmation/reference, and notes are optional/private/limited.
- [ ] Selecting Plan ensures Save.
- [ ] Existing plan opens summary/edit instead of duplicating.
- [ ] Remove plan preserves bookmark/visits/memberships and disclaims external reservation cancellation.
- [ ] Overdue plan never becomes Visited automatically.

### Visits

- [ ] New visit date is required and cannot be future.
- [ ] Selecting Record ensures Save.
- [ ] Every visit has its own stable ID.
- [ ] Repeat visits never overwrite history.
- [ ] Same-day duplicates require confirmation but remain possible.
- [ ] Favorite dishes, notes, Would return, and Personal favorite belong to the visit.
- [ ] Numeric rating/public review/photos/spending/companions/meal/service rating are absent from V1 forms.
- [ ] Undated migrated visits display `Visited · Date not recorded`.
- [ ] Delete one visit preserves all unrelated records.

### Plan-to-visit

- [ ] Exact/near plan-date logic sets only a default suggestion.
- [ ] User choice controls whether the plan completes.
- [ ] Checked completion creates visit and removes plan atomically.
- [ ] An unrelated future plan remains.
- [ ] Confirmation/plan notes are never copied into visit notes.

### Sync/merge/conflicts

- [ ] Durable outbox survives reload/offline.
- [ ] Mutation receipts and idempotency prevent duplicate writes.
- [ ] Queue compaction never drops a needed cloud deletion.
- [ ] Pending appears only after threshold or immediately offline.
- [ ] Initial attempt plus five scheduled retries/backoff and explicit Retry are defined.
- [ ] Server revisions, not device clocks, decide concurrency.
- [ ] Safe merges are automatic; meaningful conflicts preserve both versions.
- [ ] Deletion wins original-entity conflicts while private edits remain recoverable.
- [ ] Devices offline beyond 90 days rebase before replay.
- [ ] Recent deletion markers prevent resurrection and expire at 90 days.

### Privacy/security

- [ ] Private fields never enter public HTML, metadata, provider UI, analytics, or logs.
- [ ] Confirmation references are optional, masked, RLS-protected in cloud, and plaintext limitation is disclosed.
- [ ] All future personal tables have own-row RLS and least-privilege grants.
- [ ] UPDATE ownership uses both existing-row and new-row checks.
- [ ] Cross-user access tests fail closed.
- [ ] Account deletion and device clearing remain separate.

### Accessibility/responsive/performance

- [ ] Dialogs/sheets meet focus, inertness, validation, pending, and restoration contracts.
- [ ] All action/status names are understandable without icons/color.
- [ ] Touch targets are approximately 44px.
- [ ] No horizontal overflow at 430, 390, or 375px.
- [ ] No 212px mobile sheet regression.
- [ ] Software keyboard leaves fields/errors/actions reachable.
- [ ] Personal state hydrates by identifiers without a global catalog.
- [ ] One mutation does not rerender every restaurant card.
- [ ] Visit history loads incrementally.

---

## 50. Screenshot verification plan

### Baseline evidence

Compare against:

- Stage 1 Restaurant Detail and Passport captures.
- Current Passport Saved/Planned/Visited baselines.
- Existing plan/visit dialogs at 1440 and 390.
- Current collection dependency/removal dialogs.

### Required widths

Capture representative states at:

- 1440×900
- 1280×900
- 1024×900
- 768×1024
- 430×932
- 390×844
- 375×812

### Save/Unsave states

- Unsaved
- Saving locally
- Saved device-only
- Saved signed-in/quiet
- Pending >2s
- Offline
- Retry exhausted
- Dependency-free Unsave
- Blocked by plan
- Blocked by one/multiple visits
- Blocked by collections
- Blocked by bookmark note
- Multiple dependencies

### Plan states

- Create empty
- Validation errors
- Optional time/provider/reference/notes
- Known DST error
- Existing plan summary
- Edit dirty-state warning
- Overdue plan
- Remove date-only plan
- Remove plan with private details
- Plan conflict
- Device-only/offline pending

### Visit states

- First visit
- Multiple visits/history
- Record another
- Same-day duplicate warning
- Edit dated visit
- Edit undated migrated visit
- Delete dated/undated visit
- Would return unset/yes/no
- Personal favorite
- Visit conflict versions

### Record-from-plan states

- Exact date/checked
- Near date/checked suggestion
- Separate future plan/unchecked
- User override
- Completed plan result
- Preserved plan result

### Remove from Passport

- Bookmark only
- Plan + notes/reference
- One visit
- Multiple visits
- Collections
- All dependency types
- Pending removal
- Cloud failure/retry
- Partial-consistency recovery

### Merge/sync/recovery

- Conflict-free sign-in summary
- Plan conflict
- Visit conflict with duplicate option
- Collection-name collision
- Authentication expired
- Storage unavailable
- Quota exceeded
- Migration failure
- Offline >90-day rebase

### Interaction evidence

- Keyboard focus sequence
- Initial focus on Cancel for destructive actions
- Focus trap/restoration
- Error-summary navigation
- Screen-reader status snapshots
- Reduced-motion sheets
- Software keyboard at 430/390/375
- 200% zoom
- Document width measurements
- Sticky footer/safe-area measurements
- Multi-tab status coherence
- No private values in analytics/network logs beyond authorized mutation payload

### Blocking visual checks

- No five-flag control row.
- No Want or top-level Favorite.
- No duplicate Plan/Visited actions.
- Mobile sheet uses available viewport width.
- Long restaurant names and destructive copy wrap.
- Pending/failed sync is visible without dominating normal cards.
- Visit history communicates separate records.
- Planned and Visited coexist visibly.

---

## 51. Remaining product decisions

These recommendations require approval before an implementation plan:

1. **Plan fields**
   - Approve required date; optional time, provider, confirmation/reference, and private notes.
   - Exclude party size from V1.

2. **Date/time semantics**
   - Approve date-only storage plus optional restaurant-local wall time and IANA zone snapshot.
   - Never convert the plan/visit calendar date through UTC.

3. **Plan removal language**
   - Use `Remove plan` consistently, with explicit copy that this does not cancel a restaurant reservation.

4. **Overdue continuation**
   - Show at most one overdue plan in Passport continuation for 30 days, then retain it only in Planned under `Plans to review`.

5. **Record-from-plan default**
   - Default plan completion on exact date or 1–7 days after; otherwise preserve the plan.
   - User choice always overrides the suggestion.

6. **Same-day visits**
   - Allow multiple visits on one date but require explicit duplicate confirmation.

7. **Personal favorite**
   - Keep it on visits only.
   - Derive restaurant-level `hasFavoriteVisit` when any visit is marked.
   - Allow multiple favorite visits per restaurant.

8. **Numeric ratings**
   - Exclude numeric rating from V1 forms.
   - Preserve any legacy value privately for migration/export only.

9. **Confirmation/reference privacy**
   - Sync as ordinary protected private data with RLS.
   - Mask in summaries, exclude from logs/analytics/URLs, and disclose that local storage is plaintext.
   - Do not introduce local encryption/key management in V1.

10. **Sign-in merge**
    - Automatically merge conflict-free records after creating a backup.
    - Show a concise result summary.
    - Require user choice only for meaningful plan/visit/text/deletion conflicts.

11. **Conflict policy**
    - Server revisions replace timestamp-only winners.
    - Deletion wins for the original entity; conflicting private edits remain as recoverable copies.

12. **Sync timing**
    - Hide normal pending for two seconds.
    - Retry at approximately 2s, 5s, 15s, 60s, and 5 minutes with jitter.
    - Show explicit Retry after the five scheduled retries fail (six total attempts including the initial flush).

13. **History loading**
    - Show 10 recent visits, then 20 per `Load earlier visits`.
    - Do not use infinite scrolling.

14. **Character limits**
    - Approve the V1 UI/storage limits in Sections 9, 14, and 30.

## Hard stop

Stage 7 ends with this specification. Do not implement the journey system, create database migrations, modify Supabase, change local-storage schemas, modify production components, commit, or push. The next authorized product step after approval is Stage 8: Passport page redesign using the finalized Saved, Planned, Visited, multiple-visit, removal, and synchronization behaviors.
