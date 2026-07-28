"use client";

import { useEffect, useRef, useState } from "react";
import { GooglePlaceCardMedia } from "@/components/google-places/GooglePlaceCardMedia";
import { RestaurantFallback } from "./RestaurantFallback";

type RestaurantMediaProps = {
  name: string;
  seed?: string;
  city?: string;
  stars?: 1 | 2 | 3;
  /** Approved first-party image URL only — never Google or unrelated stock. */
  imageUrl?: string | null;
  /**
   * Approved Google Places place ID. Used only when no first-party `imageUrl`
   * exists — renders a media-only Google photo element (never a cached URL).
   */
  placeId?: string | null;
  /** Stable slug for Google analytics + fallback seeding. */
  slug?: string;
  /** Analytics surface for Google media, e.g. "explore". */
  page?: string;
  objectPosition?: string;
  className?: string;
  /** Aspect ratio container class. Default 4:3. Use `aspect-auto h-full` for editorial fills. */
  ratioClass?: string;
  priority?: boolean;
  sizes?: string;
  alt?: string;
  /** Force loading skeleton (gallery / tests). */
  forceLoading?: boolean;
  /** Force error fallback (gallery / tests). */
  forceError?: boolean;
  fit?: "cover" | "contain";
};

/**
 * Named-restaurant media: approved photo or designed fallback.
 * Stable 4:3 ratio; lazy loading; failure falls back without broken-image icon.
 */
export function RestaurantMedia({
  name,
  seed,
  city,
  stars,
  imageUrl,
  placeId,
  slug,
  page = "explore",
  objectPosition = "center",
  className = "",
  ratioClass = "aspect-[4/3]",
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw",
  alt,
  forceLoading = false,
  forceError = false,
  fit = "cover",
}: RestaurantMediaProps) {
  const url = imageUrl?.trim() || null;
  const resolvedPlaceId = placeId?.trim() || null;
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    forceError ? "error" : forceLoading || url ? "loading" : "ready",
  );

  useEffect(() => {
    if (!url || forceError || forceLoading) return;
    const img = imgRef.current;
    if (img?.complete) {
      if (img.naturalWidth > 0) {
        setStatus("ready");
      } else {
        setStatus("error");
      }
    }
  }, [url, forceError, forceLoading]);

  // No approved first-party photo, but an approved Google place ID exists:
  // show a media-only Google photo (it falls back internally when unavailable).
  if (
    (!url || status === "error") &&
    !forceError &&
    !forceLoading &&
    resolvedPlaceId
  ) {
    return (
      <GooglePlaceCardMedia
        placeId={resolvedPlaceId}
        restaurantSlug={slug ?? seed ?? name}
        page={page}
        name={name}
        seed={seed ?? name}
        city={city}
        stars={stars}
        ratioClass={ratioClass}
        className={className}
        priority={priority}
      />
    );
  }

  if (!url || status === "error" || forceError) {
    return (
      <RestaurantFallback
        name={name}
        seed={seed ?? name}
        city={city}
        stars={stars}
        className={`${ratioClass} ${className}`}
      />
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-[var(--dp-radius-lg)] bg-dp-soft ${ratioClass} ${className}`}
    >
      {(status === "loading" || forceLoading) && (
        <div
          className="absolute inset-0 animate-pulse bg-dp-surface-container"
          aria-hidden="true"
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element -- optional external approved URLs */}
      <img
        ref={imgRef}
        src={url}
        alt={alt ?? `Photograph of ${name}`}
        sizes={sizes}
        className={`h-full w-full transition-opacity duration-[var(--dp-duration)] ${
          fit === "contain" ? "object-contain" : "object-cover"
        } ${
          status === "ready" && !forceLoading ? "opacity-100" : "opacity-0"
        }`}
        style={{ objectPosition }}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => {
          if (!forceLoading && !forceError) setStatus("ready");
        }}
        onError={() => {
          if (!forceLoading) setStatus("error");
        }}
      />
    </div>
  );
}
