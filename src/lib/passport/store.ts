import type { Restaurant } from "@/lib/data/types";
import type {
  LocalCollection,
  PassportMetrics,
  PassportStore,
  PassportStoreV3,
  RestaurantVisit,
  UserRestaurantRecord,
} from "./types";
import { PASSPORT_SCHEMA_VERSION, PASSPORT_STORAGE_KEY } from "./types";
import {
  createJourneyVisit,
  deleteJourneyVisit,
  deriveRestaurantJourney,
  ensureJourneyBookmark,
  migrateLegacyJourneyRecords,
  removeJourneyPlan,
  sanitizeJourneyRecords,
  saveJourneyPlan,
  updateJourneyVisit,
} from "./journey";

function nowIso(): string {
  return new Date().toISOString();
}

function createEmptyStore(): PassportStoreV3 {
  return {
    version: PASSPORT_SCHEMA_VERSION,
    bookmarks: {},
    plans: {},
    visits: {},
    userRestaurants: {},
    collections: {},
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sanitizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function sanitizeUserRestaurant(
  slug: string,
  value: unknown,
): UserRestaurantRecord | null {
  if (!isRecord(value)) return null;
  const rating =
    typeof value.personalRating === "number" &&
    value.personalRating >= 1 &&
    value.personalRating <= 5
      ? Math.round(value.personalRating)
      : null;

  return {
    restaurantSlug: slug,
    saved: Boolean(value.saved),
    wantToVisit: Boolean(value.wantToVisit),
    planned: Boolean(value.planned),
    visited: Boolean(value.visited),
    favorite: Boolean(value.favorite),
    visitDate:
      typeof value.visitDate === "string" && value.visitDate
        ? value.visitDate
        : null,
    personalRating: rating,
    notes: typeof value.notes === "string" ? value.notes : "",
    favoriteDishes: sanitizeStringArray(value.favoriteDishes),
    reservationPlannedFor:
      typeof value.reservationPlannedFor === "string" &&
      value.reservationPlannedFor
        ? value.reservationPlannedFor
        : null,
    reservationProvider:
      typeof value.reservationProvider === "string"
        ? value.reservationProvider
        : null,
    reservationConfirmationNote:
      typeof value.reservationConfirmationNote === "string"
        ? value.reservationConfirmationNote.slice(0, 280)
        : null,
    createdAt:
      typeof value.createdAt === "string" ? value.createdAt : nowIso(),
    updatedAt:
      typeof value.updatedAt === "string" ? value.updatedAt : nowIso(),
  };
}

function sanitizeCollection(
  id: string,
  value: unknown,
): LocalCollection | null {
  if (!isRecord(value)) return null;
  const name = typeof value.name === "string" ? value.name.trim() : "";
  if (!name) return null;
  const slug =
    typeof value.slug === "string" && value.slug
      ? value.slug
      : slugify(name, id);

  return {
    id,
    slug,
    name,
    description: typeof value.description === "string" ? value.description : "",
    private: Boolean(value.private),
    coverRestaurantSlug:
      typeof value.coverRestaurantSlug === "string"
        ? value.coverRestaurantSlug
        : null,
    restaurantSlugs: sanitizeStringArray(value.restaurantSlugs),
    createdAt:
      typeof value.createdAt === "string" ? value.createdAt : nowIso(),
    updatedAt:
      typeof value.updatedAt === "string" ? value.updatedAt : nowIso(),
  };
}

export function slugify(value: string, fallback = "collection"): string {
  const base = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || fallback;
}

export function migratePassportStore(raw: unknown): PassportStore {
  if (!isRecord(raw)) return createEmptyStore();

  // v1 → v2 adds optional reservation planning fields (nullable defaults).
  // Unknown/corrupt data recovers to empty.
  if (
    raw.version !== 1 &&
    raw.version !== 2 &&
    raw.version !== undefined
  ) {
    // Attempt best-effort salvage of known-shaped fields below.
  }

  const userRestaurants: Record<string, UserRestaurantRecord> = {};
  if (isRecord(raw.userRestaurants)) {
    for (const [slug, entry] of Object.entries(raw.userRestaurants)) {
      const sanitized = sanitizeUserRestaurant(slug, entry);
      if (sanitized) userRestaurants[slug] = sanitized;
    }
  }

  const collections: Record<string, LocalCollection> = {};
  if (isRecord(raw.collections)) {
    for (const [id, entry] of Object.entries(raw.collections)) {
      const sanitized = sanitizeCollection(id, entry);
      if (sanitized) collections[id] = sanitized;
    }
  }

  const normalized =
    raw.version === 3
      ? sanitizeJourneyRecords({
          bookmarks: raw.bookmarks,
          plans: raw.plans,
          visits: raw.visits,
        })
      : migrateLegacyJourneyRecords(userRestaurants);

  // Collection membership implies a bookmark in the V3 journey model.
  let bookmarks = normalized.bookmarks;
  for (const collection of Object.values(collections)) {
    for (const slug of collection.restaurantSlugs) {
      bookmarks = ensureJourneyBookmark(
        bookmarks,
        slug,
        collection.updatedAt,
      );
    }
  }

  return {
    version: PASSPORT_SCHEMA_VERSION,
    bookmarks,
    plans: normalized.plans,
    visits: normalized.visits,
    userRestaurants,
    collections,
  };
}

export function loadPassportStore(): PassportStore {
  if (typeof window === "undefined") return createEmptyStore();

  try {
    const raw = window.localStorage.getItem(PASSPORT_STORAGE_KEY);
    if (!raw) return createEmptyStore();
    return migratePassportStore(JSON.parse(raw) as unknown);
  } catch {
    return createEmptyStore();
  }
}

export function loadPassportStoreResult(): {
  store: PassportStore;
  storageError: boolean;
} {
  if (typeof window === "undefined") {
    return { store: createEmptyStore(), storageError: false };
  }
  try {
    const raw = window.localStorage.getItem(PASSPORT_STORAGE_KEY);
    return {
      store: raw
        ? migratePassportStore(JSON.parse(raw) as unknown)
        : createEmptyStore(),
      storageError: false,
    };
  } catch {
    return { store: createEmptyStore(), storageError: true };
  }
}

export function savePassportStore(store: PassportStore): boolean {
  if (typeof window === "undefined") return true;
  try {
    window.localStorage.setItem(PASSPORT_STORAGE_KEY, JSON.stringify(store));
    return true;
  } catch {
    return false;
  }
}

export function exportPassportStore(store: PassportStore): string {
  return JSON.stringify(store, null, 2);
}

export function importPassportStore(json: string): PassportStore {
  return migratePassportStore(JSON.parse(json) as unknown);
}

export function clearPassportStore(): PassportStore {
  const empty = createEmptyStore();
  savePassportStore(empty);
  return empty;
}

function emptyUserRestaurant(slug: string): UserRestaurantRecord {
  const stamp = nowIso();
  return {
    restaurantSlug: slug,
    saved: false,
    wantToVisit: false,
    planned: false,
    visited: false,
    favorite: false,
    visitDate: null,
    personalRating: null,
    notes: "",
    favoriteDishes: [],
    reservationPlannedFor: null,
    reservationProvider: null,
    reservationConfirmationNote: null,
    createdAt: stamp,
    updatedAt: stamp,
  };
}

function isMeaningful(record: UserRestaurantRecord): boolean {
  return (
    record.saved ||
    record.wantToVisit ||
    record.planned ||
    record.visited ||
    record.favorite ||
    Boolean(record.visitDate) ||
    record.personalRating !== null ||
    Boolean(record.notes.trim()) ||
    record.favoriteDishes.length > 0 ||
    Boolean(record.reservationPlannedFor) ||
    Boolean(record.reservationProvider?.trim()) ||
    Boolean(record.reservationConfirmationNote?.trim())
  );
}

export function upsertUserRestaurant(
  store: PassportStore,
  slug: string,
  patch: Partial<Omit<UserRestaurantRecord, "restaurantSlug" | "createdAt">>,
): PassportStore {
  const existing = store.userRestaurants[slug] ?? emptyUserRestaurant(slug);
  const next: UserRestaurantRecord = {
    ...existing,
    ...patch,
    restaurantSlug: slug,
    createdAt: existing.createdAt,
    updatedAt: nowIso(),
  };
  const hasNormalizedDependencies =
    Object.values(store.plans).some((plan) => plan.restaurantSlug === slug) ||
    Object.values(store.visits).some((visit) => visit.restaurantSlug === slug) ||
    Object.values(store.collections).some((collection) =>
      collection.restaurantSlugs.includes(slug),
    );
  if (patch.saved === false && hasNormalizedDependencies) {
    next.saved = true;
  }

  const userRestaurants = { ...store.userRestaurants };
  if (isMeaningful(next)) userRestaurants[slug] = next;
  else delete userRestaurants[slug];

  let bookmarks = store.bookmarks;
  let plans = store.plans;
  let visits = store.visits;
  const stamp = next.updatedAt;

  if (
    next.saved ||
    next.wantToVisit ||
    next.planned ||
    next.visited ||
    next.favorite
  ) {
    bookmarks = ensureJourneyBookmark(bookmarks, slug, stamp);
  } else if (!hasNormalizedDependencies && bookmarks[slug]) {
    bookmarks = { ...bookmarks };
    delete bookmarks[slug];
  }

  const currentPlan = Object.values(plans).find(
    (plan) => plan.restaurantSlug === slug,
  );
  if (next.planned) {
    plans = saveJourneyPlan(
      plans,
      {
        id: currentPlan?.id,
        restaurantSlug: slug,
        plannedDate: next.reservationPlannedFor,
        plannedTime: currentPlan?.plannedTime ?? null,
        reservationProvider: next.reservationProvider,
        confirmationReference: next.reservationConfirmationNote,
        privateNotes: currentPlan?.privateNotes ?? "",
      },
      stamp,
    ).plans;
  } else if (currentPlan) {
    plans = removeJourneyPlan(plans, currentPlan.id);
  }

  const currentVisit = Object.values(visits)
    .filter((visit) => visit.restaurantSlug === slug)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  if (next.visited || next.visitDate) {
    if (currentVisit) {
      visits = updateJourneyVisit(
        visits,
        currentVisit.id,
        {
          visitDate: next.visitDate,
          favoriteDishes: next.favoriteDishes.join(", "),
          privateNotes: next.notes,
          personalFavorite: next.favorite,
        },
        stamp,
      );
    } else {
      visits = createJourneyVisit(
        visits,
        {
          id: `legacy-current:${slug}`,
          restaurantSlug: slug,
          visitDate: next.visitDate,
          favoriteDishes: next.favoriteDishes.join(", "),
          privateNotes: next.notes,
          wouldReturn: null,
          personalFavorite: next.favorite,
        },
        stamp,
      );
    }
  }

  return { ...store, bookmarks, plans, visits, userRestaurants };
}

export function removeUserRestaurant(
  store: PassportStore,
  slug: string,
): PassportStore {
  if (
    !(slug in store.userRestaurants) &&
    !(slug in store.bookmarks) &&
    !Object.values(store.plans).some((plan) => plan.restaurantSlug === slug) &&
    !Object.values(store.visits).some((visit) => visit.restaurantSlug === slug)
  ) {
    return store;
  }
  const userRestaurants = { ...store.userRestaurants };
  delete userRestaurants[slug];
  const bookmarks = { ...store.bookmarks };
  delete bookmarks[slug];
  const plans = Object.fromEntries(
    Object.entries(store.plans).filter(
      ([, plan]) => plan.restaurantSlug !== slug,
    ),
  );
  const visits = Object.fromEntries(
    Object.entries(store.visits).filter(
      ([, visit]) => visit.restaurantSlug !== slug,
    ),
  );
  const collections = Object.fromEntries(
    Object.entries(store.collections).map(([id, collection]) => [
      id,
      {
        ...collection,
        restaurantSlugs: collection.restaurantSlugs.filter(
          (restaurantSlug) => restaurantSlug !== slug,
        ),
        coverRestaurantSlug:
          collection.coverRestaurantSlug === slug
            ? null
            : collection.coverRestaurantSlug,
      },
    ]),
  );
  return {
    ...store,
    bookmarks,
    plans,
    visits,
    userRestaurants,
    collections,
  };
}

function mirrorJourneyRecord(
  store: PassportStore,
  slug: string,
): Record<string, UserRestaurantRecord> {
  const journey = deriveRestaurantJourney(
    slug,
    store.bookmarks,
    store.plans,
    store.visits,
  );
  const existing = store.userRestaurants[slug] ?? emptyUserRestaurant(slug);
  const latestVisit = journey.visits[0];
  const next: UserRestaurantRecord = {
    ...existing,
    saved: journey.isSaved,
    wantToVisit: false,
    planned: journey.isPlanned,
    visited: journey.isVisited,
    favorite: journey.isPersonalFavorite,
    visitDate: latestVisit?.visitDate ?? null,
    personalRating: null,
    notes: latestVisit?.privateNotes ?? "",
    favoriteDishes: latestVisit?.favoriteDishes
      ? latestVisit.favoriteDishes
          .split(",")
          .map((dish) => dish.trim())
          .filter(Boolean)
      : [],
    reservationPlannedFor: journey.plan?.plannedDate ?? null,
    reservationProvider: journey.plan?.reservationProvider ?? null,
    reservationConfirmationNote:
      journey.plan?.confirmationReference ?? null,
    updatedAt: nowIso(),
  };
  return { ...store.userRestaurants, [slug]: next };
}

export function saveRestaurantPlan(
  store: PassportStore,
  input: {
    restaurantSlug: string;
    plannedDate: string;
    plannedTime: string | null;
    reservationProvider: string | null;
    confirmationReference: string | null;
    privateNotes: string;
  },
): PassportStore {
  const stamp = nowIso();
  const bookmarks = ensureJourneyBookmark(
    store.bookmarks,
    input.restaurantSlug,
    stamp,
  );
  const result = saveJourneyPlan(store.plans, input, stamp);
  const next = {
    ...store,
    bookmarks,
    plans: result.plans,
  };
  return {
    ...next,
    userRestaurants: mirrorJourneyRecord(next, input.restaurantSlug),
  };
}

export function deleteRestaurantPlan(
  store: PassportStore,
  planId: string,
): PassportStore {
  const plan = store.plans[planId];
  if (!plan) return store;
  const next = {
    ...store,
    plans: removeJourneyPlan(store.plans, planId),
  };
  return {
    ...next,
    userRestaurants: mirrorJourneyRecord(next, plan.restaurantSlug),
  };
}

export function addRestaurantVisit(
  store: PassportStore,
  input: Omit<RestaurantVisit, "createdAt" | "updatedAt" | "datePrecision"> & {
    datePrecision?: RestaurantVisit["datePrecision"];
  },
): PassportStore {
  const stamp = nowIso();
  const bookmarks = ensureJourneyBookmark(
    store.bookmarks,
    input.restaurantSlug,
    stamp,
  );
  const visits = createJourneyVisit(store.visits, input, stamp);
  const next = { ...store, bookmarks, visits };
  return {
    ...next,
    userRestaurants: mirrorJourneyRecord(next, input.restaurantSlug),
  };
}

export function editRestaurantVisit(
  store: PassportStore,
  visitId: string,
  patch: Partial<
    Pick<
      RestaurantVisit,
      | "visitDate"
      | "favoriteDishes"
      | "privateNotes"
      | "wouldReturn"
      | "personalFavorite"
    >
  >,
): PassportStore {
  const existing = store.visits[visitId];
  if (!existing) return store;
  const next = {
    ...store,
    visits: updateJourneyVisit(store.visits, visitId, patch),
  };
  return {
    ...next,
    userRestaurants: mirrorJourneyRecord(next, existing.restaurantSlug),
  };
}

export function removeRestaurantVisit(
  store: PassportStore,
  visitId: string,
): PassportStore {
  const existing = store.visits[visitId];
  if (!existing) return store;
  const next = {
    ...store,
    visits: deleteJourneyVisit(store.visits, visitId),
  };
  return {
    ...next,
    userRestaurants: mirrorJourneyRecord(next, existing.restaurantSlug),
  };
}

export const COLLECTION_NAME_MAX_LENGTH = 80;
export const COLLECTION_DESCRIPTION_MAX_LENGTH = 500;

export type CollectionInputError =
  | "name-required"
  | "name-too-long"
  | "description-too-long"
  | "duplicate-name";

/**
 * Shared create/rename validation. Duplicate names are compared
 * case-insensitively after trimming so "NY weekend" and "ny weekend" collide.
 */
export function validateCollectionInput(
  store: PassportStore,
  input: { name: string; description?: string },
  options: { excludeId?: string } = {},
): CollectionInputError | null {
  const name = input.name.trim();
  if (!name) return "name-required";
  if (name.length > COLLECTION_NAME_MAX_LENGTH) return "name-too-long";
  if (
    (input.description ?? "").trim().length > COLLECTION_DESCRIPTION_MAX_LENGTH
  ) {
    return "description-too-long";
  }
  const folded = name.toLocaleLowerCase();
  const duplicate = Object.values(store.collections).some(
    (collection) =>
      collection.id !== options.excludeId &&
      collection.name.trim().toLocaleLowerCase() === folded,
  );
  return duplicate ? "duplicate-name" : null;
}

export function createCollection(
  store: PassportStore,
  input: {
    name: string;
    description?: string;
    private?: boolean;
    coverRestaurantSlug?: string | null;
    restaurantSlugs?: string[];
  },
): {
  store: PassportStore;
  collection: LocalCollection | null;
  error: CollectionInputError | null;
} {
  const error = validateCollectionInput(store, input);
  if (error) return { store, collection: null, error };

  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `col-${Date.now()}`;
  const baseSlug = slugify(input.name);
  let slug = baseSlug;
  let suffix = 2;
  const existingSlugs = new Set(
    Object.values(store.collections).map((item) => item.slug),
  );
  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  const stamp = nowIso();
  const restaurantSlugs = input.restaurantSlugs
    ? [...new Set(input.restaurantSlugs)]
    : [];
  const collection: LocalCollection = {
    id,
    slug,
    name: input.name.trim(),
    description: (input.description ?? "").trim(),
    // Collections stay private in V1; the flag exists only for the cloud schema.
    private: true,
    coverRestaurantSlug: input.coverRestaurantSlug ?? restaurantSlugs[0] ?? null,
    restaurantSlugs,
    createdAt: stamp,
    updatedAt: stamp,
  };

  // Seed membership implies a Saved bookmark, same as adding one later.
  let bookmarks = store.bookmarks;
  for (const slug of restaurantSlugs) {
    bookmarks = ensureJourneyBookmark(bookmarks, slug, stamp);
  }
  const next: PassportStore = {
    ...store,
    bookmarks,
    collections: { ...store.collections, [id]: collection },
  };

  return {
    store: restaurantSlugs.reduce(
      (current, slug) => ({
        ...current,
        userRestaurants: mirrorJourneyRecord(current, slug),
      }),
      next,
    ),
    collection,
    error: null,
  };
}

/**
 * Adding a restaurant to a collection guarantees it is Saved. It never creates
 * plans or visits, and it never changes an existing bookmark's createdAt.
 */
export function addRestaurantToCollection(
  store: PassportStore,
  collectionId: string,
  restaurantSlug: string,
): PassportStore {
  const collection = store.collections[collectionId];
  if (!collection) return store;

  const stamp = nowIso();
  const alreadyMember = collection.restaurantSlugs.includes(restaurantSlug);
  const nextCollection: LocalCollection = alreadyMember
    ? collection
    : {
        ...collection,
        restaurantSlugs: [...collection.restaurantSlugs, restaurantSlug],
        coverRestaurantSlug: collection.coverRestaurantSlug ?? restaurantSlug,
        updatedAt: stamp,
      };

  const next: PassportStore = {
    ...store,
    bookmarks: ensureJourneyBookmark(store.bookmarks, restaurantSlug, stamp),
    collections: { ...store.collections, [collectionId]: nextCollection },
  };
  return {
    ...next,
    userRestaurants: mirrorJourneyRecord(next, restaurantSlug),
  };
}

/**
 * Removing a restaurant from a collection drops membership only. The bookmark,
 * plans, and visits are deliberately left untouched.
 */
export function removeRestaurantFromCollection(
  store: PassportStore,
  collectionId: string,
  restaurantSlug: string,
): PassportStore {
  const collection = store.collections[collectionId];
  if (!collection || !collection.restaurantSlugs.includes(restaurantSlug)) {
    return store;
  }

  const restaurantSlugs = collection.restaurantSlugs.filter(
    (slug) => slug !== restaurantSlug,
  );
  const nextCollection: LocalCollection = {
    ...collection,
    restaurantSlugs,
    coverRestaurantSlug:
      collection.coverRestaurantSlug === restaurantSlug
        ? restaurantSlugs[0] ?? null
        : collection.coverRestaurantSlug,
    updatedAt: nowIso(),
  };

  return {
    ...store,
    collections: { ...store.collections, [collectionId]: nextCollection },
  };
}

/**
 * Renames a collection and/or edits its description. Membership changes go
 * through addRestaurantToCollection / removeRestaurantFromCollection so the
 * Saved invariant cannot be bypassed.
 */
export function updateCollection(
  store: PassportStore,
  id: string,
  patch: Partial<Pick<LocalCollection, "name" | "description" | "coverRestaurantSlug">>,
): PassportStore {
  const existing = store.collections[id];
  if (!existing) return store;

  const next: LocalCollection = {
    ...existing,
    ...patch,
    name: patch.name?.trim().slice(0, COLLECTION_NAME_MAX_LENGTH) || existing.name,
    description:
      patch.description !== undefined
        ? patch.description.trim().slice(0, COLLECTION_DESCRIPTION_MAX_LENGTH)
        : existing.description,
    private: true,
    updatedAt: nowIso(),
  };

  return {
    ...store,
    collections: { ...store.collections, [id]: next },
  };
}

export function deleteCollection(
  store: PassportStore,
  id: string,
): PassportStore {
  if (!(id in store.collections)) return store;
  const collections = { ...store.collections };
  delete collections[id];
  return { ...store, collections };
}

export function getCollectionBySlug(
  store: PassportStore,
  slug: string,
): LocalCollection | undefined {
  return Object.values(store.collections).find((item) => item.slug === slug);
}

/**
 * Star experience formula (documented for Passport metrics):
 * visiting a 1★ restaurant adds 1, 2★ adds 2, 3★ adds 3.
 */
export function calculatePassportMetrics(
  store: PassportStore,
  restaurants: readonly Restaurant[],
): PassportMetrics {
  const bySlug = new Map(
    restaurants.map((restaurant) => [restaurant.slug, restaurant]),
  );
  const visited = Object.values(store.userRestaurants).filter(
    (record) => record.visited,
  );
  const saved = Object.values(store.userRestaurants).filter(
    (record) => record.saved,
  );

  const states = new Set<string>();
  const cities = new Set<string>();
  const cuisines = new Set<string>();
  let starsExperienced = 0;
  let threeStarVisited = 0;
  const yearCounts = new Map<number, number>();

  for (const record of visited) {
    const restaurant = bySlug.get(record.restaurantSlug);
    if (!restaurant) continue;
    starsExperienced += restaurant.stars;
    if (restaurant.stars === 3) threeStarVisited += 1;
    states.add(restaurant.stateSlug);
    cities.add(restaurant.citySlug);
    cuisines.add(restaurant.cuisineSlug);

    if (record.visitDate) {
      const year = Number(record.visitDate.slice(0, 4));
      if (Number.isFinite(year)) {
        yearCounts.set(year, (yearCounts.get(year) ?? 0) + 1);
      }
    }
  }

  return {
    restaurantsVisited: visited.length,
    starsExperienced,
    statesExplored: states.size,
    citiesExplored: cities.size,
    cuisinesTried: cuisines.size,
    threeStarVisited,
    savedRestaurants: saved.length,
    visitsByYear: [...yearCounts.entries()]
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => b.year - a.year),
  };
}
