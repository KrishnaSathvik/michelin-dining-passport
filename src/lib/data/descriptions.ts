import descriptionsFile from "../../../data/descriptions.json";

/**
 * Original editorial descriptions keyed by restaurant slug. Written from
 * publicly reported facts, never copied from the Michelin Guide or reviews.
 * Coverage is partial and grows over time; missing slugs fall back to the
 * factual line built elsewhere. Point-in-time — treat chef/menu specifics as
 * of `updatedAt`.
 */
export type RestaurantDescription = {
  text: string;
  sources: string[];
};

type DescriptionsFile = {
  version: number;
  updatedAt: string;
  descriptions: Record<string, RestaurantDescription>;
};

const data = descriptionsFile as DescriptionsFile;

/** Full description record (text + sources) for a slug, or null if none. */
export function getRestaurantDescriptionRecord(
  slug: string,
): RestaurantDescription | null {
  return data.descriptions[slug] ?? null;
}

/** Just the description prose for a slug, or null if none exists yet. */
export function getRestaurantDescription(slug: string): string | null {
  return data.descriptions[slug]?.text ?? null;
}
