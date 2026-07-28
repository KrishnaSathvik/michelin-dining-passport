import type { Restaurant } from "@/lib/data/types";
import { getApprovedGooglePlaceId } from "@/lib/google-places/place-ids";
import type { PassportStore } from "@/lib/passport/types";
import type {
  CollectionPreviewModel,
  JourneySummaryMetric,
} from "./models";

export function buildJourneySummary(
  store: PassportStore,
  restaurants: readonly Restaurant[] = [],
  visiblePlanCount = Object.keys(store.plans).length,
): JourneySummaryMetric[] {
  const bySlug = new Map(
    restaurants.map((restaurant) => [restaurant.slug, restaurant]),
  );
  const cities = new Set(
    Object.values(store.visits)
      .map((visit) => bySlug.get(visit.restaurantSlug))
      .filter((restaurant): restaurant is Restaurant => Boolean(restaurant))
      .map((restaurant) => `${restaurant.city}|${restaurant.stateCode}`),
  );
  return [
    {
      key: "saved",
      label: "Restaurants saved",
      value: Object.keys(store.bookmarks).length,
      description: "In My Restaurants",
      href: "/saved",
    },
    {
      key: "planned",
      label: "Upcoming plans",
      value: visiblePlanCount,
      description: "Active dining plans",
      href: "/planned",
    },
    {
      key: "visits",
      label: "Visits recorded",
      value: Object.keys(store.visits).length,
      description: "Private dining memories",
      href: "/visited",
    },
    {
      key: "cities",
      label: "Cities explored",
      value: cities.size,
      description: "Across recorded visits",
      href: null,
    },
  ];
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
    Object.values(store.visits).map((visit) => visit.restaurantSlug),
  );

  return Object.values(store.collections)
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, limit)
    .map((collection) => {
      const coverSlugs = [
        collection.coverRestaurantSlug,
        ...collection.restaurantSlugs,
      ]
        .filter((slug): slug is string => Boolean(slug))
        .filter((slug, index, all) => all.indexOf(slug) === index)
        .slice(0, 3);
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
        covers: coverSlugs.flatMap((slug) => {
          const restaurant = bySlug.get(slug);
          return restaurant
            ? [
                {
                  name: restaurant.name,
                  seed: restaurant.slug,
                  city: `${restaurant.city}, ${restaurant.stateCode}`,
                  stars: restaurant.stars,
                  imageUrl: null,
                  placeId: getApprovedGooglePlaceId(restaurant.slug),
                },
              ]
            : [];
        }),
      };
    });
}

export function buildSupportingCopy(
  store: PassportStore,
  restaurants: readonly Restaurant[],
): string {
  const visitedSlugs = new Set(
    Object.values(store.visits).map((visit) => visit.restaurantSlug),
  );
  const visited = visitedSlugs.size;
  const bySlug = new Map(
    restaurants.map((restaurant) => [restaurant.slug, restaurant]),
  );
  const states = new Set(
    [...visitedSlugs]
      .map((slug) => bySlug.get(slug)?.stateSlug)
      .filter((state): state is string => Boolean(state)),
  ).size;

  if (visited === 0) {
    const plans = new Set(
      Object.values(store.plans).map((plan) => plan.restaurantSlug),
    ).size;
    const saved = Object.keys(store.bookmarks).length;
    if (plans > 0) {
      return `You have ${plans} ${plans === 1 ? "meal" : "meals"} planned.`;
    }
    if (saved > 0) {
      return `You have saved ${saved} ${saved === 1 ? "restaurant" : "restaurants"}.`;
    }
    return "Save restaurants, plan meals, and remember every visit.";
  }

  if (states <= 0) {
    return `You have visited ${visited} ${visited === 1 ? "restaurant" : "restaurants"}.`;
  }

  return `You have visited ${visited} ${visited === 1 ? "restaurant" : "restaurants"} across ${states} ${states === 1 ? "state" : "states"}.`;
}

export function hasPassportActivity(store: PassportStore): boolean {
  return (
    Object.keys(store.bookmarks).length > 0 ||
    Object.keys(store.plans).length > 0 ||
    Object.keys(store.visits).length > 0 ||
    Object.keys(store.collections).length > 0
  );
}
