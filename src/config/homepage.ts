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
  featuredSectionTitle: "Michelin experiences to know",
  featuredSectionDek:
    "A starting set of starred restaurants across regions and cooking styles — factual listings only, not a ranking.",
  /**
   * Order matters: first slug is the large editorial feature;
   * the next three are supporting discovery items;
   * remaining slugs appear in the compact list.
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
