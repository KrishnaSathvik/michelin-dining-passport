"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { useState } from "react";
import MapGL, { Marker, NavigationControl } from "react-map-gl/maplibre";
import { mapConfig } from "@/config/map";

type RestaurantDetailMapClientProps = {
  name: string;
  stars: 1 | 2 | 3;
  latitude: number;
  longitude: number;
};

export default function RestaurantDetailMapClient({
  name,
  stars,
  latitude,
  longitude,
}: RestaurantDetailMapClientProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className="flex h-full flex-col items-center justify-center bg-dp-surface-low px-6 text-center"
        role="status"
      >
        <p className="font-display text-xl text-dp-ink">
          Map is temporarily unavailable
        </p>
        <p className="mt-2 font-sans text-sm text-dp-ink-muted">
          The address and directions links remain available.
        </p>
      </div>
    );
  }

  return (
    <MapGL
      initialViewState={{
        longitude,
        latitude,
        zoom: 14.5,
      }}
      mapStyle={mapConfig.styleUrl}
      attributionControl={{
        compact: true,
        customAttribution: mapConfig.attribution,
      }}
      dragRotate={false}
      pitchWithRotate={false}
      scrollZoom={false}
      cooperativeGestures
      maxZoom={mapConfig.maxZoom}
      minZoom={mapConfig.minZoom}
      onError={() => setFailed(true)}
      style={{ width: "100%", height: "100%" }}
      reuseMaps
    >
      <NavigationControl position="top-right" showCompass={false} />
      <Marker longitude={longitude} latitude={latitude} anchor="bottom">
        <span className="sr-only">
          {name}, {stars} Michelin {stars === 1 ? "Star" : "Stars"}
        </span>
        <span
          aria-hidden="true"
          className="flex flex-col items-center gap-1"
        >
          <span className="max-w-[15rem] truncate rounded-full bg-white px-3 py-1 font-display text-sm font-semibold text-dp-ink shadow-md ring-1 ring-black/5">
            {name}
          </span>
          <span className="h-4 w-4 rounded-full border-2 border-white bg-dp-primary shadow-lg" />
        </span>
      </Marker>
    </MapGL>
  );
}
