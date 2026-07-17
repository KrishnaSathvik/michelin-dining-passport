import type { Restaurant } from "@/lib/data/types";
import type { LocalCollection, PassportStore } from "@/lib/passport/types";
import type {
  CollectionCardModel,
  CollectionCoverModel,
  CollectionProgressModel,
} from "./models";

function isVisitedSlug(
  store: PassportStore,
  slug: string,
): boolean {
  return store.userRestaurants[slug]?.visited === true;
}

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * Featured collection rule (presentation-only, no persisted field):
 * 1. Most recently updated non-empty collection (by updatedAt, then id).
 * 2. Otherwise the first collection in stable ordering (updatedAt desc, then id).
 * 3. No collections → null.
 */
export function selectFeaturedCollection(
  collections: readonly LocalCollection[],
): LocalCollection | null {
  if (collections.length === 0) return null;

  const byRecency = (a: LocalCollection, b: LocalCollection) => {
    const time = b.updatedAt.localeCompare(a.updatedAt);
    if (time !== 0) return time;
    return a.id.localeCompare(b.id);
  };

  const nonEmpty = collections.filter(
    (collection) => collection.restaurantSlugs.length > 0,
  );
  if (nonEmpty.length > 0) {
    return [...nonEmpty].sort(byRecency)[0] ?? null;
  }

  return [...collections].sort(byRecency)[0] ?? null;
}

export function uniqueMemberSlugs(
  restaurantSlugs: readonly string[],
): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const slug of restaurantSlugs) {
    if (seen.has(slug)) continue;
    seen.add(slug);
    unique.push(slug);
  }
  return unique;
}

export function resolveMembers(
  collection: LocalCollection,
  restaurants: readonly Restaurant[],
): {
  members: Restaurant[];
  staleSlugs: string[];
  orderedSlugs: string[];
} {
  const bySlug = new Map(
    restaurants.map((restaurant) => [restaurant.slug, restaurant]),
  );
  const orderedSlugs = uniqueMemberSlugs(collection.restaurantSlugs);
  const members: Restaurant[] = [];
  const staleSlugs: string[] = [];

  for (const slug of orderedSlugs) {
    const restaurant = bySlug.get(slug);
    if (restaurant) members.push(restaurant);
    else staleSlugs.push(slug);
  }

  return { members, staleSlugs, orderedSlugs };
}

/**
 * Cover priority:
 * 1. coverRestaurantSlug when it resolves to a catalog restaurant
 * 2. First resolvable member restaurant
 * 3. Deterministic first-party fallback keyed by collection id/name
 */
export function buildCollectionCover(
  collection: LocalCollection,
  restaurants: readonly Restaurant[],
): CollectionCoverModel {
  const bySlug = new Map(
    restaurants.map((restaurant) => [restaurant.slug, restaurant]),
  );

  const coverSlug =
    collection.coverRestaurantSlug ??
    uniqueMemberSlugs(collection.restaurantSlugs)[0] ??
    null;
  const coverRestaurant = coverSlug ? bySlug.get(coverSlug) : undefined;

  if (coverRestaurant) {
    return {
      kind: "restaurant",
      name: coverRestaurant.name,
      seed: coverRestaurant.slug,
      city: `${coverRestaurant.city}, ${coverRestaurant.stateCode}`,
      stars: coverRestaurant.stars,
      imageUrl: null,
    };
  }

  return {
    kind: "fallback",
    name: collection.name,
    seed: `${collection.id}:${collection.name}`,
    imageUrl: null,
  };
}

export function formatUpdatedLabel(iso: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  const now = Date.now();
  const diffMs = now - date.getTime();
  if (diffMs < 0) {
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const dayMs = 24 * 60 * 60 * 1000;
  if (diffMs < dayMs) return "Updated today";
  if (diffMs < 2 * dayMs) return "Updated yesterday";
  if (diffMs < 7 * dayMs) {
    const days = Math.floor(diffMs / dayMs);
    return `Updated ${days} days ago`;
  }
  if (diffMs < 14 * dayMs) return "Updated last week";

  return `Updated ${date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}

export function buildCollectionProgress(
  collection: LocalCollection,
  store: PassportStore,
  restaurants: readonly Restaurant[],
): CollectionProgressModel {
  const { members, staleSlugs } = resolveMembers(collection, restaurants);
  const totalMembers = members.length;
  const visitedMembers = members.filter((restaurant) =>
    isVisitedSlug(store, restaurant.slug),
  ).length;
  const remainingMembers = Math.max(0, totalMembers - visitedMembers);
  const percent =
    totalMembers === 0
      ? 0
      : Math.min(100, Math.round((visitedMembers / totalMembers) * 100));

  const starsInCollection = members.reduce(
    (sum, restaurant) => sum + restaurant.stars,
    0,
  );
  const stateMap = new Map<string, string>();
  for (const restaurant of members) {
    stateMap.set(restaurant.stateSlug, restaurant.stateCode);
  }

  return {
    totalMembers,
    visitedMembers,
    remainingMembers,
    percent,
    starsInCollection,
    statesRepresented: stateMap.size,
    stateLabels: [...stateMap.values()].sort((a, b) => a.localeCompare(b)),
    staleMemberCount: staleSlugs.length,
  };
}

export function toCollectionCardModel(
  collection: LocalCollection,
  store: PassportStore,
  restaurants: readonly Restaurant[],
): CollectionCardModel {
  const { members } = resolveMembers(collection, restaurants);
  const visitedCount = members.filter((restaurant) =>
    isVisitedSlug(store, restaurant.slug),
  ).length;

  return {
    id: collection.id,
    slug: collection.slug,
    name: collection.name,
    description: collection.description,
    href: `/collections/${collection.slug}`,
    restaurantCount: members.length,
    visitedCount,
    updatedAt: collection.updatedAt,
    updatedLabel: formatUpdatedLabel(collection.updatedAt),
    cover: buildCollectionCover(collection, restaurants),
  };
}

/** Stable palette index for collection fallback covers. */
export function collectionFallbackPaletteIndex(seed: string): number {
  return hashSeed(seed) % 5;
}
