import type { ExploreQuery } from "@/lib/data/explore";
import {
  buildExploreSearchParams,
  parseExploreSearchParams,
} from "@/lib/data/explore";
import type { MapBounds } from "@/config/map";

export type MapQuery = ExploreQuery & {
  savedOnly: boolean;
  visitedOnly: boolean;
  selected: string;
  bounds: MapBounds | null;
  panel: "map" | "list";
};

function readParam(
  value: string | string[] | undefined,
): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function roundCoord(value: number): number {
  return Math.round(value * 1e4) / 1e4;
}

export function parseBoundsParam(raw: string): MapBounds | null {
  const parts = raw.split(",").map((part) => Number(part.trim()));
  if (parts.length !== 4) return null;
  const [west, south, east, north] = parts;
  if (![west, south, east, north].every((value) => Number.isFinite(value))) {
    return null;
  }
  if (west >= east || south >= north) return null;
  return { west, south, east, north };
}

export function formatBoundsParam(bounds: MapBounds): string {
  return [
    roundCoord(bounds.west),
    roundCoord(bounds.south),
    roundCoord(bounds.east),
    roundCoord(bounds.north),
  ].join(",");
}

export function parseMapSearchParams(
  params: Record<string, string | string[] | undefined>,
): MapQuery {
  const explore = parseExploreSearchParams(params);
  const panelRaw = readParam(params.panel).trim();
  const bounds = parseBoundsParam(readParam(params.bounds).trim());

  return {
    ...explore,
    savedOnly: readParam(params.saved) === "1",
    visitedOnly: readParam(params.visited) === "1",
    selected: readParam(params.selected).trim(),
    bounds,
    panel: panelRaw === "list" ? "list" : "map",
  };
}

export function buildMapSearchParams(query: MapQuery): URLSearchParams {
  const params = buildExploreSearchParams(query);
  if (query.savedOnly) params.set("saved", "1");
  if (query.visitedOnly) params.set("visited", "1");
  if (query.selected) params.set("selected", query.selected);
  if (query.bounds) params.set("bounds", formatBoundsParam(query.bounds));
  if (query.panel === "list") params.set("panel", "list");
  return params;
}

export function buildMapHref(query: MapQuery): string {
  const qs = buildMapSearchParams(query).toString();
  return qs ? `/map?${qs}` : "/map";
}

export function boundsMeaningfullyDifferent(
  current: MapBounds,
  previous: MapBounds | null,
  threshold = 0.02,
): boolean {
  if (!previous) return true;
  return (
    Math.abs(current.west - previous.west) > threshold ||
    Math.abs(current.south - previous.south) > threshold ||
    Math.abs(current.east - previous.east) > threshold ||
    Math.abs(current.north - previous.north) > threshold
  );
}
