"use client";

import { useCallback, useEffect, useState } from "react";
import { Dialog } from "@/components/stitch/Dialog";
import { RestaurantFallback } from "@/components/stitch/restaurant/RestaurantFallback";
import { useGooglePlace } from "@/components/google-places/useGooglePlace";

type RestaurantPhotoHeroProps = {
  name: string;
  slug: string;
  city: string;
  stars: 1 | 2 | 3;
  placeId: string | null;
};

/**
 * Single full-width hero image sourced from Google photos, with a lightbox to
 * page through every available photo. Falls back to the designed initials block
 * while loading or when no photos are available.
 */
export function RestaurantPhotoHero({
  name,
  slug,
  city,
  stars,
  placeId,
}: RestaurantPhotoHeroProps) {
  const place = useGooglePlace(placeId);
  const photos = place.status === "ready" ? place.data.photos : [];
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const viewerOpen = viewerIndex !== null;

  const go = useCallback(
    (delta: number) =>
      setViewerIndex((index) => {
        if (index === null) return index;
        return Math.min(Math.max(index + delta, 0), photos.length - 1);
      }),
    [photos.length],
  );

  useEffect(() => {
    if (!viewerOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        go(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewerOpen, go]);

  const ratio = "aspect-[16/9] md:aspect-[16/7]";

  // Loading — hold the hero space with a soft skeleton.
  if (place.status === "idle" || place.status === "loading") {
    return (
      <div
        className={`w-full overflow-hidden rounded-[var(--dp-radius-xl)] bg-dp-soft ${ratio}`}
        data-restaurant-hero="loading"
      >
        <div className="h-full w-full animate-pulse bg-dp-surface-container" />
      </div>
    );
  }

  // No Google photos — designed fallback (still a proper single hero).
  if (photos.length === 0) {
    return (
      <div data-restaurant-hero="fallback">
        <RestaurantFallback
          name={name}
          seed={slug}
          city={city}
          stars={stars}
          className={`w-full rounded-[var(--dp-radius-xl)] ${ratio}`}
        />
      </div>
    );
  }

  const active = viewerIndex !== null ? photos[viewerIndex] : null;

  return (
    <div className="relative w-full" data-restaurant-hero="photo">
      <button
        type="button"
        onClick={() => setViewerIndex(0)}
        aria-label={`View all ${photos.length} photos of ${name}`}
        className={`group relative w-full overflow-hidden rounded-[var(--dp-radius-xl)] bg-dp-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus ${ratio}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- Google photo URI must render live, never cached */}
        <img
          src={photos[0].url}
          alt={`Photograph of ${name}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
          decoding="async"
          fetchPriority="high"
        />
        {photos[0].attribution ? (
          <span className="pointer-events-none absolute bottom-2 left-3 max-w-[70%] truncate font-sans text-[11px] text-white/85 [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
            {photos[0].attribution}
          </span>
        ) : null}
        {photos.length > 1 ? (
          <span className="absolute bottom-3 right-3 inline-flex min-h-9 items-center gap-2 rounded-full bg-dp-surface/95 px-4 font-sans text-sm font-semibold text-dp-ink shadow-sm backdrop-blur-sm transition-colors group-hover:bg-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
              <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            View all {photos.length} photos
          </span>
        ) : null}
      </button>

      <Dialog
        open={viewerOpen}
        onClose={() => setViewerIndex(null)}
        title={`${name} photo gallery`}
        description={
          viewerIndex === null
            ? undefined
            : `Photo ${viewerIndex + 1} of ${photos.length}`
        }
        size="fullscreen"
        footer={
          viewerIndex === null ? null : (
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                className="min-h-11 rounded-[var(--dp-radius-lg)] px-4 font-sans text-sm font-semibold text-dp-primary disabled:opacity-40"
                disabled={viewerIndex === 0}
                onClick={() => go(-1)}
              >
                Previous
              </button>
              <span className="font-sans text-sm text-dp-ink-secondary" role="status">
                {viewerIndex + 1} of {photos.length}
              </span>
              <button
                type="button"
                className="min-h-11 rounded-[var(--dp-radius-lg)] px-4 font-sans text-sm font-semibold text-dp-primary disabled:opacity-40"
                disabled={viewerIndex === photos.length - 1}
                onClick={() => go(1)}
              >
                Next
              </button>
            </div>
          )
        }
      >
        {active ? (
          <figure className="flex h-full min-h-[50dvh] flex-col">
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[var(--dp-radius-lg)] bg-dp-ink">
              {/* eslint-disable-next-line @next/next/no-img-element -- live Google photo */}
              <img
                src={active.url}
                alt={`Photograph ${viewerIndex! + 1} of ${name}`}
                className="max-h-full max-w-full object-contain"
                decoding="async"
              />
            </div>
            {active.attribution ? (
              <figcaption className="mt-3 font-sans text-sm text-dp-ink-secondary">
                Photo: {active.attribution} · via Google
              </figcaption>
            ) : null}
          </figure>
        ) : null}
      </Dialog>
    </div>
  );
}
