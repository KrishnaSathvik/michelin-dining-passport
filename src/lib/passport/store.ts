import type { Restaurant } from "@/lib/data/types";
import type {
  LocalCollection,
  PassportMetrics,
  PassportStore,
  PassportStoreV1,
  UserRestaurantRecord,
} from "./types";
import { PASSPORT_SCHEMA_VERSION, PASSPORT_STORAGE_KEY } from "./types";

function nowIso(): string {
  return new Date().toISOString();
}

function createEmptyStore(): PassportStoreV1 {
  return {
    version: PASSPORT_SCHEMA_VERSION,
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

  // Future versions migrate here. Unknown/corrupt data recovers to empty.
  if (raw.version !== 1 && raw.version !== undefined) {
    // Attempt best-effort salvage of v1-shaped fields.
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

  return {
    version: PASSPORT_SCHEMA_VERSION,
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

export function savePassportStore(store: PassportStore): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PASSPORT_STORAGE_KEY, JSON.stringify(store));
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
    record.favoriteDishes.length > 0
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

  const userRestaurants = { ...store.userRestaurants };
  if (isMeaningful(next)) userRestaurants[slug] = next;
  else delete userRestaurants[slug];

  return { ...store, userRestaurants };
}

export function removeUserRestaurant(
  store: PassportStore,
  slug: string,
): PassportStore {
  if (!(slug in store.userRestaurants)) return store;
  const userRestaurants = { ...store.userRestaurants };
  delete userRestaurants[slug];
  return { ...store, userRestaurants };
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
): { store: PassportStore; collection: LocalCollection } {
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
  const collection: LocalCollection = {
    id,
    slug,
    name: input.name.trim(),
    description: input.description?.trim() ?? "",
    private: input.private ?? true,
    coverRestaurantSlug: input.coverRestaurantSlug ?? null,
    restaurantSlugs: input.restaurantSlugs ?? [],
    createdAt: stamp,
    updatedAt: stamp,
  };

  return {
    store: {
      ...store,
      collections: { ...store.collections, [id]: collection },
    },
    collection,
  };
}

export function updateCollection(
  store: PassportStore,
  id: string,
  patch: Partial<
    Pick<
      LocalCollection,
      | "name"
      | "description"
      | "private"
      | "coverRestaurantSlug"
      | "restaurantSlugs"
    >
  >,
): PassportStore {
  const existing = store.collections[id];
  if (!existing) return store;

  const next: LocalCollection = {
    ...existing,
    ...patch,
    name: patch.name?.trim() || existing.name,
    description:
      patch.description !== undefined
        ? patch.description.trim()
        : existing.description,
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
