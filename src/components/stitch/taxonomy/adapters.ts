import { toExploreGridCards } from "@/components/stitch/explore";
import type {
  CityAggregate,
  CuisineAggregate,
  Restaurant,
  StateAggregate,
} from "@/lib/data/types";
import { getStarAggregates } from "@/lib/data/restaurants";
import {
  getCityCuisineDistribution,
  getCuisineCityHubs,
  getRelatedCuisineLinks,
  getRelatedStateLinks,
  getStateCityOverview,
  getStateCuisineCount,
} from "./aggregations";
import {
  STAR_MEANINGS,
  TAXONOMY_ATMOSPHERE_IMAGE,
  type CityPageViewModel,
  type CuisinePageViewModel,
  type StarPageViewModel,
  type StatePageViewModel,
  type TaxonomyHeroModel,
} from "./models";

function countLabel(count: number): string {
  return count === 1
    ? "1 restaurant in the current roster"
    : `${count} restaurants in the current roster`;
}

function destinationHero(input: {
  title: string;
  introduction: string;
  count: number;
  breadcrumbs: TaxonomyHeroModel["breadcrumbs"];
  tone: TaxonomyHeroModel["tone"];
}): TaxonomyHeroModel {
  return {
    title: input.title,
    introduction: input.introduction,
    count: input.count,
    countLabel: countLabel(input.count),
    imageSrc: TAXONOMY_ATMOSPHERE_IMAGE,
    imageAlt:
      "Atmospheric fine-dining setting — decorative taxonomy hero, not a listed restaurant",
    tone: input.tone,
    breadcrumbs: input.breadcrumbs,
  };
}

export function toStatePageViewModel(input: {
  state: StateAggregate;
  restaurants: Restaurant[];
}): StatePageViewModel {
  const { state, restaurants } = input;
  const cities = getStateCityOverview(state.stateSlug);
  const cuisineCount = getStateCuisineCount(state.stateSlug);

  return {
    hero: destinationHero({
      title: state.state,
      introduction: `${state.count} Michelin-starred restaurants appear in the current United States roster for ${state.state}: ${state.threeStar} three-star, ${state.twoStar} two-star, and ${state.oneStar} one-star. Counts reflect the imported workbook only.`,
      count: state.count,
      tone: "destination",
      breadcrumbs: [
        { name: "Home", path: "/" },
        { name: "Explore", path: "/explore" },
        { name: state.state, path: `/usa/${state.stateSlug}` },
      ],
    }),
    glance: [
      {
        id: "total",
        label: "Starred restaurants",
        value: state.count,
        accessibleLabel: `${state.count} Michelin-starred restaurants in ${state.state}`,
      },
      {
        id: "cities",
        label: "Cities represented",
        value: cities.length,
        accessibleLabel: `${cities.length} cities represented in ${state.state}`,
      },
      {
        id: "cuisines",
        label: "Cuisines represented",
        value: cuisineCount,
        accessibleLabel: `${cuisineCount} cuisines represented in ${state.state}`,
      },
    ],
    starBreakdown: [
      {
        id: "three",
        label: "Three Michelin stars",
        value: state.threeStar,
        accessibleLabel: `${state.threeStar} three Michelin star restaurants`,
      },
      {
        id: "two",
        label: "Two Michelin stars",
        value: state.twoStar,
        accessibleLabel: `${state.twoStar} two Michelin star restaurants`,
      },
      {
        id: "one",
        label: "One Michelin star",
        value: state.oneStar,
        accessibleLabel: `${state.oneStar} one Michelin star restaurants`,
      },
    ],
    cities: cities.map((city) => ({
      city: city.city,
      citySlug: city.citySlug,
      count: city.count,
      href: `/cities/${city.citySlug}`,
    })),
    restaurants: toExploreGridCards(restaurants, "taxonomy"),
    relatedLinks: [
      {
        href: `/explore?state=${state.stateSlug}`,
        label: `Filter Explore · ${state.state}`,
      },
      ...getRelatedStateLinks(state.stateSlug, 4).map((peer) => ({
        href: `/usa/${peer.stateSlug}`,
        label: peer.state,
      })),
      { href: "/about-michelin-stars", label: "How Michelin Stars Work" },
    ],
    exploreHref: `/explore?state=${state.stateSlug}`,
  };
}

export function toCityPageViewModel(input: {
  city: CityAggregate;
  restaurants: Restaurant[];
}): CityPageViewModel {
  const { city, restaurants } = input;
  const cuisines = getCityCuisineDistribution(city.citySlug, 5);

  return {
    hero: destinationHero({
      title: city.city,
      introduction: `${city.count} Michelin-starred restaurants are listed for ${city.city}, ${city.state} in the current roster (${city.threeStar} three-star, ${city.twoStar} two-star, ${city.oneStar} one-star).`,
      count: city.count,
      tone: "destination",
      breadcrumbs: [
        { name: "Home", path: "/" },
        { name: "Explore", path: "/explore" },
        { name: city.state, path: `/usa/${city.stateSlug}` },
        { name: city.city, path: `/cities/${city.citySlug}` },
      ],
    }),
    distinction: {
      oneStar: city.oneStar,
      twoStar: city.twoStar,
      threeStar: city.threeStar,
      total: city.count,
    },
    cuisines,
    restaurants: toExploreGridCards(restaurants, "taxonomy"),
    relatedLinks: [
      {
        href: `/usa/${city.stateSlug}`,
        label: `All of ${city.state}`,
      },
      {
        href: `/explore?city=${city.citySlug}`,
        label: `Filter Explore · ${city.city}`,
      },
      ...cuisines.slice(0, 4).map((item) => ({
        href: `/cuisines/${item.cuisineSlug}`,
        label: item.cuisine,
      })),
    ],
    stateHref: `/usa/${city.stateSlug}`,
    stateName: city.state,
  };
}

export function toCuisinePageViewModel(input: {
  cuisine: CuisineAggregate;
  restaurants: Restaurant[];
}): CuisinePageViewModel {
  const { cuisine, restaurants } = input;
  const hubs = getCuisineCityHubs(cuisine.cuisineSlug);
  const relatedCuisines = getRelatedCuisineLinks(cuisine.cuisineSlug, 6);

  return {
    hero: destinationHero({
      title: cuisine.cuisine,
      introduction: `${cuisine.count} restaurants labeled ${cuisine.cuisine} appear in the current Michelin-starred United States roster. Cuisine labels are preserved from the source workbook.`,
      count: cuisine.count,
      tone: "cuisine",
      breadcrumbs: [
        { name: "Home", path: "/" },
        { name: "Explore", path: "/explore" },
        { name: cuisine.cuisine, path: `/cuisines/${cuisine.cuisineSlug}` },
      ],
    }),
    hubs,
    restaurants: toExploreGridCards(restaurants, "taxonomy"),
    relatedCuisines,
    exploreHref: `/explore?cuisine=${cuisine.cuisineSlug}`,
  };
}

const ONE_STAR_GRID_LIMIT = 24;

export function toStarPageViewModel(input: {
  stars: 1 | 2 | 3;
  restaurants: Restaurant[];
}): StarPageViewModel {
  const { stars, restaurants } = input;
  const aggregates = getStarAggregates();
  const count =
    aggregates.find((item) => item.stars === stars)?.count ?? restaurants.length;
  const label =
    stars === 1 ? "One Michelin Star" : stars === 2 ? "Two Michelin Stars" : "Three Michelin Stars";
  const shortLabel = stars === 1 ? "1-star" : `${stars}-star`;

  const showAll = stars !== 1;
  const visible = showAll
    ? restaurants
    : restaurants.slice(0, ONE_STAR_GRID_LIMIT);
  const remainingCount = showAll
    ? 0
    : Math.max(0, restaurants.length - ONE_STAR_GRID_LIMIT);

  return {
    stars,
    hero: {
      title: label,
      introduction: `${count} restaurants currently carry a ${shortLabel} Michelin Guide distinction in this United States roster. In Guide terms: ${STAR_MEANINGS[stars]}. Dining Passport is independent and not affiliated with Michelin.`,
      count,
      countLabel: countLabel(count),
      imageSrc: null,
      imageAlt: "",
      tone: "soft",
      starMarks: stars,
      breadcrumbs: [
        { name: "Home", path: "/" },
        { name: "Michelin Stars", path: "/about-michelin-stars" },
        { name: label, path: `/stars/${stars}` },
      ],
    },
    meaning: STAR_MEANINGS[stars],
    restaurants: toExploreGridCards(visible, "taxonomy"),
    remainingExploreHref:
      remainingCount > 0 ? `/explore?stars=${stars}` : null,
    remainingCount,
    otherDistinctions: ([1, 2, 3] as const).map((value) => ({
      stars: value,
      href: `/stars/${value}`,
      label:
        value === 1
          ? "One Michelin Star"
          : value === 2
            ? "Two Michelin Stars"
            : "Three Michelin Stars",
      count:
        aggregates.find((item) => item.stars === value)?.count ?? 0,
      meaning: STAR_MEANINGS[value],
      current: value === stars,
    })),
    exploreHref: `/explore?stars=${stars}`,
    mapHref: "/map",
  };
}
