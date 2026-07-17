"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import MapGL, {
  GeolocateControl,
  Layer,
  NavigationControl,
  Popup,
  Source,
  type MapRef,
} from "react-map-gl/maplibre";
import type { MapLayerMouseEvent } from "maplibre-gl";
import type { MappableRestaurant } from "@/lib/data/geocodes";
import {
  buildExploreHref,
  filterRestaurants,
  parseExploreSearchParams,
} from "@/lib/data/explore";
import { usePassport } from "@/lib/passport/PassportProvider";

type RestaurantMapProps = {
  restaurants: MappableRestaurant[];
  initialQuery?: Record<string, string | string[] | undefined>;
};

const STYLE_URL =
  process.env.NEXT_PUBLIC_MAP_STYLE_URL ||
  "https://demotiles.maplibre.org/style.json";

export function RestaurantMap({
  restaurants,
  initialQuery = {},
}: RestaurantMapProps) {
  const mapRef = useRef<MapRef>(null);
  const { ready, store } = usePassport();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [hoverSlug, setHoverSlug] = useState<string | null>(null);
  const [savedOnly, setSavedOnly] = useState(false);
  const [visitedOnly, setVisitedOnly] = useState(false);
  const [includeUncertain, setIncludeUncertain] = useState(false);

  const exploreQuery = useMemo(
    () => parseExploreSearchParams(initialQuery),
    [initialQuery],
  );

  const filtered = useMemo(() => {
    let items = filterRestaurants(
      restaurants,
      exploreQuery,
    ) as MappableRestaurant[];
    items = items.filter((item) => {
      if (
        !includeUncertain &&
        (!item.geocode.approved || item.geocode.uncertain)
      ) {
        return false;
      }
      if (!ready) return true;
      const record = store.userRestaurants[item.slug];
      if (savedOnly && !record?.saved) return false;
      if (visitedOnly && !record?.visited) return false;
      return true;
    });
    return items;
  }, [
    exploreQuery,
    includeUncertain,
    ready,
    restaurants,
    savedOnly,
    store.userRestaurants,
    visitedOnly,
  ]);

  const bySlug = useMemo(() => {
    const lookup = new globalThis.Map<string, MappableRestaurant>();
    for (const item of filtered) lookup.set(item.slug, item);
    return lookup;
  }, [filtered]);

  const selected =
    bySlug.get(selectedSlug ?? "") ?? bySlug.get(hoverSlug ?? "") ?? null;

  const geojson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: filtered.map((restaurant) => ({
        type: "Feature" as const,
        properties: {
          slug: restaurant.slug,
          name: restaurant.name,
          uncertain: restaurant.geocode.uncertain,
        },
        geometry: {
          type: "Point" as const,
          coordinates: [restaurant.longitude, restaurant.latitude],
        },
      })),
    }),
    [filtered],
  );

  const initialView = useMemo(() => {
    if (filtered.length === 0) {
      return { longitude: -98.5, latitude: 39.8, zoom: 3.2 };
    }
    const lng =
      filtered.reduce((sum, item) => sum + item.longitude, 0) / filtered.length;
    const lat =
      filtered.reduce((sum, item) => sum + item.latitude, 0) / filtered.length;
    return {
      longitude: lng,
      latitude: lat,
      zoom: filtered.length < 8 ? 10 : 4.2,
    };
  }, [filtered]);

  const fitFiltered = () => {
    const map = mapRef.current;
    if (!map || filtered.length === 0) return;
    const lngs = filtered.map((item) => item.longitude);
    const lats = filtered.map((item) => item.latitude);
    map.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      { padding: 48, duration: 500 },
    );
  };

  const onMapClick = (event: MapLayerMouseEvent) => {
    const feature = event.features?.[0];
    if (!feature) return;
    const slug = feature.properties?.slug;
    if (typeof slug === "string") setSelectedSlug(slug);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 font-sans text-sm">
          <button
            type="button"
            className={`min-h-10 border px-3 ${savedOnly ? "border-forest bg-forest text-bg-elevated" : "border-border"}`}
            aria-pressed={savedOnly}
            onClick={() => setSavedOnly((value) => !value)}
          >
            Saved only
          </button>
          <button
            type="button"
            className={`min-h-10 border px-3 ${visitedOnly ? "border-forest bg-forest text-bg-elevated" : "border-border"}`}
            aria-pressed={visitedOnly}
            onClick={() => setVisitedOnly((value) => !value)}
          >
            Visited only
          </button>
          <button
            type="button"
            className={`min-h-10 border px-3 ${includeUncertain ? "border-burgundy bg-burgundy text-bg-elevated" : "border-border"}`}
            aria-pressed={includeUncertain}
            onClick={() => setIncludeUncertain((value) => !value)}
          >
            Show uncertain geocodes
          </button>
          <button
            type="button"
            className="min-h-10 border border-border px-3"
            onClick={fitFiltered}
          >
            Fit to results
          </button>
          <Link
            href={buildExploreHref(exploreQuery)}
            className="inline-flex min-h-10 items-center border border-border px-3"
          >
            Open matching Explore
          </Link>
        </div>

        <div className="relative h-[min(70vh,40rem)] overflow-hidden border border-border">
          <MapGL
            ref={mapRef}
            initialViewState={initialView}
            mapStyle={STYLE_URL}
            attributionControl={{ compact: true }}
            interactiveLayerIds={["restaurant-points", "restaurant-clusters"]}
            onClick={onMapClick}
            style={{ width: "100%", height: "100%" }}
          >
            <NavigationControl position="top-left" showCompass={false} />
            <GeolocateControl
              position="top-left"
              positionOptions={{ enableHighAccuracy: false }}
              trackUserLocation={false}
            />
            <Source
              id="restaurants"
              type="geojson"
              data={geojson}
              cluster
              clusterMaxZoom={12}
              clusterRadius={50}
            >
              <Layer
                id="restaurant-clusters"
                type="circle"
                filter={["has", "point_count"]}
                paint={{
                  "circle-color": "#1f3d2f",
                  "circle-radius": [
                    "step",
                    ["get", "point_count"],
                    16,
                    10,
                    22,
                    30,
                    28,
                  ],
                }}
              />
              <Layer
                id="restaurant-cluster-count"
                type="symbol"
                filter={["has", "point_count"]}
                layout={{
                  "text-field": "{point_count_abbreviated}",
                  "text-size": 12,
                }}
                paint={{ "text-color": "#fffdf8" }}
              />
              <Layer
                id="restaurant-points"
                type="circle"
                filter={["!", ["has", "point_count"]]}
                paint={{
                  "circle-color": [
                    "case",
                    ["get", "uncertain"],
                    "#7a2e3a",
                    "#1f3d2f",
                  ],
                  "circle-radius": 6,
                  "circle-stroke-width": 1,
                  "circle-stroke-color": "#fffdf8",
                }}
              />
            </Source>
            {selected ? (
              <Popup
                longitude={selected.longitude}
                latitude={selected.latitude}
                anchor="bottom"
                onClose={() => setSelectedSlug(null)}
                closeOnClick={false}
              >
                <div className="font-sans text-sm">
                  <p className="font-medium text-ink">{selected.name}</p>
                  <p className="text-ink-muted">
                    {selected.city}, {selected.stateCode}
                  </p>
                  <Link
                    href={`/restaurants/${selected.slug}`}
                    className="mt-1 inline-block text-forest underline"
                  >
                    Open page
                  </Link>
                </div>
              </Popup>
            ) : null}
          </MapGL>
          <p className="pointer-events-none absolute bottom-2 left-2 bg-bg-elevated/90 px-2 py-1 font-sans text-xs text-ink-muted">
            {filtered.length} mapped · works without location permission
          </p>
        </div>
      </div>

      <aside className="border border-border bg-bg-elevated/50 lg:max-h-[min(70vh,40rem)] lg:overflow-y-auto">
        <div className="border-b border-border px-4 py-3">
          <h2 className="font-display text-xl text-ink">Results</h2>
          <p className="mt-1 font-sans text-xs text-ink-muted">
            Map and list stay in sync. Uncertain geocodes stay hidden until
            reviewed unless enabled.
          </p>
        </div>
        <ul className="divide-y divide-border">
          {filtered.slice(0, 50).map((restaurant) => (
            <li key={restaurant.slug}>
              <button
                type="button"
                className={`w-full px-4 py-3 text-left hover:bg-bg ${
                  restaurant.slug === selectedSlug ? "bg-bg" : ""
                }`}
                onMouseEnter={() => setHoverSlug(restaurant.slug)}
                onMouseLeave={() => setHoverSlug(null)}
                onClick={() => {
                  setSelectedSlug(restaurant.slug);
                  mapRef.current?.flyTo({
                    center: [restaurant.longitude, restaurant.latitude],
                    zoom: 11,
                    duration: 500,
                  });
                }}
              >
                <span className="font-display text-lg text-ink">
                  {restaurant.name}
                </span>
                <span className="mt-1 block font-sans text-xs text-ink-muted">
                  {restaurant.city}, {restaurant.stateCode}
                  {restaurant.geocode.uncertain ? " · uncertain geocode" : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
        {filtered.length === 0 ? (
          <p className="px-4 py-8 font-sans text-sm text-ink-muted">
            No mappable restaurants match the current filters. Finish batch
            geocoding or enable uncertain markers.
          </p>
        ) : null}
      </aside>
    </div>
  );
}
