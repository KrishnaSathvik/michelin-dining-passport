import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { SearchForm } from "@/components/search/SearchForm";
import { siteConfig } from "@/config/site";
import type { RestaurantDataset } from "@/lib/data/types";

type SearchHeroProps = {
  totals: RestaurantDataset["totals"];
  regionCount: number;
};

const starQuickLinks = [
  { label: "1 star", href: "/explore?q=1" },
  { label: "2 stars", href: "/explore?q=2" },
  { label: "3 stars", href: "/explore?q=3" },
] as const;

const stateQuickLinks = [
  { label: "California", href: "/explore?q=California" },
  { label: "New York", href: "/explore?q=New%20York" },
  { label: "Illinois", href: "/explore?q=Illinois" },
  { label: "Florida", href: "/explore?q=Florida" },
  { label: "Texas", href: "/explore?q=Texas" },
] as const;

export function SearchHero({ totals, regionCount }: SearchHeroProps) {
  return (
    <section className="border-b border-border">
      <Container className="pb-14 pt-10 sm:pb-16 sm:pt-14 lg:pt-16">
        <p className="rise-in font-display text-2xl text-ink sm:text-3xl lg:text-4xl">
          {siteConfig.productName}
        </p>

        <h1 className="rise-in-delay mt-5 max-w-3xl font-display text-4xl leading-[1.08] text-ink sm:text-5xl lg:text-[3.5rem]">
          Find Michelin-starred restaurants across the United States
        </h1>

        <p className="mt-5 max-w-2xl font-sans text-base leading-relaxed text-ink-muted sm:text-lg">
          Search {totals.restaurants} starred restaurants across {regionCount}{" "}
          inspected regions — an independent dining atlas, not the Michelin Guide.
        </p>

        <div className="mt-8 max-w-3xl">
          <SearchForm />
        </div>

        <div className="mt-5 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-sans text-xs uppercase tracking-[0.16em] text-ink-muted">
              Stars
            </span>
            {starQuickLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border border-border px-3 py-1.5 font-sans text-sm text-ink transition-colors hover:border-forest hover:text-forest"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-sans text-xs uppercase tracking-[0.16em] text-ink-muted">
              States
            </span>
            {stateQuickLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border border-border px-3 py-1.5 font-sans text-sm text-ink transition-colors hover:border-forest hover:text-forest"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/explore"
            className="inline-flex min-h-11 items-center bg-forest px-5 font-sans text-sm font-medium text-bg-elevated transition-colors hover:bg-forest-deep"
          >
            Explore Restaurants
          </Link>
          <Link
            href="/map"
            className="inline-flex min-h-11 items-center border border-forest px-5 font-sans text-sm font-medium text-forest transition-colors hover:bg-forest hover:text-bg-elevated"
          >
            View Map
          </Link>
        </div>

        <p className="mt-8 max-w-2xl font-sans text-sm leading-relaxed text-ink-muted">
          Coverage: {totals.oneStar} one-star, {totals.twoStar} two-star, and{" "}
          {totals.threeStar} three-star restaurants in the current roster.
          Michelin does not inspect every U.S. state.
        </p>
      </Container>
    </section>
  );
}
