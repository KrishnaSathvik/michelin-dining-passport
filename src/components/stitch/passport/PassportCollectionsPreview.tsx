"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/stitch/Button";
import { CollectionFormDialog } from "@/components/stitch/collections/CollectionFormDialog";
import { RestaurantMedia } from "@/components/stitch/restaurant/RestaurantMedia";
import type { CollectionPreviewModel } from "./models";

type PassportCollectionsPreviewProps = {
  collections: CollectionPreviewModel[];
};

export function PassportCollectionsPreview({
  collections,
}: PassportCollectionsPreviewProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const hasCollections = collections.length > 0;

  return (
    <section
      className="mb-[var(--dp-section)]"
      data-passport-section="collections-preview"
      aria-labelledby="collections-preview-heading"
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="dp-label-caps text-dp-ink-muted">Organize</p>
          <h2
            id="collections-preview-heading"
            className="dp-headline-md mt-2 text-dp-primary-deep"
          >
            Collections
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setCreateOpen(true)}>
            Create collection
          </Button>
          {hasCollections ? (
            <Link
              href="/collections"
              className="inline-flex min-h-12 items-center px-3 font-sans text-[14px] font-medium text-dp-primary no-underline underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
            >
              View all
            </Link>
          ) : null}
        </div>
      </div>

      {hasCollections ? (
        <ul className="grid grid-cols-1 gap-[var(--dp-gutter)] md:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <li key={collection.id}>
              <article className="group flex h-full flex-col overflow-hidden rounded-[var(--dp-radius-lg)] border border-dp-outline-variant bg-dp-surface">
                <Link
                  href={collection.href}
                  className="block no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
                  aria-label={`${collection.name}, ${collection.restaurantCount} restaurants`}
                >
                  <div className="grid aspect-[4/3] grid-cols-2 gap-px overflow-hidden bg-dp-border">
                    {collection.covers.length > 0 ? (
                      collection.covers.map((cover, index) => (
                        <div
                          key={cover.seed}
                          className={
                            collection.covers.length === 1
                              ? "col-span-2"
                              : index === 0
                                ? "row-span-2"
                                : ""
                          }
                        >
                          <RestaurantMedia
                            name={cover.name}
                            seed={cover.seed}
                            city={cover.city}
                            stars={cover.stars}
                            imageUrl={cover.imageUrl}
                            placeId={cover.placeId}
                            ratioClass="h-full min-h-0"
                            className="h-full rounded-none"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 flex items-center justify-center bg-dp-surface-low text-dp-ink-muted">
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
                    </p>
                    <span className="mt-4 inline-flex min-h-11 items-center font-sans text-sm font-semibold text-dp-primary">
                      Open collection
                    </span>
                  </div>
                </Link>
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <div className="border-y border-dp-border py-8">
          <p className="max-w-xl font-sans text-base text-dp-ink-secondary">
            Group restaurants into private collections for trips or themes.
          </p>
          <Button
            type="button"
            variant="secondary"
            className="mt-4"
            onClick={() => setCreateOpen(true)}
          >
            Create collection
          </Button>
        </div>
      )}
      {createOpen ? (
        <CollectionFormDialog open onClose={() => setCreateOpen(false)} />
      ) : null}
    </section>
  );
}
