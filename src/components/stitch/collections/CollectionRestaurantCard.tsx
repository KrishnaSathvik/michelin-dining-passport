"use client";

import Link from "next/link";
import { MichelinDistinction } from "@/components/stitch/restaurant/MichelinDistinction";
import { RestaurantMedia } from "@/components/stitch/restaurant/RestaurantMedia";
import type { CollectionRestaurantItem } from "@/lib/passport/collections";

type CollectionRestaurantCardProps = {
  item: CollectionRestaurantItem;
  onRemove: (item: CollectionRestaurantItem) => void;
};

function formatDate(value: string | null): string {
  if (!value) return "Date not recorded";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function visitLabel(count: number): string {
  if (count === 1) return "Visited once";
  if (count === 2) return "Visited twice";
  return `${count} visits`;
}

/**
 * Editorial member card. Plan and Record Visit deliberately live on the
 * restaurant profile — this surface only summarises them.
 */
export function CollectionRestaurantCard({
  item,
  onRemove,
}: CollectionRestaurantCardProps) {
  const href = `/restaurants/${item.slug}`;

  return (
    <article
      className="group flex h-full min-w-0 flex-col"
      data-collection-card="restaurant"
      data-slug={item.slug}
    >
      <Link
        href={href}
        aria-label={`Open ${item.name}`}
        className="block min-w-0 overflow-hidden rounded-[var(--dp-radius-lg)]"
      >
        <div className="motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.02]">
          <RestaurantMedia
            name={item.name}
            seed={item.slug}
            city={item.location}
            stars={item.distinction}
            imageUrl={item.imageUrl}
            placeId={item.placeId}
            ratioClass="aspect-[4/3]"
          />
        </div>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col pt-4">
        <MichelinDistinction stars={item.distinction} variant="compact" />
        <h3 className="mt-2 font-display text-2xl leading-tight text-dp-primary-deep">
          <Link href={href} className="no-underline hover:text-dp-primary">
            {item.name}
          </Link>
        </h3>
        <p className="mt-2 font-sans text-sm leading-relaxed text-dp-ink-muted">
          {[item.cuisine, item.location, item.price].filter(Boolean).join(" · ")}
        </p>

        {item.plan || item.visitCount > 0 || item.personalFavorite ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {item.plan ? (
              <span className="rounded-[var(--dp-radius-md)] bg-dp-soft px-2.5 py-1 font-sans text-xs font-semibold text-dp-primary">
                {item.planStatus === "needs-update"
                  ? "Needs update"
                  : item.planStatus === "undated"
                    ? "Plan date needed"
                    : "Planned"}{" "}
                · {formatDate(item.plan.plannedDate)}
              </span>
            ) : null}
            {item.visitCount > 0 ? (
              <span className="rounded-[var(--dp-radius-md)] bg-dp-soft px-2.5 py-1 font-sans text-xs font-semibold text-dp-ink-secondary">
                {visitLabel(item.visitCount)}
              </span>
            ) : null}
            {item.personalFavorite ? (
              <span className="rounded-[var(--dp-radius-md)] bg-[color-mix(in_srgb,var(--dp-star-gold)_14%,white)] px-2.5 py-1 font-sans text-xs font-semibold text-dp-secondary">
                Personal favorite
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-x-4 pt-4">
          <Link
            href={href}
            className="inline-flex min-h-11 items-center font-sans text-sm font-semibold text-dp-primary hover:underline"
          >
            Open details
          </Link>
          <button
            type="button"
            onClick={() => onRemove(item)}
            aria-label={`Remove ${item.name} from this collection`}
            className="inline-flex min-h-11 items-center font-sans text-sm font-semibold text-dp-error hover:underline"
          >
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}
