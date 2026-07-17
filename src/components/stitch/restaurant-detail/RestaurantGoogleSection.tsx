"use client";

import dynamic from "next/dynamic";
import { GooglePlaceSkeleton } from "@/components/google-places/GooglePlaceSkeleton";

const GooglePlaceDetails = dynamic(
  () =>
    import("@/components/google-places/GooglePlaceDetails").then(
      (mod) => mod.GooglePlaceDetails,
    ),
  {
    ssr: false,
    loading: () => <GooglePlaceSkeleton variant="full" />,
  },
);

type RestaurantGoogleSectionProps = {
  restaurantSlug: string;
  placeId: string | null;
};

/**
 * Stitch outer frame around the existing full Google Places UI Kit.
 * Preserves lazy mount / SSR / remount protections in GooglePlaceDetails.
 */
export function RestaurantGoogleSection({
  restaurantSlug,
  placeId,
}: RestaurantGoogleSectionProps) {
  return (
    <aside
      className="w-full self-start rounded-[var(--dp-radius-md)] border border-dp-border bg-dp-soft p-6 lg:w-[380px]"
      aria-labelledby="google-places-heading"
      data-google-places-section="detail"
    >
      <div className="mb-2 flex items-center gap-2">
        <span
          className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-dp-border font-sans text-[11px] text-dp-primary"
          aria-hidden="true"
        >
          i
        </span>
        <h2
          id="google-places-heading"
          className="font-sans text-base font-medium text-dp-ink"
        >
          Photos and live place information from Google
        </h2>
      </div>
      <p className="mb-6 font-sans text-sm leading-relaxed text-dp-ink-secondary">
        Photos, ratings, hours, and reviews are provided by Google and may
        change over time. Michelin distinctions on this page are first-party
        roster information and remain separate from Google ratings.
      </p>
      <div className="w-full max-w-[400px]">
        <GooglePlaceDetails
          placeId={placeId}
          restaurantSlug={restaurantSlug}
          page={`/restaurants/${restaurantSlug}`}
          lazy
        />
      </div>
    </aside>
  );
}
