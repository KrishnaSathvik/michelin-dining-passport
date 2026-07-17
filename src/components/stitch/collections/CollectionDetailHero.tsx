import { CollectionCover } from "./CollectionCover";
import { CollectionProgress } from "./CollectionProgress";
import type { CollectionCoverModel, CollectionProgressModel } from "./models";

type CollectionDetailHeroProps = {
  cover: CollectionCoverModel;
  progress: CollectionProgressModel;
  onAddRestaurants: () => void;
};

export function CollectionDetailHero({
  cover,
  progress,
  onAddRestaurants,
}: CollectionDetailHeroProps) {
  return (
    <section
      className="grid grid-cols-1 gap-[var(--dp-gutter)] lg:grid-cols-12"
      data-collections-section="hero"
    >
      <div className="overflow-hidden rounded-[var(--dp-radius-lg)] border border-dp-outline-variant lg:col-span-8 lg:h-[400px]">
        <CollectionCover
          cover={cover}
          ratioClass="aspect-[16/10] h-full lg:aspect-auto"
          priority
        />
      </div>
      <div className="lg:col-span-4">
        <CollectionProgress
          progress={progress}
          onAddRestaurants={onAddRestaurants}
        />
      </div>
    </section>
  );
}
