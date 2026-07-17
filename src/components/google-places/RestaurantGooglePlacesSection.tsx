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

type RestaurantGooglePlacesSectionProps = {
  restaurantSlug: string;
  placeId: string | null;
};

/**
 * Google enrichment module for restaurant detail.
 * Michelin identity and reservation CTA remain outside this section.
 */
export function RestaurantGooglePlacesSection({
  restaurantSlug,
  placeId,
}: RestaurantGooglePlacesSectionProps) {
  return (
    <section
      className="mt-12 border-t border-border pt-8"
      aria-labelledby="google-places-heading"
      data-google-places-section="detail"
    >
      <h2
        id="google-places-heading"
        className="font-display text-2xl text-ink"
      >
        Photos and live place information from Google
      </h2>
      <p className="mt-3 max-w-2xl font-sans text-sm leading-relaxed text-ink-muted">
        The following photos, ratings, hours, contact details, summaries, and
        reviews are provided by Google and are separate from Michelin Guide
        distinctions on this page. We do not independently verify Google
        reviews.
      </p>
      <div className="mt-6 max-w-[400px]">
        <GooglePlaceDetails
          placeId={placeId}
          restaurantSlug={restaurantSlug}
          page={`/restaurants/${restaurantSlug}`}
          lazy
        />
      </div>
    </section>
  );
}
