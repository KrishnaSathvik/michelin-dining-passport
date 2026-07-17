import Link from "next/link";
import { PageContainer } from "@/components/stitch/PageContainer";
import type { RestaurantCardModel } from "@/components/stitch/restaurant";
import { TaxonomyRestaurantGrid } from "./TaxonomyRestaurantGrid";

type TaxonomyRestaurantSectionProps = {
  title: string;
  restaurants: RestaurantCardModel[];
  exploreHref?: string;
  exploreLabel?: string;
  remainingCount?: number;
  columns?: "discovery" | "dense";
};

export function TaxonomyRestaurantSection({
  title,
  restaurants,
  exploreHref,
  exploreLabel,
  remainingCount = 0,
  columns = "discovery",
}: TaxonomyRestaurantSectionProps) {
  return (
    <section
      className="py-[var(--dp-section)]"
      aria-labelledby="taxonomy-restaurants-heading"
    >
      <PageContainer>
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="taxonomy-restaurants-heading"
              className="font-display text-[28px] text-dp-primary md:text-[32px]"
            >
              {title}
            </h2>
            <p className="mt-2 font-sans text-sm text-dp-ink-muted">
              {restaurants.length === 1
                ? "1 restaurant shown"
                : `${restaurants.length} restaurants shown`}
              {remainingCount > 0
                ? ` · ${remainingCount} more in Explore`
                : null}
            </p>
          </div>
          {exploreHref ? (
            <Link
              href={exploreHref}
              className="inline-flex min-h-11 items-center font-sans text-sm font-semibold text-dp-primary no-underline underline-offset-4 hover:underline"
            >
              {exploreLabel ?? "View in Explore"}
            </Link>
          ) : null}
        </div>
        <TaxonomyRestaurantGrid restaurants={restaurants} columns={columns} />
        {remainingCount > 0 && exploreHref ? (
          <div className="mt-10 flex justify-center">
            <Link
              href={exploreHref}
              className="inline-flex min-h-12 items-center justify-center rounded-[var(--dp-radius-md)] bg-dp-primary px-6 font-sans text-sm font-semibold text-dp-on-primary no-underline hover:bg-dp-primary-deep"
            >
              Explore all {restaurants.length + remainingCount} restaurants
            </Link>
          </div>
        ) : null}
      </PageContainer>
    </section>
  );
}
