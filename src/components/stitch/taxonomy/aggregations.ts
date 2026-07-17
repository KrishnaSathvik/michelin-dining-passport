import {
  getCityAggregates,
  getCuisineAggregates,
  getRestaurantsByCity,
  getRestaurantsByCuisine,
  getRestaurantsByState,
  getStateAggregates,
} from "@/lib/data/restaurants";

export type CityCuisineShare = {
  cuisine: string;
  cuisineSlug: string;
  count: number;
  /** Integer percent of city total; 0 when total is 0. */
  percent: number;
};

export type CuisineCityHub = {
  city: string;
  citySlug: string;
  state: string;
  stateCode: string;
  stateSlug: string;
  count: number;
};

export type RelatedCuisineLink = {
  cuisine: string;
  cuisineSlug: string;
  count: number;
};

/** Cities in a state with restaurant counts — count desc, city name asc. */
export function getStateCityOverview(stateSlug: string) {
  return getCityAggregates()
    .filter((city) => city.stateSlug === stateSlug)
    .slice()
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.city.localeCompare(b.city);
    });
}

/** Distinct cuisine labels represented in a state's roster. */
export function getStateCuisineCount(stateSlug: string): number {
  const slugs = new Set(
    getRestaurantsByState(stateSlug).map((item) => item.cuisineSlug),
  );
  return slugs.size;
}

/**
 * Dominant cuisines for a city.
 * percent = round(count / total * 100); total 0 → percent 0.
 * Ties: count desc, then cuisine name asc.
 */
export function getCityCuisineDistribution(
  citySlug: string,
  limit = 5,
): CityCuisineShare[] {
  const restaurants = getRestaurantsByCity(citySlug);
  const total = restaurants.length;
  const map = new Map<string, { cuisine: string; cuisineSlug: string; count: number }>();

  for (const restaurant of restaurants) {
    const key = restaurant.cuisineSlug || "unknown";
    const label = restaurant.cuisine?.trim() || "Unlabeled";
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { cuisine: label, cuisineSlug: key, count: 1 });
      continue;
    }
    existing.count += 1;
  }

  return [...map.values()]
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.cuisine.localeCompare(b.cuisine);
    })
    .slice(0, limit)
    .map((item) => ({
      ...item,
      percent: total === 0 ? 0 : Math.round((item.count / total) * 100),
    }));
}

/**
 * OD-14: U.S. city hubs for a cuisine.
 * Returns [] when fewer than two cities are represented (caller omits section).
 * Sort: count desc, city name asc.
 */
export function getCuisineCityHubs(cuisineSlug: string): CuisineCityHub[] {
  const restaurants = getRestaurantsByCuisine(cuisineSlug);
  const map = new Map<string, CuisineCityHub>();

  for (const restaurant of restaurants) {
    const existing = map.get(restaurant.citySlug);
    if (!existing) {
      map.set(restaurant.citySlug, {
        city: restaurant.city,
        citySlug: restaurant.citySlug,
        state: restaurant.state,
        stateCode: restaurant.stateCode,
        stateSlug: restaurant.stateSlug,
        count: 1,
      });
      continue;
    }
    existing.count += 1;
  }

  const hubs = [...map.values()].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.city.localeCompare(b.city);
  });

  return hubs.length >= 2 ? hubs : [];
}

/**
 * Related cuisines: co-occurring in the leading state(s) of the current cuisine,
 * else fall back to globally popular cuisines excluding self.
 */
export function getRelatedCuisineLinks(
  cuisineSlug: string,
  limit = 6,
): RelatedCuisineLink[] {
  const restaurants = getRestaurantsByCuisine(cuisineSlug);
  if (restaurants.length === 0) {
    return getCuisineAggregates()
      .filter((item) => item.cuisineSlug !== cuisineSlug)
      .slice(0, limit)
      .map((item) => ({
        cuisine: item.cuisine,
        cuisineSlug: item.cuisineSlug,
        count: item.count,
      }));
  }

  const stateCounts = new Map<string, number>();
  for (const restaurant of restaurants) {
    stateCounts.set(
      restaurant.stateSlug,
      (stateCounts.get(restaurant.stateSlug) ?? 0) + 1,
    );
  }
  const leadingStates = [...stateCounts.entries()]
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    })
    .slice(0, 3)
    .map(([slug]) => slug);
  const leadingSet = new Set(leadingStates);

  const cooccur = new Map<string, RelatedCuisineLink>();
  for (const stateSlug of leadingSet) {
    for (const restaurant of getRestaurantsByState(stateSlug)) {
      if (restaurant.cuisineSlug === cuisineSlug) continue;
      const existing = cooccur.get(restaurant.cuisineSlug);
      if (!existing) {
        cooccur.set(restaurant.cuisineSlug, {
          cuisine: restaurant.cuisine,
          cuisineSlug: restaurant.cuisineSlug,
          count: 1,
        });
        continue;
      }
      existing.count += 1;
    }
  }

  let related = [...cooccur.values()].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.cuisine.localeCompare(b.cuisine);
  });

  if (related.length === 0) {
    related = getCuisineAggregates()
      .filter((item) => item.cuisineSlug !== cuisineSlug)
      .map((item) => ({
        cuisine: item.cuisine,
        cuisineSlug: item.cuisineSlug,
        count: item.count,
      }));
  }

  return related.slice(0, limit);
}

/** Peer states for related navigation (exclude current). */
export function getRelatedStateLinks(stateSlug: string, limit = 6) {
  return getStateAggregates()
    .filter((state) => state.stateSlug !== stateSlug)
    .slice(0, limit);
}
