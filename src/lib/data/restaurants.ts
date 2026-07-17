import dataset from "../../../data/restaurants.json";
import type {
  CuisineAggregate,
  Restaurant,
  RestaurantDataset,
  StateAggregate,
} from "./types";

const data = dataset as RestaurantDataset;

export function getDataset(): RestaurantDataset {
  return data;
}

export function getRestaurants(): Restaurant[] {
  return data.restaurants;
}

export function getTotals() {
  return data.totals;
}

export function getSourceMeta() {
  return data.source;
}

export function getRestaurantBySlug(slug: string): Restaurant | undefined {
  return data.restaurants.find((restaurant) => restaurant.slug === slug);
}

export function getRestaurantsBySlugs(slugs: readonly string[]): Restaurant[] {
  const bySlug = new Map(
    data.restaurants.map((restaurant) => [restaurant.slug, restaurant]),
  );
  return slugs.flatMap((slug) => {
    const restaurant = bySlug.get(slug);
    return restaurant ? [restaurant] : [];
  });
}

export function getStateAggregates(): StateAggregate[] {
  const map = new Map<string, StateAggregate>();

  for (const restaurant of data.restaurants) {
    const existing = map.get(restaurant.stateSlug);
    if (!existing) {
      map.set(restaurant.stateSlug, {
        state: restaurant.state,
        stateCode: restaurant.stateCode,
        stateSlug: restaurant.stateSlug,
        count: 1,
        oneStar: restaurant.stars === 1 ? 1 : 0,
        twoStar: restaurant.stars === 2 ? 1 : 0,
        threeStar: restaurant.stars === 3 ? 1 : 0,
      });
      continue;
    }

    existing.count += 1;
    if (restaurant.stars === 1) existing.oneStar += 1;
    if (restaurant.stars === 2) existing.twoStar += 1;
    if (restaurant.stars === 3) existing.threeStar += 1;
  }

  return [...map.values()].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.state.localeCompare(b.state);
  });
}

export function getCuisineAggregates(): CuisineAggregate[] {
  const map = new Map<string, CuisineAggregate>();

  for (const restaurant of data.restaurants) {
    const existing = map.get(restaurant.cuisineSlug);
    if (!existing) {
      map.set(restaurant.cuisineSlug, {
        cuisine: restaurant.cuisine,
        cuisineSlug: restaurant.cuisineSlug,
        count: 1,
      });
      continue;
    }
    existing.count += 1;
  }

  return [...map.values()].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.cuisine.localeCompare(b.cuisine);
  });
}

export function getRegionCount(): number {
  return getStateAggregates().length;
}
