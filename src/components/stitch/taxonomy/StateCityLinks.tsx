import Link from "next/link";
import { PageContainer } from "@/components/stitch/PageContainer";

type StateCityLinksProps = {
  cities: Array<{
    city: string;
    citySlug: string;
    count: number;
    href: string;
  }>;
  stateName: string;
};

/** Geographic/city overview — real city links, no fake map labels. */
export function StateCityLinks({ cities, stateName }: StateCityLinksProps) {
  if (cities.length === 0) return null;

  return (
    <section
      className="border-y border-dp-border bg-dp-soft py-[var(--dp-section)]"
      aria-labelledby="state-cities-heading"
      data-taxonomy-section="city-overview"
    >
      <PageContainer>
        <h2
          id="state-cities-heading"
          className="font-display text-[28px] text-dp-primary md:text-[32px]"
        >
          Cities in {stateName}
        </h2>
        <p className="mt-3 max-w-2xl font-sans text-base text-dp-ink-secondary">
          Cities represented in the current starred roster for this state.
        </p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((city) => (
            <li key={city.citySlug}>
              <Link
                href={city.href}
                className="flex min-h-14 items-center justify-between gap-4 rounded-[var(--dp-radius-lg)] border border-dp-border bg-dp-surface px-4 py-3 font-sans text-dp-ink no-underline transition-colors hover:border-dp-primary hover:text-dp-primary"
              >
                <span className="font-medium">{city.city}</span>
                <span className="text-sm text-dp-ink-muted">
                  {city.count}{" "}
                  {city.count === 1 ? "restaurant" : "restaurants"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </PageContainer>
    </section>
  );
}
