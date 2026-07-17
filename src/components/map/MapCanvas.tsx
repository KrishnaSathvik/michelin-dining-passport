"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { useEffect, useMemo, useRef, useState } from "react";
import MapGL, {
  GeolocateControl,
  Layer,
  Marker,
  NavigationControl,
  Source,
  type MapRef,
} from "react-map-gl/maplibre";
import type { MapLayerMouseEvent, Map as MaplibreMap } from "maplibre-gl";
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

  useEffect(() => {
    const map = mapRef.current;
    if (!map || plotted.length === 0) return;
    const lngs = plotted.map((item) => item.longitude);
    const lats = plotted.map((item) => item.latitude);
    map.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      {
        padding: 56,
        duration: reduceMotion ? 0 : 500,
      },
    );
  }, [fitToken, plotted, reduceMotion]);

  useEffect(() => {
    if (!flyToSlug) return;
    const target = bySlug.get(flyToSlug);
    const map = mapRef.current;
    if (!target || !map) return;
    map.flyTo({
      center: [target.longitude, target.latitude],
      zoom: Math.max(map.getZoom(), 11),
      duration: reduceMotion ? 0 : 450,
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
      if (!map || typeof clusterId !== "number") return;
      const source = map.getSource("restaurants");
      if (source && "getClusterExpansionZoom" in source) {
        (
          source as {
            getClusterExpansionZoom: (
              id: number,
              cb: (err: Error | null, zoom: number) => void,
            ) => void;
          }
        ).getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || !feature.geometry || feature.geometry.type !== "Point") {
            return;
          }
          map.easeTo({
            center: feature.geometry.coordinates as [number, number],
            zoom,
            duration: reduceMotion ? 0 : 300,
          });
        });
      }
      return;
    }
    const slug = feature.properties?.slug;
    if (typeof slug === "string") onSelectSlug(slug);
  };

  if (failed) {
    return (
      <div
        className={`flex h-full min-h-[20rem] flex-col justify-center border border-border bg-bg-elevated px-4 py-8 ${className ?? ""}`}
        role="alert"
      >
        <p className="font-display text-xl text-ink">Map unavailable</p>
        <p className="mt-2 font-sans text-sm text-ink-muted">
          The map failed to initialize. The restaurant list remains available
          with the same filters.
        </p>
        <p className="mt-3 font-sans text-xs text-ink-muted">
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
        reuseMaps
      >
        <NavigationControl position="top-left" showCompass={false} />
        <GeolocateControl
          position="top-left"
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
              "circle-color": [
                "case",
                ["get", "selected"],
                "#B88A2A",
                "#123B2F",
              ],
              "circle-radius": ["case", ["get", "selected"], 9, 6],
              "circle-stroke-width": 2,
              "circle-stroke-color": "#FFFFFF",
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
              className="block h-4 w-4 rounded-full border-2 border-white bg-[#B88A2A] shadow-md"
            />
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
