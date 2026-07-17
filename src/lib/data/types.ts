export type Restaurant = {
  slug: string;
  name: string;
  stars: 1 | 2 | 3;
  cuisine: string;
  cuisineSlug: string;
  price: string;
  city: string;
  citySlug: string;
  state: string;
  stateCode: string;
  stateSlug: string;
  address: string;
  michelinGuideUrl: string;
  website: string | null;
};

/**
 * Placeholders for future verified enrichment.
 * Do not render empty enrichment sections on public pages.
 */
export type RestaurantEnrichmentPlaceholders = {
  chefName: string | null;
  openingYear: number | null;
  diningRoomDescription: string | null;
  menuHighlights: string[] | null;
  reservationUrl: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type RestaurantDataset = {
  source: {
    workbook: string;
    sheet: string;
    importedAt: string;
    coverageNote: string;
  };
  totals: {
    restaurants: number;
    oneStar: number;
    twoStar: number;
    threeStar: number;
  };
  restaurants: Restaurant[];
};

export type StateAggregate = {
  state: string;
  stateCode: string;
  stateSlug: string;
  count: number;
  oneStar: number;
  twoStar: number;
  threeStar: number;
};

export type CityAggregate = {
  city: string;
  citySlug: string;
  state: string;
  stateCode: string;
  stateSlug: string;
  count: number;
  oneStar: number;
  twoStar: number;
  threeStar: number;
};

export type CuisineAggregate = {
  cuisine: string;
  cuisineSlug: string;
  count: number;
};

export type StarAggregate = {
  stars: 1 | 2 | 3;
  count: number;
};
