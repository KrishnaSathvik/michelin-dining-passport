import type { RestaurantCardModel } from "@/components/stitch/restaurant";
import type { BreadcrumbItem } from "@/lib/seo/jsonld";
import type {
  CityCuisineShare,
  CuisineCityHub,
  RelatedCuisineLink,
} from "./aggregations";

export type TaxonomyHeroModel = {
  title: string;
  introduction: string;
  count: number;
  countLabel: string;
  /** Decorative atmosphere path or null for soft-band / gradient fallback */
  imageSrc: string | null;
  imageAlt: string;
  tone: "destination" | "cuisine" | "stars" | "soft";
  breadcrumbs: BreadcrumbItem[];
  /** Soft-band star motif (1–3); omit for photo heroes */
  starMarks?: 1 | 2 | 3;
};

export type TaxonomyStatModel = {
  id: string;
  label: string;
  value: number;
  accessibleLabel: string;
};

export type TaxonomyRelatedLink = {
  href: string;
  label: string;
};

export type StatePageViewModel = {
  hero: TaxonomyHeroModel;
  glance: TaxonomyStatModel[];
  starBreakdown: TaxonomyStatModel[];
  cities: Array<{
    city: string;
    citySlug: string;
    count: number;
    href: string;
  }>;
  restaurants: RestaurantCardModel[];
  relatedLinks: TaxonomyRelatedLink[];
  exploreHref: string;
};

export type CityPageViewModel = {
  hero: TaxonomyHeroModel;
  distinction: {
    oneStar: number;
    twoStar: number;
    threeStar: number;
    total: number;
  };
  cuisines: CityCuisineShare[];
  restaurants: RestaurantCardModel[];
  relatedLinks: TaxonomyRelatedLink[];
  stateHref: string;
  stateName: string;
};

export type CuisinePageViewModel = {
  hero: TaxonomyHeroModel;
  hubs: CuisineCityHub[];
  restaurants: RestaurantCardModel[];
  relatedCuisines: RelatedCuisineLink[];
  exploreHref: string;
};

export type StarPageViewModel = {
  stars: 1 | 2 | 3;
  hero: TaxonomyHeroModel;
  meaning: string;
  restaurants: RestaurantCardModel[];
  /** When set, page shows a capped subset and this Explore CTA. */
  remainingExploreHref: string | null;
  remainingCount: number;
  otherDistinctions: Array<{
    stars: 1 | 2 | 3;
    href: string;
    label: string;
    count: number;
    meaning: string;
    current: boolean;
  }>;
  exploreHref: string;
  mapHref: string;
};

export const STAR_MEANINGS = {
  1: "High-quality cooking worth a stop",
  2: "Excellent cooking worth a detour",
  3: "Exceptional cuisine worth a special journey",
} as const;

export const TAXONOMY_ATMOSPHERE_IMAGE = "/images/homepage-hero.jpg";
