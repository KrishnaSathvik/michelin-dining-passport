import {
  toRestaurantDiscoveryCardModel,
  toRestaurantListRowModel,
} from "@/components/stitch/restaurant";
import {
  buildExploreHref,
  exploreQueryHasFilters,
  type ActiveFilterChip,
  type ExploreFacets,
  type ExplorePageResult,
  type ExploreQuery,
} from "@/lib/data/explore";
import type { Restaurant } from "@/lib/data/types";
import { getRestaurantReservation } from "@/lib/reservations/data";
import type { ExploreViewModel } from "./models";

export function toExploreViewModel(input: {
  query: ExploreQuery;
  facets: ExploreFacets;
  chips: ActiveFilterChip[];
  pageResult: ExplorePageResult;
  totalInRoster: number;
}): ExploreViewModel {
  const { query, facets, chips, pageResult, totalInRoster } = input;
  const total = pageResult.total;
  const resultCountLabel =
    total === 1 ? "1 restaurant" : `${total} restaurants`;

  const cards =
    query.view === "list"
      ? pageResult.items.map((restaurant) =>
          toRestaurantListRowModel(restaurant, {
            reservation: getRestaurantReservation(restaurant.slug),
            surface: "explore_list",
          }),
        )
      : pageResult.items.map((restaurant) =>
          toRestaurantDiscoveryCardModel(restaurant, {
            reservation: getRestaurantReservation(restaurant.slug),
            surface: "explore_grid",
          }),
        );

  return {
    query,
    facets,
    chips,
    clearAllHref: buildExploreHref({
      sort: query.sort,
      view: query.view,
    }),
    hasFilters: exploreQueryHasFilters(query),
    header: {
      title: "Explore Michelin-starred restaurants",
      supportText: `Search and filter ${totalInRoster} Michelin-starred restaurants across the United States.`,
      resultCountLabel,
      totalInRoster,
    },
    results: {
      view: query.view,
      total,
      page: pageResult.page,
      totalPages: pageResult.totalPages,
      cards,
    },
  };
}

/** Taxonomy / other routes that still need a stitch grid without Explore chrome. */
export function toExploreGridCards(
  restaurants: Restaurant[],
  surface: "taxonomy" | "explore_grid" = "taxonomy",
) {
  return restaurants.map((restaurant) =>
    toRestaurantDiscoveryCardModel(restaurant, {
      reservation: getRestaurantReservation(restaurant.slug),
      surface,
    }),
  );
}
