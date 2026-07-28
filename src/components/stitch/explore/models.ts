import type {
  ActiveFilterChip,
  ExploreFacets,
  ExploreQuery,
  ExploreView,
} from "@/lib/data/explore";
import type { RestaurantCardModel } from "@/components/stitch/restaurant";

export type ExplorePageHeaderModel = {
  title: string;
  supportText: string;
  resultCountLabel: string;
  totalInRoster: number;
};

export type ExploreResultsModel = {
  view: ExploreView;
  total: number;
  page: number;
  totalPages: number;
  cards: RestaurantCardModel[];
};

export type ExploreViewModel = {
  query: ExploreQuery;
  facets: ExploreFacets;
  chips: ActiveFilterChip[];
  header: ExplorePageHeaderModel;
  results: ExploreResultsModel;
  clearAllHref: string;
  hasFilters: boolean;
};
