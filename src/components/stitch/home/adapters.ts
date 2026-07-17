import { toRestaurantDiscoveryCardModel } from "@/components/stitch/restaurant";
import { homepageConfig } from "@/config/homepage";
import type { Restaurant } from "@/lib/data/types";
import { getRestaurantReservation } from "@/lib/reservations/data";
import type { HomepageTotals, HomepageViewModel } from "./models";

const HERO_IMAGE = {
  src: "/images/homepage-hero.jpg",
  alt: "Atmospheric fine-dining room with softly lit tables — decorative homepage hero",
} as const;

export function toHomepageViewModel(input: {
  totals: HomepageTotals;
  featuredRestaurants: Restaurant[];
}): HomepageViewModel {
  const { totals } = input;
  const restaurants = input.featuredRestaurants
    .slice(0, 3)
    .map((restaurant) =>
      toRestaurantDiscoveryCardModel(restaurant, {
        reservation: getRestaurantReservation(restaurant.slug),
        surface: "homepage",
      }),
    );

  return {
    hero: {
      headline: "America's Michelin-starred tables",
      supporting: `Explore ${totals.restaurants} starred restaurants across the United States. Save favorites and plan remarkable visits — an independent dining atlas.`,
      imageSrc: HERO_IMAGE.src,
      imageAlt: HERO_IMAGE.alt,
    },
    totals,
    featured: {
      title: homepageConfig.featuredSectionTitle,
      description: homepageConfig.featuredSectionDek,
      viewAllHref: "/explore",
      viewAllLabel: "View All",
      restaurants,
    },
  };
}
