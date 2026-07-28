"use client";

import { useEffect, useRef, useState } from "react";
import { RestaurantFallback } from "@/components/stitch/restaurant/RestaurantFallback";
import { getGooglePlacesUiKitAvailability } from "@/lib/google-places/config";
import {
  loadGooglePlacesUiKit,
  type GooglePlacesLoaderState,
} from "@/lib/google-places/loader";
import { recordGooglePlacesQueryIntent } from "@/lib/google-places/query-intent";
import { useNearViewport } from "./useNearViewport";

type GooglePlaceCardMediaProps = {
  placeId: string;
  restaurantSlug: string;
  /** Analytics surface, e.g. "explore". */
  page: string;
  name: string;
  seed?: string;
  city?: string;
  stars?: 1 | 2 | 3;
  /** Aspect-ratio wrapper class shared with RestaurantMedia. */
  ratioClass?: string;
  className?: string;
  /** Eager-load the topmost cards (above the fold). */
  priority?: boolean;
};

/** Minimal shape of the Maps JS Place photo API we rely on. */
type PlacePhoto = {
  getURI: (options?: { maxWidth?: number; maxHeight?: number }) => string;
  authorAttributions?: { displayName?: string }[];
};
type PlaceInstance = {
  photos?: PlacePhoto[];
  fetchFields: (options: { fields: string[] }) => Promise<unknown>;
};
type PlaceConstructor = new (options: { id: string }) => PlaceInstance;

type Resolved =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; url: string; attribution: string | null };

/**
 * Single cover photo for discovery grid cards, sourced from the Google Maps
 * Place JS API (`place.photos[0].getURI()`) — not the UI Kit, which only draws
 * full place cards. We render a plain `<img>` plus the required author
 * attribution; the URL is used live per session and never cached/stored.
 *
 * Any unavailable / no-photo / error state falls back to the designed
 * {@link RestaurantFallback} so grids never show an empty slot. Volume-sensitive:
 * grids mount many of these, so each is gated near-viewport and shares the
 * single Places loader.
 */
export function GooglePlaceCardMedia({
  placeId,
  restaurantSlug,
  page,
  name,
  seed,
  city,
  stars,
  ratioClass = "aspect-[4/3]",
  className = "",
  priority = false,
}: GooglePlaceCardMediaProps) {
  const availability = getGooglePlacesUiKitAvailability();
  const [shellRef, nearViewport] = useNearViewport(!priority);
  const [loader, setLoader] = useState<GooglePlacesLoaderState>({
    status: "idle",
  });
  const [resolved, setResolved] = useState<Resolved>({ status: "loading" });
  const recordedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!nearViewport) return;
    if (availability.status !== "ready") return;
    let cancelled = false;
    void loadGooglePlacesUiKit().then((next) => {
      if (!cancelled) setLoader(next);
    });
    return () => {
      cancelled = true;
    };
  }, [nearViewport, availability.status]);

  useEffect(() => {
    if (loader.status !== "ready") return;
    let cancelled = false;

    if (recordedRef.current !== placeId) {
      recordedRef.current = placeId;
      recordGooglePlacesQueryIntent({
        page,
        componentType: "compact",
        restaurantSlug,
        placeId,
      });
    }

    async function loadPhoto() {
      try {
        const maps = window.google?.maps as
          | { importLibrary: (name: string) => Promise<unknown> }
          | undefined;
        if (!maps) throw new Error("maps_unavailable");
        const lib = (await maps.importLibrary("places")) as {
          Place: PlaceConstructor;
        };
        const place = new lib.Place({ id: placeId });
        await place.fetchFields({ fields: ["photos"] });
        if (cancelled) return;
        const photo = place.photos?.[0];
        if (!photo) {
          setResolved({ status: "error" });
          return;
        }
        const url = photo.getURI({ maxWidth: 800, maxHeight: 600 });
        const attribution =
          photo.authorAttributions
            ?.map((a) => a.displayName)
            .filter(Boolean)
            .join(", ") || null;
        setResolved({ status: "ready", url, attribution });
      } catch {
        if (!cancelled) setResolved({ status: "error" });
      }
    }

    void loadPhoto();
    return () => {
      cancelled = true;
    };
  }, [loader.status, page, placeId, restaurantSlug]);

  const fallback = (
    <RestaurantFallback
      name={name}
      seed={seed ?? name}
      city={city}
      stars={stars}
      className={`${ratioClass} ${className}`}
    />
  );

  // Terminal states that will never show a photo → designed fallback.
  if (
    availability.status !== "ready" ||
    loader.status === "disabled" ||
    loader.status === "missing_key" ||
    loader.status === "error" ||
    resolved.status === "error"
  ) {
    return <div ref={shellRef}>{fallback}</div>;
  }

  // Not yet in view, still loading the kit, or fetching the photo → skeleton.
  if (
    !nearViewport ||
    loader.status === "idle" ||
    loader.status === "loading" ||
    resolved.status === "loading"
  ) {
    return (
      <div
        ref={shellRef}
        className={`relative overflow-hidden rounded-[var(--dp-radius-lg)] bg-dp-soft ${ratioClass} ${className}`}
      >
        <div
          className="absolute inset-0 animate-pulse bg-dp-surface-container"
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <div
      ref={shellRef}
      className={`relative overflow-hidden rounded-[var(--dp-radius-lg)] bg-dp-soft ${ratioClass} ${className}`}
      data-google-places-component="card-media"
      data-restaurant-slug={restaurantSlug}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- Google photo URI must be rendered live, never cached into next/image */}
      <img
        src={resolved.url}
        alt={`Photograph of ${name}`}
        className="h-full w-full object-cover"
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onError={() => setResolved({ status: "error" })}
      />
      {resolved.attribution ? (
        <span className="pointer-events-none absolute bottom-1 right-2 max-w-[85%] truncate text-[10px] leading-tight text-white/85 [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
          {resolved.attribution}
        </span>
      ) : null}
    </div>
  );
}
