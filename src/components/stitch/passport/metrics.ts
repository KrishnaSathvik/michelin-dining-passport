import type { Restaurant } from "@/lib/data/types";
import type { PassportStore, UserRestaurantRecord } from "@/lib/passport/types";
import type {
  CatalogDenominators,
  CollectionPreviewModel,
  JourneySummaryMetric,
  StarsCollectedModel,
  StatesExploredModel,
} from "./models";

/**
 * Saved predicate for `/saved`: unique records where `saved === true`.
 * Matches current SaveAction / PassportRestaurantList semantics
 * (includes visited restaurants that remain saved).
 */
export function isSavedRecord(record: UserRestaurantRecord): boolean {
  return record.saved === true;
}

/** Planned predicate for `/planned`: unique records where `planned === true`. */
export function isPlannedRecord(record: UserRestaurantRecord): boolean {
  return record.planned === true;
}

/** Visited predicate for `/visited`: unique records where `visited === true`. */
export function isVisitedRecord(record: UserRestaurantRecord): boolean {
  return record.visited === true;
}

/**
 * OD-09 To Visit:
 * unique restaurants where (wantToVisit || planned) && !visited.
 * Want + Planned on the same restaurant counts once.
 */
export function isToVisitRecord(record: UserRestaurantRecord): boolean {
  return (
    (record.wantToVisit === true || record.planned === true) &&
    record.visited !== true
  );
}

export function uniqueRestaurantIds(
  records: readonly UserRestaurantRecord[],
): string[] {
  return [...new Set(records.map((record) => record.restaurantSlug))];
}

export function countVisited(store: PassportStore): number {
  return uniqueRestaurantIds(
    Object.values(store.userRestaurants).filter(isVisitedRecord),
  ).length;
}

export function countToVisit(store: PassportStore): number {
  return uniqueRestaurantIds(
    Object.values(store.userRestaurants).filter(isToVisitRecord),
  ).length;
}

export function countFavorites(store: PassportStore): number {
  return uniqueRestaurantIds(
    Object.values(store.userRestaurants).filter(
      (record) => record.favorite === true,
    ),
  ).length;
}

export function buildJourneySummary(
  store: PassportStore,
): JourneySummaryMetric[] {
  return [
    {
      key: "visited",
      label: "Visited",
      value: countVisited(store),
      description: "Restaurants marked visited",
      href: "/visited",
    },
    {
      key: "toVisit",
      label: "To Visit",
      value: countToVisit(store),
      description: "Want to visit or currently planned",
      href: "/planned",
    },
    {
      key: "favorites",
      label: "Favorites",
      value: countFavorites(store),
      description: "Restaurants marked favorite",
      href: null,
    },
  ];
}

export function buildStarsCollected(
  store: PassportStore,
  restaurants: readonly Restaurant[],
  denominators: CatalogDenominators,
): StarsCollectedModel {
  const bySlug = new Map(
    restaurants.map((restaurant) => [restaurant.slug, restaurant]),
  );
  const visitedSlugs = uniqueRestaurantIds(
    Object.values(store.userRestaurants).filter(isVisitedRecord),
  );

  let totalStars = 0;
  let one = 0;
  let two = 0;
  let three = 0;

  for (const slug of visitedSlugs) {
    const restaurant = bySlug.get(slug);
    if (!restaurant) continue;
    totalStars += restaurant.stars;
    if (restaurant.stars === 1) one += 1;
    if (restaurant.stars === 2) two += 1;
    if (restaurant.stars === 3) three += 1;
  }

  return {
    totalStars,
    rows: [
      {
        stars: 1,
        label: "One-Star",
        visited: one,
        total: denominators.oneStar,
      },
      {
        stars: 2,
        label: "Two-Star",
        visited: two,
        total: denominators.twoStar,
      },
      {
        stars: 3,
        label: "Three-Star",
        visited: three,
        total: denominators.threeStar,
      },
    ],
  };
}

export function buildStatesExplored(
  store: PassportStore,
  restaurants: readonly Restaurant[],
  totalStates: number,
): StatesExploredModel {
  const bySlug = new Map(
    restaurants.map((restaurant) => [restaurant.slug, restaurant]),
  );
  const states = new Map<string, string>();

  for (const record of Object.values(store.userRestaurants)) {
    if (!isVisitedRecord(record)) continue;
    const restaurant = bySlug.get(record.restaurantSlug);
    if (!restaurant) continue;
    states.set(restaurant.stateSlug, restaurant.state);
  }

  return {
    explored: states.size,
    total: totalStates,
    stateLabels: [...states.values()].sort((a, b) => a.localeCompare(b)),
  };
}

export function buildCollectionPreviews(
  store: PassportStore,
  restaurants: readonly Restaurant[],
  limit = 3,
): CollectionPreviewModel[] {
  const bySlug = new Map(
    restaurants.map((restaurant) => [restaurant.slug, restaurant]),
  );
  const visited = new Set(
    Object.values(store.userRestaurants)
      .filter(isVisitedRecord)
      .map((record) => record.restaurantSlug),
  );

  return Object.values(store.collections)
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, limit)
    .map((collection) => {
      const coverSlug =
        collection.coverRestaurantSlug ?? collection.restaurantSlugs[0] ?? null;
      const coverRestaurant = coverSlug ? bySlug.get(coverSlug) : undefined;
      const visitedCount = collection.restaurantSlugs.filter((slug) =>
        visited.has(slug),
      ).length;

      return {
        id: collection.id,
        slug: collection.slug,
        name: collection.name,
        description: collection.description,
        restaurantCount: collection.restaurantSlugs.length,
        visitedCount,
        href: `/collections/${collection.slug}`,
        cover: coverRestaurant
          ? {
              name: coverRestaurant.name,
              seed: coverRestaurant.slug,
              city: `${coverRestaurant.city}, ${coverRestaurant.stateCode}`,
              stars: coverRestaurant.stars,
              imageUrl: null,
            }
          : null,
      };
    });
}

export function buildSupportingCopy(
  store: PassportStore,
  restaurants: readonly Restaurant[],
): string {
  const visited = countVisited(store);
  const states = buildStatesExplored(
    store,
    restaurants,
    Number.POSITIVE_INFINITY,
  ).explored;

  if (visited === 0) {
    const toVisit = countToVisit(store);
    const saved = uniqueRestaurantIds(
      Object.values(store.userRestaurants).filter(isSavedRecord),
    ).length;
    if (toVisit > 0) {
      return `You have ${toVisit} ${toVisit === 1 ? "restaurant" : "restaurants"} to visit.`;
    }
    if (saved > 0) {
      return `You have saved ${saved} ${saved === 1 ? "restaurant" : "restaurants"}.`;
    }
    return "Track the Michelin-starred tables you want, plan, and visit.";
  }

  if (states <= 0) {
    return `You have visited ${visited} ${visited === 1 ? "restaurant" : "restaurants"}.`;
  }

  return `You have visited ${visited} ${visited === 1 ? "restaurant" : "restaurants"} across ${states} ${states === 1 ? "state" : "states"}.`;
}

export function hasPassportActivity(store: PassportStore): boolean {
  return (
    Object.keys(store.userRestaurants).length > 0 ||
    Object.keys(store.collections).length > 0
  );
}
