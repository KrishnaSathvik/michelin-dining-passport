/**
 * MapLibre provider-agnostic configuration.
 * Tile credentials belong in env vars — never commit API keys.
 */

export const mapConfig = {
  providerName: "MapLibre",
  styleUrl:
    process.env.NEXT_PUBLIC_MAP_STYLE_URL ||
    "https://demotiles.maplibre.org/style.json",
  attribution:
    process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ||
    "© OpenStreetMap contributors · © MapLibre",
  defaultCenter: {
    longitude: -98.5,
    latitude: 39.8,
  },
  defaultZoom: 3.4,
  minZoom: 2,
  maxZoom: 18,
  /** Contiguous U.S. focus bounds [west, south, east, north] */
  maxBounds: [-130, 20, -60, 52] as [number, number, number, number],
  clusterMaxZoom: 12,
  clusterRadius: 50,
} as const;

export type MapBounds = {
  west: number;
  south: number;
  east: number;
  north: number;
};
