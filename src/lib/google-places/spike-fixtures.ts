/**
 * Five-restaurant Places UI Kit technical spike fixtures.
 * Provisional Place IDs for local verification only — GP2 matching replaces these.
 */

export type SpikeScenario =
  | "strong_coverage"
  | "limited_photos"
  | "similar_name_ambiguity"
  | "shared_address_sibling"
  | "no_confident_match";

export type SpikeFixture = {
  restaurantSlug: string;
  label: string;
  scenario: SpikeScenario;
  scenarioNote: string;
  /** Null simulates rejected / no_match. */
  placeId: string | null;
};

export const GOOGLE_PLACES_SPIKE_FIXTURES: SpikeFixture[] = [
  {
    restaurantSlug: "alinea-chicago-il",
    label: "Alinea",
    scenario: "strong_coverage",
    scenarioNote: "Strong Google photos and review coverage.",
    placeId: "ChIJuyI60yLTD4gROwTWENq1He0",
  },
  {
    restaurantSlug: "lazy-betty-atlanta-ga",
    label: "Lazy Betty",
    scenario: "limited_photos",
    scenarioNote:
      "Smaller-market restaurant relative to Alinea — useful for thinner media coverage checks.",
    placeId: "ChIJ8c6xXQ0E9YgR5-373N6fF4s",
  },
  {
    restaurantSlug: "sushi-nakazawa-new-york-new-york-ny",
    label: "Sushi Nakazawa New York",
    scenario: "similar_name_ambiguity",
    scenarioNote:
      "Shares a brand name with Sushi Nakazawa Washington DC — name-alone matching is unsafe.",
    placeId: "ChIJ6z1l1y5YwokR6W_l8aK_g2I",
  },
  {
    restaurantSlug: "crown-shy-new-york-ny",
    label: "Crown Shy",
    scenario: "shared_address_sibling",
    scenarioNote:
      "Shares 70 Pine St with Saga — must remain distinct from the sibling Place ID.",
    placeId: "ChIJyUuE1otYwokR-j9xV7lB03A",
  },
  {
    restaurantSlug: "saga-new-york-ny",
    label: "Saga (no Place ID)",
    scenario: "no_confident_match",
    scenarioNote: "Spike stand-in for missing / rejected Google match.",
    placeId: null,
  },
];
