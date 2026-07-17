import Link from "next/link";
import { RestaurantMedia } from "@/components/stitch/restaurant/RestaurantMedia";
import type { CollectionPreviewModel } from "./models";

type PassportCollectionsPreviewProps = {
  collections: CollectionPreviewModel[];
};

export function PassportCollectionsPreview({
  collections,
}: PassportCollectionsPreviewProps) {
  return (
    <section
      className="mb-[var(--dp-section)]"
      data-passport-section="collections-preview"
      aria-labelledby="collections-preview-heading"
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h2
          id="collections-preview-heading"
          className="dp-headline-md text-dp-primary-deep"
        >
          Personal Collections
        </h2>
        <Link
          href="/collections"
          className="inline-flex min-h-11 items-center font-sans text-[14px] font-medium text-dp-primary no-underline underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
        >
          View all collections
        </Link>
      </div>

      {collections.length === 0 ? (
        <div className="rounded-[var(--dp-radius-lg)] border border-dp-outline-variant bg-dp-surface-low px-6 py-10 text-center">
          <p className="dp-body-md text-dp-ink-secondary">
            Group restaurants into private collections for trips or themes.
          </p>
          <Link
            href="/collections"
            className="mt-4 inline-flex min-h-11 items-center font-sans text-[14px] font-semibold text-dp-primary no-underline underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
          >
            Open collections
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-[var(--dp-gutter)] md:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <li key={collection.id}>
              <article className="group flex h-full flex-col overflow-hidden rounded-[var(--dp-radius-lg)] border border-dp-outline-variant bg-dp-surface">
                <Link
                  href={collection.href}
                  className="block no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
                  aria-label={`${collection.name}, ${collection.restaurantCount} restaurants, ${collection.visitedCount} visited`}
                >
                  <div className="overflow-hidden">
                    {collection.cover ? (
                      <div className="motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.05]">
                        <RestaurantMedia
                          name={collection.cover.name}
                          seed={collection.cover.seed}
                          city={collection.cover.city}
                          stars={collection.cover.stars}
                          imageUrl={collection.cover.imageUrl}
                          ratioClass="aspect-[4/3]"
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-[4/3] items-center justify-center bg-dp-surface-low text-dp-ink-muted">
                        <span className="dp-label-caps">Collection</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="dp-headline-sm text-dp-primary-deep">
                      {collection.name}
                    </h3>
                    {collection.description ? (
                      <p className="mt-1 line-clamp-2 font-sans text-[14px] text-dp-ink-muted">
                        {collection.description}
                      </p>
                    ) : null}
                    <p className="mt-3 font-sans text-[14px] text-dp-ink-secondary">
                      {collection.restaurantCount}{" "}
                      {collection.restaurantCount === 1
                        ? "restaurant"
                        : "restaurants"}
                      {" · "}
                      {collection.visitedCount} visited
                    </p>
                  </div>
                </Link>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
