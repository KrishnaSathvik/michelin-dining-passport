import { absoluteUrl, siteConfig } from "@/config/site";
import type { Restaurant } from "@/lib/data/types";

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function restaurantJsonLd(restaurant: Restaurant) {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurant.name,
    url: absoluteUrl(`/restaurants/${restaurant.slug}`),
    servesCuisine: restaurant.cuisine,
    address: {
      "@type": "PostalAddress",
      streetAddress: restaurant.address,
      addressLocality: restaurant.city,
      addressRegion: restaurant.stateCode,
      addressCountry: "US",
    },
    priceRange: restaurant.price,
    ...(restaurant.website ? { sameAs: [restaurant.website, restaurant.michelinGuideUrl] } : { sameAs: [restaurant.michelinGuideUrl] }),
    description: `${restaurant.stars}-star Michelin Guide restaurant in ${restaurant.city}, ${restaurant.state}. Listed on ${siteConfig.productName}, an independent platform.`,
  };
}
