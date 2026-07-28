import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRestaurantBySlug } from "@/lib/data/restaurants";
import type { Restaurant } from "@/lib/data/types";
import { StitchRestaurantGalleryClient } from "@/components/stitch/restaurant/StitchRestaurantGalleryClient";

export const metadata: Metadata = {
  title: "Stitch restaurant components (dev)",
  robots: { index: false, follow: false },
};

const GALLERY_SLUGS = {
  oneStar: "7-adams-san-francisco-ca",
  twoStar: "acquerello-san-francisco-ca",
  threeStar: "addison-san-diego-ca",
  editorial: "singlethread-healdsburg-ca",
  longName: "tambourine-room-by-tristan-brandt-miami-beach-fl",
  list: "benu-san-francisco-ca",
  mapA: "benu-san-francisco-ca",
  mapB: "kasama-chicago-il",
  related: "atelier-crenn-san-francisco-ca",
  nearby: "californios-san-francisco-ca",
} as const;

function requireRestaurant(slug: string): Restaurant {
  const restaurant = getRestaurantBySlug(slug);
  if (!restaurant) {
    throw new Error(`Gallery restaurant missing for ${slug}`);
  }
  return restaurant;
}

/**
 * Development-only Stitch restaurant presentation gallery.
 * Unavailable in production. Does not mount Google Places UI Kit.
 */
export default function StitchRestaurantComponentsPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <StitchRestaurantGalleryClient
      restaurants={{
        oneStar: requireRestaurant(GALLERY_SLUGS.oneStar),
        twoStar: requireRestaurant(GALLERY_SLUGS.twoStar),
        threeStar: requireRestaurant(GALLERY_SLUGS.threeStar),
        editorial: requireRestaurant(GALLERY_SLUGS.editorial),
        longName: requireRestaurant(GALLERY_SLUGS.longName),
        list: requireRestaurant(GALLERY_SLUGS.list),
        mapA: requireRestaurant(GALLERY_SLUGS.mapA),
        mapB: requireRestaurant(GALLERY_SLUGS.mapB),
        related: requireRestaurant(GALLERY_SLUGS.related),
        nearby: requireRestaurant(GALLERY_SLUGS.nearby),
      }}
    />
  );
}
