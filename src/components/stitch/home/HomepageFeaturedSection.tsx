import Link from "next/link";
import {
  RestaurantCardSkeleton,
  RestaurantDiscoveryCard,
} from "@/components/stitch/restaurant";
import { SectionHeader } from "@/components/stitch/SectionHeader";
import type { HomepageFeaturedSectionModel } from "./models";

type HomepageFeaturedSectionProps = {
  model: HomepageFeaturedSectionModel;
  /** Gallery / test loading silhouette. */
  loading?: boolean;
};

/**
 * Three-card featured discovery section from Stitch explore_feed.
 */
export function HomepageFeaturedSection({
  model,
  loading = false,
}: HomepageFeaturedSectionProps) {
  if (loading) {
    return (
      <section
        className="bg-dp-surface-low py-[var(--dp-section)]"
        data-homepage-section="featured"
        aria-busy="true"
        aria-label="Loading featured restaurants"
      >
        <div className="mx-auto max-w-[var(--dp-content-max)] px-[var(--dp-margin-mobile)] md:px-[var(--dp-margin-desktop)]">
          <SectionHeader
            title={model.title}
            description={model.description}
            actionHref={model.viewAllHref}
            actionLabel={model.viewAllLabel}
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <RestaurantCardSkeleton />
            <RestaurantCardSkeleton />
            <RestaurantCardSkeleton />
          </div>
        </div>
      </section>
    );
  }

  if (model.restaurants.length === 0) {
    return (
      <section
        className="bg-dp-surface-low py-[var(--dp-section)]"
        data-homepage-section="featured"
      >
        <div className="mx-auto max-w-[var(--dp-content-max)] px-[var(--dp-margin-mobile)] text-center md:px-[var(--dp-margin-desktop)]">
          <h2 className="font-display text-[32px] text-dp-ink">{model.title}</h2>
          <p className="mt-3 font-sans text-dp-ink-secondary">
            Featured restaurants are temporarily unavailable.
          </p>
          <Link
            href={model.viewAllHref}
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-[var(--dp-radius-lg)] bg-dp-primary px-6 font-sans text-[14px] font-semibold text-dp-on-primary no-underline transition-colors hover:bg-dp-primary-hover"
          >
            Explore restaurants
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      className="bg-dp-surface-low py-[var(--dp-section)]"
      data-homepage-section="featured"
      aria-labelledby="homepage-featured-heading"
    >
      <div className="mx-auto max-w-[var(--dp-content-max)] px-[var(--dp-margin-mobile)] md:px-[var(--dp-margin-desktop)]">
        <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h2
              id="homepage-featured-heading"
              className="font-display text-[28px] leading-[1.2] text-dp-ink md:text-[32px]"
            >
              {model.title}
            </h2>
            <p className="mt-2 font-sans text-base text-dp-ink-secondary md:text-[16px]">
              {model.description}
            </p>
          </div>
          <Link
            href={model.viewAllHref}
            className="hidden shrink-0 items-center font-sans text-[14px] font-semibold text-dp-primary no-underline transition-colors hover:text-dp-primary-hover md:inline-flex"
          >
            {model.viewAllLabel}
            <span aria-hidden="true" className="ml-1">
              →
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {model.restaurants.map((restaurant, index) => (
            <div
              key={restaurant.slug}
              className="motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:-translate-y-0.5 motion-reduce:transform-none"
              data-featured-card={restaurant.slug}
            >
              <RestaurantDiscoveryCard
                model={restaurant}
                priority={index === 0}
              />
            </div>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            href={model.viewAllHref}
            className="inline-flex items-center font-sans text-[14px] font-semibold text-dp-primary no-underline"
          >
            {model.viewAllLabel}
            <span aria-hidden="true" className="ml-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
