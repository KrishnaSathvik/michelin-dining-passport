import { normalizeSearchText } from "./normalize";
import type { Restaurant } from "./types";

export const EXPLORE_PAGE_SIZE = 24;

export const EXPLORE_SORT_OPTIONS = [
  "featured",
  "stars-desc",
  "stars-asc",
  "name-asc",
  "name-desc",
  "state",
  "city",
] as const;

export type ExploreSort = (typeof EXPLORE_SORT_OPTIONS)[number];

export const EXPLORE_VIEW_OPTIONS = ["grid", "list"] as const;
export type ExploreView = (typeof EXPLORE_VIEW_OPTIONS)[number];

export type ExploreQuery = {
  q: string;
  stars: 1 | 2 | 3 | null;
  state: string;
  city: string;
  cuisine: string;
  price: string;
  sort: ExploreSort;
  view: ExploreView;
  page: number;
};

export type ExploreFacets = {
  stars: Array<{ value: 1 | 2 | 3; label: string; count: number }>;
  states: Array<{
    value: string;
    label: string;
    stateCode: string;
    count: number;
  }>;
  cities: Array<{
    value: string;
    label: string;
    state: string;
    stateCode: string;
    count: number;
  }>;
  cuisines: Array<{ value: string; label: string; count: number }>;
  prices: Array<{ value: string; label: string; count: number }>;
};

export type ExplorePageResult = {
  items: Restaurant[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type SearchParamsInput = Record<string, string | string[] | undefined>;

function readParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function isExploreSort(value: string): value is ExploreSort {
  return (EXPLORE_SORT_OPTIONS as readonly string[]).includes(value);
}

function isExploreView(value: string): value is ExploreView {
  return (EXPLORE_VIEW_OPTIONS as readonly string[]).includes(value);
}

export function parseExploreSearchParams(
  params: SearchParamsInput,
): ExploreQuery {
  const starsRaw = readParam(params.stars).trim();
  const starsNum = Number(starsRaw);
  const stars =
    starsRaw === "1" || starsRaw === "2" || starsRaw === "3"
      ? (starsNum as 1 | 2 | 3)
      : null;

  const sortRaw = readParam(params.sort).trim();
  const viewRaw = readParam(params.view).trim();
  const pageRaw = Number(readParam(params.page).trim());

  return {
    q: readParam(params.q).trim(),
    stars,
    state: readParam(params.state).trim(),
    city: readParam(params.city).trim(),
    cuisine: readParam(params.cuisine).trim(),
    price: readParam(params.price).trim(),
    sort: isExploreSort(sortRaw) ? sortRaw : "featured",
    view: isExploreView(viewRaw) ? viewRaw : "grid",
    page: Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1,
  };
}

export function exploreQueryHasFilters(query: ExploreQuery): boolean {
  return Boolean(
    query.q ||
      query.stars !== null ||
      query.state ||
      query.city ||
      query.cuisine ||
      query.price,
  );
}

export function buildExploreSearchParams(
  query: Partial<ExploreQuery>,
  options?: { omitDefaults?: boolean },
): URLSearchParams {
  const omitDefaults = options?.omitDefaults ?? true;
  const params = new URLSearchParams();

  if (query.q) params.set("q", query.q);
  if (query.stars !== null && query.stars !== undefined) {
    params.set("stars", String(query.stars));
  }
  if (query.state) params.set("state", query.state);
  if (query.city) params.set("city", query.city);
  if (query.cuisine) params.set("cuisine", query.cuisine);
  if (query.price) params.set("price", query.price);

  if (query.sort && (!omitDefaults || query.sort !== "featured")) {
    params.set("sort", query.sort);
  }
  if (query.view && (!omitDefaults || query.view !== "grid")) {
    params.set("view", query.view);
  }
  if (query.page && query.page > 1) {
    params.set("page", String(query.page));
  }

  return params;
}

export function buildExploreHref(query: Partial<ExploreQuery>): string {
  const params = buildExploreSearchParams(query);
  const qs = params.toString();
  return qs ? `/explore?${qs}` : "/explore";
}

function restaurantMatchesQuery(
  restaurant: Restaurant,
  query: ExploreQuery,
): boolean {
  if (query.stars !== null && restaurant.stars !== query.stars) return false;
  if (query.state && restaurant.stateSlug !== query.state) return false;
  if (query.city && restaurant.citySlug !== query.city) return false;
  if (query.cuisine && restaurant.cuisineSlug !== query.cuisine) return false;
  if (query.price && restaurant.price !== query.price) return false;

  if (!query.q) return true;

  const haystack = normalizeSearchText(
    [
      restaurant.name,
      restaurant.city,
      restaurant.state,
      restaurant.stateCode,
      restaurant.cuisine,
      restaurant.address,
    ].join(" "),
  );
  const terms = normalizeSearchText(query.q).split(" ").filter(Boolean);
  return terms.every((term) => haystack.includes(term));
}

export function filterRestaurants(
  restaurants: readonly Restaurant[],
  query: ExploreQuery,
): Restaurant[] {
  return restaurants.filter((restaurant) =>
    restaurantMatchesQuery(restaurant, query),
  );
}

export function sortRestaurants(
  restaurants: readonly Restaurant[],
  sort: ExploreSort,
  featuredSlugs: readonly string[] = [],
): Restaurant[] {
  const items = [...restaurants];
  const featuredIndex = new Map(
    featuredSlugs.map((slug, index) => [slug, index]),
  );

  items.sort((a, b) => {
    switch (sort) {
      case "featured": {
        const aFeatured = featuredIndex.has(a.slug);
        const bFeatured = featuredIndex.has(b.slug);
        if (aFeatured && bFeatured) {
          return (
            (featuredIndex.get(a.slug) ?? 0) - (featuredIndex.get(b.slug) ?? 0)
          );
        }
        if (aFeatured !== bFeatured) return aFeatured ? -1 : 1;
        if (b.stars !== a.stars) return b.stars - a.stars;
        return a.name.localeCompare(b.name);
      }
      case "stars-desc":
        if (b.stars !== a.stars) return b.stars - a.stars;
        return a.name.localeCompare(b.name);
      case "stars-asc":
        if (a.stars !== b.stars) return a.stars - b.stars;
        return a.name.localeCompare(b.name);
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "state": {
        const byState = a.state.localeCompare(b.state);
        if (byState !== 0) return byState;
        return a.name.localeCompare(b.name);
      }
      case "city": {
        const byCity = a.city.localeCompare(b.city);
        if (byCity !== 0) return byCity;
        return a.name.localeCompare(b.name);
      }
      default: {
        const _exhaustive: never = sort;
        return _exhaustive;
      }
    }
  });

  return items;
}

export function paginateRestaurants(
  restaurants: readonly Restaurant[],
  page: number,
  pageSize: number = EXPLORE_PAGE_SIZE,
): ExplorePageResult {
  const total = restaurants.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: restaurants.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
    totalPages: total === 0 ? 0 : totalPages,
  };
}

export function runExploreQuery(
  restaurants: readonly Restaurant[],
  query: ExploreQuery,
  featuredSlugs: readonly string[] = [],
): ExplorePageResult {
  const filtered = filterRestaurants(restaurants, query);
  const sorted = sortRestaurants(filtered, query.sort, featuredSlugs);
  return paginateRestaurants(sorted, query.page);
}

export function getExploreFacets(
  restaurants: readonly Restaurant[],
  query?: Pick<ExploreQuery, "state">,
): ExploreFacets {
  const starCounts = { 1: 0, 2: 0, 3: 0 };
  const stateMap = new Map<
    string,
    { value: string; label: string; stateCode: string; count: number }
  >();
  const cityMap = new Map<
    string,
    {
      value: string;
      label: string;
      state: string;
      stateCode: string;
      count: number;
    }
  >();
  const cuisineMap = new Map<
    string,
    { value: string; label: string; count: number }
  >();
  const priceMap = new Map<string, { value: string; label: string; count: number }>();

  for (const restaurant of restaurants) {
    starCounts[restaurant.stars] += 1;

    const state = stateMap.get(restaurant.stateSlug);
    if (state) state.count += 1;
    else {
      stateMap.set(restaurant.stateSlug, {
        value: restaurant.stateSlug,
        label: restaurant.state,
        stateCode: restaurant.stateCode,
        count: 1,
      });
    }

    if (!query?.state || restaurant.stateSlug === query.state) {
      const city = cityMap.get(restaurant.citySlug);
      if (city) city.count += 1;
      else {
        cityMap.set(restaurant.citySlug, {
          value: restaurant.citySlug,
          label: restaurant.city,
          state: restaurant.state,
          stateCode: restaurant.stateCode,
          count: 1,
        });
      }
    }

    const cuisine = cuisineMap.get(restaurant.cuisineSlug);
    if (cuisine) cuisine.count += 1;
    else {
      cuisineMap.set(restaurant.cuisineSlug, {
        value: restaurant.cuisineSlug,
        label: restaurant.cuisine,
        count: 1,
      });
    }

    const price = priceMap.get(restaurant.price);
    if (price) price.count += 1;
    else {
      priceMap.set(restaurant.price, {
        value: restaurant.price,
        label: restaurant.price,
        count: 1,
      });
    }
  }

  return {
    stars: ([3, 2, 1] as const).map((value) => ({
      value,
      label:
        value === 1
          ? "1 Michelin Star"
          : value === 2
            ? "2 Michelin Stars"
            : "3 Michelin Stars",
      count: starCounts[value],
    })),
    states: [...stateMap.values()].sort((a, b) => a.label.localeCompare(b.label)),
    cities: [...cityMap.values()].sort((a, b) => a.label.localeCompare(b.label)),
    cuisines: [...cuisineMap.values()].sort((a, b) =>
      a.label.localeCompare(b.label),
    ),
    prices: [...priceMap.values()].sort(
      (a, b) => b.value.length - a.value.length || a.value.localeCompare(b.value),
    ),
  };
}

export type ActiveFilterChip = {
  key: keyof Pick<
    ExploreQuery,
    "q" | "stars" | "state" | "city" | "cuisine" | "price"
  >;
  label: string;
  href: string;
};

export function getActiveFilterChips(
  query: ExploreQuery,
  facets: ExploreFacets,
): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];

  if (query.q) {
    chips.push({
      key: "q",
      label: `Search: “${query.q}”`,
      href: buildExploreHref({ ...query, q: "", page: 1 }),
    });
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
      href: buildExploreHref({ ...query, stars: null, page: 1 }),
    });
  }

  if (query.state) {
    const state = facets.states.find((item) => item.value === query.state);
    chips.push({
      key: "state",
      label: state?.label ?? query.state,
      href: buildExploreHref({ ...query, state: "", city: "", page: 1 }),
    });
  }

  if (query.city) {
    const city = facets.cities.find((item) => item.value === query.city);
    chips.push({
      key: "city",
      label: city
        ? `${city.label}, ${city.stateCode}`
        : query.city,
      href: buildExploreHref({ ...query, city: "", page: 1 }),
    });
  }

  if (query.cuisine) {
    const cuisine = facets.cuisines.find((item) => item.value === query.cuisine);
    chips.push({
      key: "cuisine",
      label: cuisine?.label ?? query.cuisine,
      href: buildExploreHref({ ...query, cuisine: "", page: 1 }),
    });
  }

  if (query.price) {
    chips.push({
      key: "price",
      label: query.price,
      href: buildExploreHref({ ...query, price: "", page: 1 }),
    });
  }

  return chips;
}

export const EXPLORE_SORT_LABELS: Record<ExploreSort, string> = {
  featured: "Featured",
  "stars-desc": "Stars · highest first",
  "stars-asc": "Stars · lowest first",
  "name-asc": "Restaurant name · A–Z",
  "name-desc": "Restaurant name · Z–A",
  state: "State",
  city: "City",
};
