/**
 * Five-restaurant Places UI Kit technical spike fixtures.
 * Place IDs synced from reviewed `data/google-place-ids.json` where applicable.
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
  /** Null simulates rejected / no_match fallback UI. */
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
    placeId: "ChIJ00zCHiAH9YgR3l-kmURAKrM",
  },
  {
    restaurantSlug: "sushi-nakazawa-new-york-new-york-ny",
    label: "Sushi Nakazawa New York",
    scenario: "similar_name_ambiguity",
    scenarioNote:
      "Shares a brand name with Sushi Nakazawa Washington DC — name-alone matching is unsafe.",
    placeId: "ChIJsw80F5NZwokRcDtxajLLOeA",
  },
  {
    restaurantSlug: "crown-shy-new-york-ny",
    label: "Crown Shy",
    scenario: "shared_address_sibling",
    scenarioNote:
      "Shares 70 Pine St with Saga — must remain distinct from the sibling Place ID.",
    placeId: "ChIJ__9LNBZawokREnkOiVx7ydc",
  },
  {
    restaurantSlug: "saga-new-york-ny",
    label: "Fallback demo (no Place ID mounted)",
    scenario: "no_confident_match",
    scenarioNote:
      "Spike-only unavailable fallback demo. Roster Place ID for Saga is reviewed separately; this fixture forces null to exercise the quiet fallback UI.",
    placeId: null,
  },
];
