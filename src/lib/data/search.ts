import { buildExploreHref, filterRestaurants, parseExploreSearchParams } from "./explore";
import { normalizeSearchText } from "./normalize";
import {
  getCityAggregates,
  getCuisineAggregates,
  getRestaurants,
  getStateAggregates,
} from "./restaurants";
import type { Restaurant } from "./types";

/** Thin helper for simple q-only search used outside the full Explore page. */
export function searchRestaurants(query: string, limit = 300): Restaurant[] {
  const exploreQuery = parseExploreSearchParams({ q: query });
  return filterRestaurants(getRestaurants(), exploreQuery).slice(0, limit);
}

export const GLOBAL_SEARCH_MIN_QUERY = 2;

const RESTAURANT_PREVIEW_LIMIT = 6;
const REFINEMENT_LIMIT = 4;

export type GlobalSearchRestaurant = {
  slug: string;
  name: string;
  city: string;
  stateCode: string;
  cuisine: string;
  stars: 1 | 2 | 3;
  href: string;
};

/** A city / state / cuisine jump — always expressed as an Explore URL. */
export type GlobalSearchRefinement = {
  key: string;
  kind: "city" | "state" | "cuisine";
  label: string;
  detail: string;
  count: number;
  href: string;
};

export type GlobalSearchResults = {
  query: string;
  /** True when the query was too short to search. */
  tooShort: boolean;
  restaurants: GlobalSearchRestaurant[];
  refinements: GlobalSearchRefinement[];
  /** Total matching restaurants, not just the previewed ones. */
  totalRestaurants: number;
  /** Explore URL for the full result set. */
  exploreHref: string;
};

function matchesTerms(haystack: string, terms: readonly string[]): boolean {
  const normalized = normalizeSearchText(haystack);
  return terms.every((term) => normalized.includes(term));
}

/**
 * Take one refinement per kind before taking a second of any kind.
 *
 * Without this a query like "California" fills every slot with California
 * cities and buries the state itself, which is what the user actually asked
 * for.
 */
function interleave(
  groups: readonly (readonly GlobalSearchRefinement[])[],
  limit: number,
): GlobalSearchRefinement[] {
  const picked: GlobalSearchRefinement[] = [];
  const depth = Math.max(...groups.map((group) => group.length), 0);
  for (let round = 0; round < depth && picked.length < limit; round += 1) {
    for (const group of groups) {
      if (picked.length >= limit) break;
      const item = group[round];
      if (item) picked.push(item);
    }
  }
  return picked;
}

/**
 * Bounded search powering the header's global search.
 *
 * Runs on the server so no client ever needs the full catalog, and expresses
 * every "see more" destination as an Explore URL so the query contract in
 * `explore.ts` stays the single source of truth.
 */
export function globalSearch(rawQuery: string): GlobalSearchResults {
  const query = rawQuery.trim();
  const terms = normalizeSearchText(query).split(" ").filter(Boolean);

  if (query.length < GLOBAL_SEARCH_MIN_QUERY || terms.length === 0) {
    return {
      query,
      tooShort: true,
      restaurants: [],
      refinements: [],
      totalRestaurants: 0,
      exploreHref: "/explore",
    };
  }

  const matches = filterRestaurants(
    getRestaurants(),
    parseExploreSearchParams({ q: query }),
  );

  const restaurants: GlobalSearchRestaurant[] = matches
    .slice(0, RESTAURANT_PREVIEW_LIMIT)
    .map((restaurant) => ({
      slug: restaurant.slug,
      name: restaurant.name,
      city: restaurant.city,
      stateCode: restaurant.stateCode,
      cuisine: restaurant.cuisine,
      stars: restaurant.stars,
      href: `/restaurants/${restaurant.slug}`,
    }));

  const cities: GlobalSearchRefinement[] = getCityAggregates()
    .filter((city) => matchesTerms(`${city.city} ${city.state} ${city.stateCode}`, terms))
    .slice(0, REFINEMENT_LIMIT)
    .map((city) => ({
      key: `city:${city.citySlug}`,
      kind: "city" as const,
      label: `${city.city}, ${city.stateCode}`,
      detail: "City",
      count: city.count,
      href: buildExploreHref({ city: city.citySlug }),
    }));

  const states: GlobalSearchRefinement[] = getStateAggregates()
    .filter((state) => matchesTerms(`${state.state} ${state.stateCode}`, terms))
    .slice(0, REFINEMENT_LIMIT)
    .map((state) => ({
      key: `state:${state.stateSlug}`,
      kind: "state" as const,
      label: state.state,
      detail: "State",
      count: state.count,
      href: buildExploreHref({ state: state.stateSlug }),
    }));

  const cuisines: GlobalSearchRefinement[] = getCuisineAggregates()
    .filter((cuisine) => matchesTerms(cuisine.cuisine, terms))
    .slice(0, REFINEMENT_LIMIT)
    .map((cuisine) => ({
      key: `cuisine:${cuisine.cuisineSlug}`,
      kind: "cuisine" as const,
      label: cuisine.cuisine,
      detail: "Cuisine",
      count: cuisine.count,
      href: buildExploreHref({ cuisine: cuisine.cuisineSlug }),
    }));

  return {
    query,
    tooShort: false,
    restaurants,
    refinements: interleave([cities, states, cuisines], REFINEMENT_LIMIT),
    totalRestaurants: matches.length,
    exploreHref: buildExploreHref({ q: query }),
  };
}
