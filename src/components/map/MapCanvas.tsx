"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MapGL, {
  GeolocateControl,
  Layer,
  Marker,
  NavigationControl,
  Source,
  type MapRef,
} from "react-map-gl/maplibre";
import type {
  GeoJSONSource,
  MapLayerMouseEvent,
  Map as MaplibreMap,
} from "maplibre-gl";
import { mapConfig } from "@/config/map";
import type { MappableRestaurant } from "@/lib/data/geocodes";
import { offsetSharedCoordinates } from "@/lib/data/geocodes";

type MapCanvasProps = {
  restaurants: MappableRestaurant[];
  selectedSlug: string | null;
  onSelectSlug: (slug: string | null) => void;
  onBoundsChange: (bounds: {
    west: number;
    south: number;
    east: number;
    north: number;
  }) => void;
  onMapReady?: (ready: boolean) => void;
  fitToken: number;
  flyToSlug: string | null;
  className?: string;
};

export function MapCanvas({
  restaurants,
  selectedSlug,
  onSelectSlug,
  onBoundsChange,
  onMapReady,
  fitToken,
  flyToSlug,
  className,
}: MapCanvasProps) {
  const mapRef = useRef<MapRef>(null);
  const [failed, setFailed] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const plotted = useMemo(
    () => offsetSharedCoordinates(restaurants),
    [restaurants],
  );

  const bySlug = useMemo(() => {
    const lookup = new Map<string, MappableRestaurant>();
    for (const item of plotted) lookup.set(item.slug, item);
    return lookup;
  }, [plotted]);

  const geojson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: plotted.map((restaurant) => ({
        type: "Feature" as const,
        properties: {
          slug: restaurant.slug,
          name: restaurant.name,
          selected: restaurant.slug === selectedSlug,
        },
        geometry: {
          type: "Point" as const,
          coordinates: [restaurant.longitude, restaurant.latitude],
        },
      })),
    }),
    [plotted, selectedSlug],
  );

  /** Frame all pins. Only meaningful once the map is loaded and sized —
      fitting before the container has real dimensions computes a bad zoom. */
  const fitToPlotted = useCallback(
    (map: MaplibreMap, animate: boolean) => {
      if (plotted.length === 0) return;
      const lngs = plotted.map((item) => item.longitude);
      const lats = plotted.map((item) => item.latitude);
      map.fitBounds(
        [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)],
        ],
        {
          padding: 64,
          maxZoom: 6,
          duration: animate && !reduceMotion ? 500 : 0,
        },
      );
    },
    [plotted, reduceMotion],
  );

  // Re-fit when explicitly asked (fitToken) — the initial fit runs on load.
  const didFitToken = useRef(0);
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || fitToken === didFitToken.current) return;
    didFitToken.current = fitToken;
    fitToPlotted(map, true);
  }, [fitToken, fitToPlotted]);

  useEffect(() => {
    if (!flyToSlug) return;
    const target = bySlug.get(flyToSlug);
    const map = mapRef.current;
    if (!target || !map) return;
    map.flyTo({
      center: [target.longitude, target.latitude],
      // Past clusterMaxZoom so the target shows as an individual pin.
      zoom: Math.max(map.getZoom(), 14),
      duration: reduceMotion ? 0 : 600,
    });
  }, [bySlug, flyToSlug, reduceMotion]);

  const emitBounds = (map: MaplibreMap) => {
    const bounds = map.getBounds();
    onBoundsChange({
      west: bounds.getWest(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      north: bounds.getNorth(),
    });
  };

  const onMapClick = (event: MapLayerMouseEvent) => {
    const feature = event.features?.[0];
    if (!feature) {
      onSelectSlug(null);
      return;
    }
    if (feature.layer?.id === "restaurant-clusters") {
      const map = mapRef.current;
      const clusterId = feature.properties?.cluster_id;
      const source = map?.getSource("restaurants") as GeoJSONSource | undefined;
      if (
        !map ||
        !source ||
        typeof clusterId !== "number" ||
        feature.geometry?.type !== "Point"
      ) {
        return;
      }
      const center = feature.geometry.coordinates as [number, number];
      // maplibre-gl v5: getClusterExpansionZoom returns a Promise.
      void source
        .getClusterExpansionZoom(clusterId)
        .then((zoom) => {
          map.easeTo({ center, zoom, duration: reduceMotion ? 0 : 300 });
        })
        .catch(() => {
          // Fall back to a gentle zoom-in on the cluster center.
          map.easeTo({
            center,
            zoom: Math.min(map.getZoom() + 2, mapConfig.maxZoom),
            duration: reduceMotion ? 0 : 300,
          });
        });
      return;
    }
    const slug = feature.properties?.slug;
    if (typeof slug === "string") onSelectSlug(slug);
  };

  if (failed) {
    return (
      <div
        className={`flex h-full min-h-[20rem] flex-col justify-center border border-dp-border bg-dp-surface px-4 py-8 ${className ?? ""}`}
        role="alert"
        data-map-unavailable
      >
        <p className="font-display text-xl text-dp-ink">Map unavailable</p>
        <p className="mt-2 font-sans text-sm text-dp-ink-muted">
          The map failed to initialize. The restaurant list remains available
          with the same filters.
        </p>
        <p className="mt-3 font-sans text-xs text-dp-ink-muted">
          {mapConfig.attribution}
        </p>
      </div>
    );
  }

  return (
    <div className={`relative h-full min-h-[20rem] ${className ?? ""}`}>
      <MapGL
        ref={mapRef}
        initialViewState={{
          longitude: mapConfig.defaultCenter.longitude,
          latitude: mapConfig.defaultCenter.latitude,
          zoom: mapConfig.defaultZoom,
        }}
        mapStyle={mapConfig.styleUrl}
        attributionControl={{ compact: true, customAttribution: mapConfig.attribution }}
        interactiveLayerIds={["restaurant-points", "restaurant-clusters"]}
        onClick={onMapClick}
        onLoad={(event) => {
          onMapReady?.(true);
          emitBounds(event.target);
        }}
        onError={() => {
          setFailed(true);
          onMapReady?.(false);
        }}
        onMoveEnd={(event) => emitBounds(event.target)}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="bottom-right" showCompass={false} />
        <GeolocateControl
          position="bottom-right"
          positionOptions={{ enableHighAccuracy: false }}
          trackUserLocation={false}
          onError={() =>
            setLocationError(
              "Location permission denied or unavailable. You can keep browsing the map without it.",
            )
          }
          onGeolocate={() => setLocationError(null)}
        />
        <Source
          id="restaurants"
          type="geojson"
          data={geojson}
          cluster
          clusterMaxZoom={mapConfig.clusterMaxZoom}
          clusterRadius={mapConfig.clusterRadius}
        >
          <Layer
            id="restaurant-clusters"
            type="circle"
            filter={["has", "point_count"]}
            paint={{
              "circle-color": "#123B2F",
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
            paint={{ "text-color": "#FFFFFF" }}
          />
          <Layer
            id="restaurant-points"
            type="circle"
            filter={["!", ["has", "point_count"]]}
            paint={{
              "circle-color": "#123B2F",
              "circle-radius": ["case", ["get", "selected"], 11, 8],
              "circle-stroke-width": [
                "case",
                ["get", "selected"],
                3,
                2,
              ],
              "circle-stroke-color": [
                "case",
                ["get", "selected"],
                "#B88A2A",
                "#FFFFFF",
              ],
            }}
          />
        </Source>
        {selectedSlug && bySlug.get(selectedSlug) ? (
          <Marker
            longitude={bySlug.get(selectedSlug)!.longitude}
            latitude={bySlug.get(selectedSlug)!.latitude}
            anchor="center"
          >
            <span className="sr-only">Selected restaurant marker</span>
            <span
              aria-hidden
              className="relative flex h-10 w-10 items-center justify-center"
              data-map-selected-marker
            >
              <span className="absolute -inset-2 rounded-full border border-[#B88A2A]/50" />
              <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#B88A2A] bg-[#123B2F] text-white shadow-lg">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M8 3v8M12 3v8M16 3v8M8 11c0 3 2 5 4 8v2M16 11c0 3-2 5-4 8"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </span>
          </Marker>
        ) : null}
      </MapGL>

      {locationError ? (
        <p
          className="absolute left-2 right-2 top-2 bg-bg-elevated/95 px-3 py-2 font-sans text-xs text-ink"
          role="status"
        >
          {locationError}
        </p>
      ) : null}
    </div>
  );
}
