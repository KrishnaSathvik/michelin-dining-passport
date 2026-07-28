import type { MapQuery } from "@/lib/map/query";
import type { RestaurantMapRowModel } from "@/components/stitch/restaurant";
import type { ResolvedReservationAction } from "@/components/stitch/restaurant";
import type { MapRestaurant } from "@/lib/data/geocodes";

export type MapFacetOptions = {
  states: Array<{ value: string; label: string }>;
  cuisines: Array<{ value: string; label: string }>;
};

export type MapActiveFilterChip = {
  key: string;
  label: string;
  onClear: () => void;
};

export type MapSelectedModel = {
  restaurant: MapRestaurant;
  reservation: ResolvedReservationAction;
  googlePlaceId: string | null;
  locationPending: boolean;
};

export type MapWorkspaceViewModel = {
  query: MapQuery;
  facets: MapFacetOptions;
  rows: RestaurantMapRowModel[];
  resultCountLabel: string;
  isPending: boolean;
  activeFilters: MapActiveFilterChip[];
  selected: MapSelectedModel | null;
  selectedIndex: number;
  totalFiltered: number;
  showSearchArea: boolean;
  hasAreaFilter: boolean;
  mapFailed: boolean;
  isDesktopViewport: boolean;
  sheetExpanded: boolean;
  attribution: string;
  providerName: string;
};
