import Link from "next/link";
import { PageContainer } from "@/components/stitch/PageContainer";
import type { CuisineCityHub } from "./aggregations";

type CuisineHubGridProps = {
  hubs: CuisineCityHub[];
  cuisineName: string;
};

/** OD-14: U.S. city hubs only — omitted entirely when hubs is empty. */
export function CuisineHubGrid({ hubs, cuisineName }: CuisineHubGridProps) {
  if (hubs.length < 2) return null;

  return (
    <section
      className="py-[var(--dp-section)]"
      aria-labelledby="cuisine-hubs-heading"
      data-taxonomy-section="us-hubs"
    >
      <PageContainer>
        <h2
          id="cuisine-hubs-heading"
          className="font-display text-[28px] text-dp-primary md:text-[32px]"
        >
          U.S. Culinary Hubs
        </h2>
        <p className="mt-3 max-w-2xl font-sans text-base text-dp-ink-secondary">
          U.S. cities with the most {cuisineName} restaurants in the current
          starred roster.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hubs.map((hub, index) => (
            <li
              key={hub.citySlug}
              className={
                index === 0 ? "sm:col-span-2 lg:col-span-2" : undefined
              }
            >
              <Link
                href={`/cities/${hub.citySlug}`}
                className="flex h-full min-h-[10rem] flex-col justify-end rounded-[var(--dp-radius-xl)] border border-dp-border bg-gradient-to-br from-dp-primary to-dp-primary-deep p-6 text-dp-on-primary no-underline transition-opacity hover:opacity-95"
              >
                <p className="font-display text-[24px] leading-tight md:text-[28px]">
                  {hub.city}
                </p>
                <p className="mt-1 font-sans text-sm text-dp-on-primary/80">
                  {hub.state} · {hub.count}{" "}
                  {hub.count === 1 ? "restaurant" : "restaurants"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </PageContainer>
    </section>
  );
}
