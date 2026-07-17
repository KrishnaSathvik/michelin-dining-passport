import { RestaurantFallback } from "@/components/stitch/restaurant/RestaurantFallback";
import { RestaurantMedia } from "@/components/stitch/restaurant/RestaurantMedia";
import type { CollectionCoverModel } from "./models";

type CollectionCoverProps = {
  cover: CollectionCoverModel;
  ratioClass?: string;
  className?: string;
  priority?: boolean;
};

/**
 * First-party cover: member restaurant media or deterministic collection fallback.
 * Never uses Google photos or unrelated stock.
 */
export function CollectionCover({
  cover,
  ratioClass = "aspect-[4/3]",
  className = "",
  priority = false,
}: CollectionCoverProps) {
  if (cover.kind === "restaurant") {
    return (
      <RestaurantMedia
        name={cover.name}
        seed={cover.seed}
        city={cover.city}
        stars={cover.stars}
        imageUrl={cover.imageUrl}
        ratioClass={ratioClass}
        className={className}
        priority={priority}
        alt=""
      />
    );
  }

  return (
    <div className={`${ratioClass} overflow-hidden ${className}`}>
      <RestaurantFallback
        name={cover.name}
        seed={cover.seed}
        className="h-full w-full"
      />
    </div>
  );
}
