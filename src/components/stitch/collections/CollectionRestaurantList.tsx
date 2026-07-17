import { CollectionRestaurantRow } from "./CollectionRestaurantRow";
import type { CollectionRestaurantRowModel } from "./models";
import type { LocalCollection } from "@/lib/passport/types";

type CollectionRestaurantListProps = {
  members: CollectionRestaurantRowModel[];
  collection: LocalCollection;
};

export function CollectionRestaurantList({
  members,
  collection,
}: CollectionRestaurantListProps) {
  return (
    <section
      className="mt-[var(--dp-section)]"
      data-collections-section="members"
      aria-labelledby="collection-members-heading"
    >
      <h2
        id="collection-members-heading"
        className="dp-headline-sm mb-2 text-dp-primary-deep"
      >
        Restaurants
      </h2>
      <p className="mb-4 font-sans text-[14px] text-dp-ink-muted">
        Shown in collection membership order.
      </p>
      <div className="rounded-[var(--dp-radius-lg)] border border-dp-outline-variant bg-dp-surface px-4 sm:px-6">
        {members.map((member) => (
          <CollectionRestaurantRow
            key={member.slug}
            model={member}
            collection={collection}
          />
        ))}
      </div>
    </section>
  );
}
