/**
 * MapLibre provider-agnostic configuration.
 * Tile credentials belong in env vars — never commit API keys.
 */

export const mapConfig = {
  providerName: "CARTO",
  // Real keyless OSM basemap with U.S. state borders, roads, and city labels.
  // Override with NEXT_PUBLIC_MAP_STYLE_URL if a branded style is provisioned.
  styleUrl:
    process.env.NEXT_PUBLIC_MAP_STYLE_URL ||
    "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
  attribution:
    process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ||
    "© OpenStreetMap contributors · © CARTO",
  defaultCenter: {
    longitude: -96,
    latitude: 37.5,
  },
  defaultZoom: 3.8,
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
