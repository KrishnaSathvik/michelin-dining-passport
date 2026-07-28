"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@/components/stitch/Dialog";
import { RestaurantMedia } from "@/components/stitch/restaurant";
import type {
  RestaurantDetailModel,
  RestaurantGalleryImage,
} from "./models";

type RestaurantGalleryProps = {
  restaurant: RestaurantDetailModel;
};

function MediaTile({
  restaurant,
  image,
  index,
  className,
  priority = false,
  onOpen,
}: {
  restaurant: RestaurantDetailModel;
  image: RestaurantGalleryImage;
  index: number;
  className: string;
  priority?: boolean;
  onOpen: (index: number) => void;
}) {
  return (
    <button
      type="button"
      className={`group relative min-h-0 min-w-0 overflow-hidden bg-dp-soft text-left focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus ${className}`}
      aria-label={`Open image ${index + 1} of ${restaurant.gallery.length} for ${restaurant.name}`}
      onClick={() => onOpen(index)}
    >
      <RestaurantMedia
        name={restaurant.name}
        seed={`${restaurant.slug}-${image.id}`}
        city={restaurant.city}
        stars={restaurant.stars}
        imageUrl={image.url}
        objectPosition={image.objectPosition}
        alt={image.alt}
        priority={priority}
        ratioClass="aspect-auto h-full min-h-full"
        className="h-full rounded-none transition-transform duration-500 group-hover:scale-[1.015]"
        sizes={
          index === 0
            ? "(max-width: 768px) 100vw, 48vw"
            : "(max-width: 768px) 100vw, 24vw"
        }
      />
      {image.kind === "representative" ? (
        <span className="absolute bottom-3 left-3 rounded-full bg-dp-ink/75 px-3 py-1.5 font-sans text-xs font-semibold text-white backdrop-blur-sm">
          Representative image
        </span>
      ) : null}
    </button>
  );
}

function desktopGrid(images: RestaurantGalleryImage[]): string {
  if (images.length === 1) return "grid-cols-1";
  if (images.length === 2) return "grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]";
  return "grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] grid-rows-2";
}

export function RestaurantGallery({ restaurant }: RestaurantGalleryProps) {
  const images = restaurant.gallery.slice(0, 5);
  // Keep the hero to one of three deliberate, stable compositions. Additional
  // approved media remains available in the viewer instead of creating
  // unpredictable implicit grid rows.
  const heroImages = images.slice(0, 3);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const viewerOpen = viewerIndex !== null;

  useEffect(() => {
    if (!viewerOpen || viewerIndex === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" && viewerIndex < images.length - 1) {
        event.preventDefault();
        setViewerIndex(viewerIndex + 1);
      }
      if (event.key === "ArrowLeft" && viewerIndex > 0) {
        event.preventDefault();
        setViewerIndex(viewerIndex - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [images.length, viewerIndex, viewerOpen]);

  if (images.length === 0) {
    return (
      <div
        className="overflow-hidden rounded-[var(--dp-radius-xl)]"
        data-restaurant-gallery
        data-gallery-state="initials"
      >
        <RestaurantMedia
          name={restaurant.name}
          seed={restaurant.slug}
          slug={restaurant.slug}
          city={restaurant.city}
          stars={restaurant.stars}
          placeId={restaurant.googlePlaceId}
          page="restaurant_detail"
          priority
          ratioClass="aspect-[4/3] lg:aspect-[16/11]"
          className="rounded-[var(--dp-radius-xl)]"
          sizes="(max-width: 1024px) 100vw, 58vw"
        />
      </div>
    );
  }

  return (
    <div
      className="relative min-w-0"
      data-restaurant-gallery
      data-gallery-state={
        images[0]?.kind === "representative"
          ? "representative"
          : `verified-${images.length}`
      }
    >
      <div
        className={`hidden aspect-[16/11] min-w-0 gap-1 overflow-hidden rounded-[var(--dp-radius-xl)] md:grid ${desktopGrid(heroImages)}`}
      >
        {heroImages.map((image, index) => (
          <MediaTile
            key={image.id}
            restaurant={restaurant}
            image={image}
            index={index}
            priority={index === 0}
            onOpen={setViewerIndex}
            className={
              heroImages.length > 2 && index === 0 ? "row-span-2" : ""
            }
          />
        ))}
      </div>

      <div className="-mx-5 flex snap-x snap-mandatory gap-2 overflow-x-auto px-5 pb-2 md:hidden">
        {images.map((image, index) => (
          <MediaTile
            key={image.id}
            restaurant={restaurant}
            image={image}
            index={index}
            priority={index === 0}
            onOpen={setViewerIndex}
            className="aspect-[4/3] w-[calc(100vw-2.5rem)] shrink-0 snap-center rounded-[var(--dp-radius-xl)]"
          />
        ))}
      </div>

      <button
        type="button"
        className="absolute bottom-4 right-4 inline-flex min-h-11 items-center rounded-full border border-white/60 bg-dp-surface/95 px-4 font-sans text-sm font-semibold text-dp-ink shadow-sm backdrop-blur-sm hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
        onClick={() => setViewerIndex(0)}
      >
        {images.length === 1
          ? "View photo"
          : `View all ${images.length} photos`}
      </button>

      <Dialog
        open={viewerOpen}
        onClose={() => setViewerIndex(null)}
        title={`${restaurant.name} photo gallery`}
        description={
          viewerIndex === null
            ? undefined
            : `Image ${viewerIndex + 1} of ${images.length}`
        }
        size="fullscreen"
        footer={
          viewerIndex === null ? null : (
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                className="min-h-11 rounded-[var(--dp-radius-lg)] px-4 font-sans text-sm font-semibold text-dp-primary disabled:opacity-40"
                disabled={viewerIndex === 0}
                onClick={() => setViewerIndex((index) => Math.max(0, (index ?? 0) - 1))}
              >
                Previous
              </button>
              <span className="font-sans text-sm text-dp-ink-secondary" role="status">
                Image {viewerIndex + 1} of {images.length}
              </span>
              <button
                type="button"
                className="min-h-11 rounded-[var(--dp-radius-lg)] px-4 font-sans text-sm font-semibold text-dp-primary disabled:opacity-40"
                disabled={viewerIndex === images.length - 1}
                onClick={() =>
                  setViewerIndex((index) =>
                    Math.min(images.length - 1, (index ?? 0) + 1),
                  )
                }
              >
                Next
              </button>
            </div>
          )
        }
      >
        {viewerIndex !== null ? (
          <figure className="flex h-full min-h-[50dvh] flex-col">
            <div className="min-h-0 flex-1 overflow-hidden rounded-[var(--dp-radius-lg)] bg-dp-ink">
              <RestaurantMedia
                name={restaurant.name}
                seed={`${restaurant.slug}-${images[viewerIndex].id}-viewer`}
                city={restaurant.city}
                stars={restaurant.stars}
                imageUrl={images[viewerIndex].url}
                objectPosition={images[viewerIndex].objectPosition}
                alt={images[viewerIndex].alt}
                fit="contain"
                ratioClass="aspect-auto h-full min-h-[50dvh]"
                className="h-full rounded-none"
                sizes="100vw"
              />
            </div>
            {images[viewerIndex].kind === "representative" ||
            images[viewerIndex].credit ? (
              <figcaption className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-sans text-sm text-dp-ink-secondary">
                {images[viewerIndex].kind === "representative" ? (
                  <span>Representative image — not the restaurant</span>
                ) : null}
                {images[viewerIndex].credit ? (
                  <span>Credit: {images[viewerIndex].credit}</span>
                ) : null}
              </figcaption>
            ) : null}
          </figure>
        ) : null}
      </Dialog>
    </div>
  );
}
