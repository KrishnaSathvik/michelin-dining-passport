import type { Restaurant } from "@/lib/data/types";
import { absoluteUrl } from "@/config/site";

/**
 * schema.org `Restaurant` structured data for a detail page.
 *
 * Only the fields we can assert from first-party catalog data are emitted —
 * no ratings, hours, or photos (those are Google's live content and must not
 * be baked into markup). Rich-result eligible without implying data we don't
 * independently hold.
 */
/**
 * Serialize structured data for inlining in a `<script type="application/ld+json">`.
 * Escapes `<` so no field value (e.g. a name containing `</script>`) can break
 * out of the tag — the only injection vector for otherwise-static JSON-LD.
 */
export function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function restaurantJsonLd(restaurant: Restaurant): Record<string, unknown> {
  const url = absoluteUrl(`/restaurants/${restaurant.slug}`);
  const sameAs = [restaurant.website, restaurant.michelinGuideUrl].filter(
    (value): value is string => Boolean(value),
  );

  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurant.name,
    url,
    servesCuisine: restaurant.cuisine,
    priceRange: restaurant.price,
    award: `${restaurant.stars} Michelin Star${restaurant.stars > 1 ? "s" : ""}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: restaurant.address,
      addressLocality: restaurant.city,
      addressRegion: restaurant.stateCode,
      addressCountry: "US",
    },
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}
