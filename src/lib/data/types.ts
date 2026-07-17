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

export type CuisineAggregate = {
  cuisine: string;
  cuisineSlug: string;
  count: number;
};
