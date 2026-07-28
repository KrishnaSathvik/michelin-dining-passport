"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { MapRestaurant, MappableRestaurant } from "@/lib/data/geocodes";
import { getApprovedGooglePlaceId } from "@/lib/google-places/place-ids";
import { MapPinCard } from "@/components/stitch/map/MapPinCard";
import { MapSearchBox } from "@/components/stitch/map/MapSearchBox";

const MapCanvas = dynamic(
  () => import("./MapCanvas").then((mod) => mod.MapCanvas),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-full min-h-[20rem] items-center justify-center bg-dp-soft font-sans text-sm text-dp-ink-muted"
        role="status"
      >
        Loading map…
      </div>
    ),
  },
);

type RestaurantMapProps = {
  restaurants: MapRestaurant[];
};

/**
 * A single full-bleed U.S. map of Michelin pins.
 * Click a pin to preview one restaurant; click the preview to open its page.
 * No sidebar, search, filters, or results list — by design.
 */
export function RestaurantMap({ restaurants }: RestaurantMapProps) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [flyToSlug, setFlyToSlug] = useState<string | null>(null);

  const mappable = useMemo(
    () =>
      restaurants.filter(
        (item): item is MappableRestaurant => item.hasApprovedCoordinates,
      ),
    [restaurants],
  );

  const selected = mappable.find((item) => item.slug === selectedSlug) ?? null;
  const selectedPlaceId = selected
    ? getApprovedGooglePlaceId(selected.slug)
    : null;

  const selectRestaurant = (slug: string) => {
    setSelectedSlug(slug);
    setFlyToSlug(slug);
  };

  return (
    <div
      className="relative flex min-h-0 w-full flex-1 flex-col"
      data-map="single"
    >
      <h1 className="sr-only">Map</h1>
      {/* flex-1 grows into the shell's height; absolute inset-0 fills it
          reliably (h-full alone collapses in a flex column). */}
      <div className="relative min-h-0 w-full flex-1">
        <div className="absolute inset-0">
          <MapCanvas
            restaurants={mappable}
            selectedSlug={selectedSlug}
            onSelectSlug={(slug) => {
              setSelectedSlug(slug);
              if (slug) setFlyToSlug(slug);
            }}
            onBoundsChange={() => {}}
            fitToken={0}
            flyToSlug={flyToSlug}
          />
        </div>

        <MapSearchBox restaurants={mappable} onSelect={selectRestaurant} />

        {selected ? (
          <MapPinCard
            restaurant={selected}
            googlePlaceId={selectedPlaceId}
            onClose={() => setSelectedSlug(null)}
          />
        ) : null}
      </div>
    </div>
  );
}
