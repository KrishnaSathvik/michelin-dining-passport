/**
 * Curated homepage featured restaurants.
 * Replace slugs here without editing homepage component logic.
 *
 * Selection criteria for the initial set:
 * - Mix of 1-, 2-, and 3-star distinctions
 * - Geographic spread across multiple states
 * - Stylistic range across cuisines
 * - No popularity or rating claims (we lack that data)
 */
export const homepageConfig = {
  featuredSectionTitle: "Featured Restaurants",
  featuredSectionDek:
    "Starred restaurants across regions and styles — curated from the live roster for your next journey.",
  /**
   * Stitch explore_feed shows three discovery cards.
   * The first three slugs are used on `/`; remaining slugs are reserved for future modules.
   */
  featuredRestaurantSlugs: [
    "singlethread-healdsburg-ca",
    "kasama-chicago-il",
    "elcielo-miami-miami-fl",
    "minibar-by-jose-andres-washington-dc",
    "semma-new-york-ny",
    "frasca-food-and-wine-boulder-co",
    "harbor-house-inn-elk-ca",
  ],
  cuisinePreviewLimit: 12,
} as const;
