import type { RestaurantCardModel } from "@/components/stitch/restaurant";

export type HomepageTotals = {
  restaurants: number;
  oneStar: number;
  twoStar: number;
  threeStar: number;
};

export type HomepageHeroModel = {
  headline: string;
  supporting: string;
  /** Generic atmospheric hero image — never a named-restaurant photo. */
  imageSrc: string;
  imageAlt: string;
};

export type HomepageFeaturedSectionModel = {
  title: string;
  description: string;
  viewAllHref: string;
  viewAllLabel: string;
  restaurants: RestaurantCardModel[];
};

export type HomepageViewModel = {
  hero: HomepageHeroModel;
  totals: HomepageTotals;
  featured: HomepageFeaturedSectionModel;
};
