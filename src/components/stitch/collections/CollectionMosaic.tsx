import {
  restaurantFallbackPalette,
  restaurantInitials,
} from "@/components/stitch/restaurant/RestaurantFallback";
import type { CollectionThumbnail } from "@/lib/passport/collections";

type CollectionMosaicProps = {
  thumbnails: readonly CollectionThumbnail[];
  /** Collection name — seeds the designed fallback when there are no members. */
  name: string;
  seed: string;
  ratioClass?: string;
  className?: string;
};

function MosaicTile({
  thumbnail,
  compact,
}: {
  thumbnail: CollectionThumbnail;
  compact: boolean;
}) {
  const palette = restaurantFallbackPalette(thumbnail.slug);

  if (thumbnail.imageUrl) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-dp-soft">
        {/* eslint-disable-next-line @next/next/no-img-element -- approved first-party URLs only */}
        <img
          src={thumbnail.imageUrl}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
    );
  }

  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      style={{ background: palette.base }}
      aria-hidden="true"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 26% 20%, ${palette.accent}, transparent 58%)`,
        }}
      />
      <span
        className={`relative font-display text-white/95 ${
          compact ? "text-xl sm:text-2xl" : "text-3xl sm:text-4xl"
        }`}
      >
        {restaurantInitials(thumbnail.name)}
      </span>
    </div>
  );
}

function EmptyMosaic({ name, seed }: { name: string; seed: string }) {
  const palette = restaurantFallbackPalette(seed);
  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center gap-3"
      style={{ background: palette.base }}
      role="img"
      aria-label={`${name} has no restaurants yet`}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 72% 62% at 24% 18%, ${palette.accent}, transparent 56%), radial-gradient(ellipse 55% 50% at 86% 90%, ${palette.geometry}, transparent 50%)`,
        }}
        aria-hidden="true"
      />
      <div
        className="relative flex gap-2 opacity-80"
        aria-hidden="true"
      >
        <span className="block h-10 w-8 rounded-[4px] border border-white/30" />
        <span className="block h-12 w-10 rounded-[4px] border border-white/40" />
        <span className="block h-10 w-8 rounded-[4px] border border-white/30" />
      </div>
      <p className="relative font-sans text-xs font-medium uppercase tracking-[0.14em] text-white/75">
        No restaurants yet
      </p>
    </div>
  );
}

/**
 * Up to four member images in a fixed-ratio mosaic. The grid shape is chosen
 * by member count so the tile geometry stays stable at every breakpoint.
 */
export function CollectionMosaic({
  thumbnails,
  name,
  seed,
  ratioClass = "aspect-[4/3]",
  className = "",
}: CollectionMosaicProps) {
  const tiles = thumbnails.slice(0, 4);

  const layout =
    tiles.length >= 4
      ? "grid-cols-2 grid-rows-2"
      : tiles.length === 3
        ? "grid-cols-2 grid-rows-2"
        : tiles.length === 2
          ? "grid-cols-2 grid-rows-1"
          : "grid-cols-1 grid-rows-1";

  return (
    <div
      className={`relative w-full overflow-hidden rounded-[var(--dp-radius-lg)] bg-dp-surface-container ${ratioClass} ${className}`}
      data-collection-mosaic={tiles.length}
    >
      {tiles.length === 0 ? (
        <EmptyMosaic name={name} seed={seed} />
      ) : (
        <div className={`grid h-full w-full gap-[2px] ${layout}`}>
          {tiles.map((thumbnail, index) => (
            <div
              key={thumbnail.slug}
              className={`min-h-0 min-w-0 ${
                tiles.length === 3 && index === 0 ? "row-span-2" : ""
              }`}
            >
              <MosaicTile
                thumbnail={thumbnail}
                compact={tiles.length > 1 && !(tiles.length === 3 && index === 0)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
