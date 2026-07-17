import {
  toRestaurantMapRowModel,
} from "@/components/stitch/restaurant";
import type { MapRestaurant } from "@/lib/data/geocodes";
import type { MapQuery } from "@/lib/map/query";
import { getRestaurantReservation } from "@/lib/reservations/data";
import { getRestaurantReservationAction } from "@/lib/reservations/resolve";
import type { MapActiveFilterChip, MapFacetOptions, MapSelectedModel } from "./models";

export function toMapRowModels(
  restaurants: MapRestaurant[],
  selectedSlug: string | null,
) {
  return restaurants.map((restaurant) =>
    toRestaurantMapRowModel(restaurant, {
      selected: restaurant.slug === selectedSlug,
      reservation: getRestaurantReservation(restaurant.slug),
      surface: "map_list",
    }),
  );
}

export function toMapSelectedModel(
  restaurant: MapRestaurant,
  googlePlaceId: string | null,
): MapSelectedModel {
  const reservation = getRestaurantReservationAction(
    restaurant,
    getRestaurantReservation(restaurant.slug),
  );
  return {
    restaurant,
    reservation,
    googlePlaceId,
    locationPending: Boolean(restaurant.locationPending),
  };
}

export function buildMapActiveFilters(
  query: MapQuery,
  facets: MapFacetOptions,
  hasAreaFilter: boolean,
  handlers: {
    clearQ: () => void;
    clearStars: () => void;
    clearState: () => void;
    clearCuisine: () => void;
    clearSaved: () => void;
    clearVisited: () => void;
    clearArea: () => void;
  },
): MapActiveFilterChip[] {
  const chips: MapActiveFilterChip[] = [];
  if (query.q) {
    chips.push({ key: "q", label: `Search: “${query.q}”`, onClear: handlers.clearQ });
  }
  if (query.stars !== null) {
    chips.push({
      key: "stars",
      label:
        query.stars === 1
          ? "1 Michelin Star"
          : query.stars === 2
            ? "2 Michelin Stars"
            : "3 Michelin Stars",
      onClear: handlers.clearStars,
    });
  }
  if (query.state) {
    const state = facets.states.find((item) => item.value === query.state);
    chips.push({
      key: "state",
      label: state?.label ?? query.state,
      onClear: handlers.clearState,
    });
  }
  if (query.cuisine) {
    const cuisine = facets.cuisines.find((item) => item.value === query.cuisine);
    chips.push({
      key: "cuisine",
      label: cuisine?.label ?? query.cuisine,
      onClear: handlers.clearCuisine,
    });
  }
  if (query.savedOnly) {
    chips.push({ key: "saved", label: "Saved", onClear: handlers.clearSaved });
  }
  if (query.visitedOnly) {
    chips.push({
      key: "visited",
      label: "Visited",
      onClear: handlers.clearVisited,
    });
  }
  if (hasAreaFilter) {
    chips.push({
      key: "bounds",
      label: "This map area",
      onClear: handlers.clearArea,
    });
  }
  return chips;
}
