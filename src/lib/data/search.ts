import { filterRestaurants, parseExploreSearchParams } from "./explore";
import { getRestaurants } from "./restaurants";
import type { Restaurant } from "./types";

/** Thin helper for simple q-only search used outside the full Explore page. */
export function searchRestaurants(query: string, limit = 300): Restaurant[] {
  const exploreQuery = parseExploreSearchParams({ q: query });
  return filterRestaurants(getRestaurants(), exploreQuery).slice(0, limit);
}
