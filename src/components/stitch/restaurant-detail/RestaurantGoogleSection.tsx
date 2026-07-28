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
 * Bounded provider surface below first-party location. Google content stays
 * inside UI Kit and never becomes first-party gallery/details data.
 */
export function RestaurantGoogleSection({
  restaurantSlug,
  placeId,
}: RestaurantGoogleSectionProps) {
  if (!placeId) return null;

  return (
    <section
      className="mb-[var(--dp-section)] w-full rounded-[var(--dp-radius-xl)] border border-dp-border bg-dp-surface-low p-5 sm:p-7"
      aria-labelledby="google-places-heading"
      data-google-places-section="detail"
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,400px)] lg:items-center lg:gap-12">
        <div className="min-w-0">
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
              Current place information from Google
            </h2>
          </div>
          <p className="font-sans text-sm leading-relaxed text-dp-ink-secondary">
            Current rating, hours, and phone information are provided by Google
            and may change. Google ratings remain separate from Michelin
            distinctions and from your private list.
          </p>
        </div>
        <div className="w-full lg:justify-self-end">
          <GooglePlaceDetails
            placeId={placeId}
            restaurantSlug={restaurantSlug}
            page={`/restaurants/${restaurantSlug}`}
            variant="focused"
            style={{ maxWidth: "100%" }}
            lazy
          />
        </div>
      </div>
    </section>
  );
}
