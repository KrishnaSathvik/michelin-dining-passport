"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { GooglePlaceSkeleton } from "@/components/google-places/GooglePlaceSkeleton";

const GooglePlaceDetailsCompact = dynamic(
  () =>
    import("@/components/google-places/GooglePlaceDetails").then(
      (mod) => mod.GooglePlaceDetailsCompact,
    ),
  {
    ssr: false,
    loading: () => <GooglePlaceSkeleton variant="compact" />,
  },
);

type MapSelectedGooglePlaceProps = {
  restaurantSlug: string;
  placeId: string | null;
  /** Mobile expanded sheet only — collapsed peek must not mount. */
  enabled?: boolean;
};

/**
 * Compact Places UI Kit enrichment for a deliberately selected map restaurant.
 * Debounces rapid selection changes; does not query list rows or markers.
 */
export function MapSelectedGooglePlace({
  restaurantSlug,
  placeId,
  enabled = true,
}: MapSelectedGooglePlaceProps) {
  const [debounced, setDebounced] = useState<{
    slug: string;
    placeId: string | null;
  }>({ slug: restaurantSlug, placeId });

  useEffect(() => {
    if (!enabled) return;
    const handle = window.setTimeout(() => {
      setDebounced({ slug: restaurantSlug, placeId });
    }, 280);
    return () => window.clearTimeout(handle);
  }, [enabled, restaurantSlug, placeId]);

  if (!enabled) return null;

  const ready = debounced.slug === restaurantSlug;
  if (!ready) {
    return <GooglePlaceSkeleton variant="compact" className="mt-3" />;
  }

  return (
    <div className="min-w-0" data-google-places-section="map-selected">
      <p className="mb-3 font-sans text-[10px] font-semibold uppercase tracking-wider text-dp-ink-muted">
        Live place information from Google
      </p>
      <GooglePlaceDetailsCompact
        key={debounced.placeId ?? `none-${debounced.slug}`}
        placeId={debounced.placeId}
        restaurantSlug={debounced.slug}
        page="/map"
        lazy={false}
        orientation="horizontal"
      />
    </div>
  );
}
