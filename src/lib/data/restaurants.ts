import dataset from "../../../data/restaurants.json";
import type {
  CityAggregate,
  CuisineAggregate,
  Restaurant,
  RestaurantDataset,
  StarAggregate,
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

export function getRestaurantsByState(stateSlug: string): Restaurant[] {
  return data.restaurants
    .filter((restaurant) => restaurant.stateSlug === stateSlug)
    .sort((a, b) => {
      if (b.stars !== a.stars) return b.stars - a.stars;
      return a.name.localeCompare(b.name);
    });
}

export function getRestaurantsByCity(citySlug: string): Restaurant[] {
  return data.restaurants
    .filter((restaurant) => restaurant.citySlug === citySlug)
    .sort((a, b) => {
      if (b.stars !== a.stars) return b.stars - a.stars;
      return a.name.localeCompare(b.name);
    });
}

export function getRestaurantsByCuisine(cuisineSlug: string): Restaurant[] {
  return data.restaurants
    .filter((restaurant) => restaurant.cuisineSlug === cuisineSlug)
    .sort((a, b) => {
      if (b.stars !== a.stars) return b.stars - a.stars;
      return a.name.localeCompare(b.name);
    });
}

export function getRestaurantsByStars(stars: 1 | 2 | 3): Restaurant[] {
  return data.restaurants
    .filter((restaurant) => restaurant.stars === stars)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getNearbyRestaurants(
  restaurant: Restaurant,
  limit = 6,
): Restaurant[] {
  return data.restaurants
    .filter(
      (candidate) =>
        candidate.slug !== restaurant.slug &&
        candidate.citySlug === restaurant.citySlug,
    )
    .sort((a, b) => {
      if (b.stars !== a.stars) return b.stars - a.stars;
      return a.name.localeCompare(b.name);
    })
    .slice(0, limit);
}

export function getRelatedByCuisine(
  restaurant: Restaurant,
  limit = 6,
): Restaurant[] {
  return data.restaurants
    .filter(
      (candidate) =>
        candidate.slug !== restaurant.slug &&
        candidate.cuisineSlug === restaurant.cuisineSlug,
    )
    .sort((a, b) => {
      if (b.stars !== a.stars) return b.stars - a.stars;
      return a.name.localeCompare(b.name);
    })
    .slice(0, limit);
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

export function getStateAggregate(
  stateSlug: string,
): StateAggregate | undefined {
  return getStateAggregates().find((state) => state.stateSlug === stateSlug);
}

export function getCityAggregates(): CityAggregate[] {
  const map = new Map<string, CityAggregate>();

  for (const restaurant of data.restaurants) {
    const existing = map.get(restaurant.citySlug);
    if (!existing) {
      map.set(restaurant.citySlug, {
        city: restaurant.city,
        citySlug: restaurant.citySlug,
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
    return a.city.localeCompare(b.city);
  });
}

export function getCityAggregate(citySlug: string): CityAggregate | undefined {
  return getCityAggregates().find((city) => city.citySlug === citySlug);
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

export function getCuisineAggregate(
  cuisineSlug: string,
): CuisineAggregate | undefined {
  return getCuisineAggregates().find(
    (cuisine) => cuisine.cuisineSlug === cuisineSlug,
  );
}

export function getStarAggregates(): StarAggregate[] {
  const totals = getTotals();
  return [
    { stars: 3, count: totals.threeStar },
    { stars: 2, count: totals.twoStar },
    { stars: 1, count: totals.oneStar },
  ];
}

export function getRegionCount(): number {
  return getStateAggregates().length;
}

export function parseStarCount(value: string): 1 | 2 | 3 | null {
  if (value === "1" || value === "2" || value === "3") {
    return Number(value) as 1 | 2 | 3;
  }
  return null;
}
