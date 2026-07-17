import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { FilterChip } from "@/components/ui/FilterChip";
import { SearchForm } from "@/components/search/SearchForm";
import type { RestaurantDataset } from "@/lib/data/types";

type SearchHeroProps = {
  totals: RestaurantDataset["totals"];
  regionCount: number;
  cityCount: number;
};

const starQuickLinks = [
  { label: "1 Michelin Star", href: "/explore?stars=1" },
  { label: "2 Michelin Stars", href: "/explore?stars=2" },
  { label: "3 Michelin Stars", href: "/explore?stars=3" },
] as const;

const stateQuickLinks = [
  { label: "California", href: "/explore?state=california" },
  { label: "New York", href: "/explore?state=new-york" },
  { label: "Illinois", href: "/explore?state=illinois" },
  { label: "Florida", href: "/explore?state=florida" },
] as const;

export function SearchHero({ totals, regionCount, cityCount }: SearchHeroProps) {
  return (
    <section className="overflow-hidden bg-bg">
      <Container className="grid items-center gap-10 py-12 lg:grid-cols-2 lg:gap-14 lg:py-16">
        <div className="min-w-0">
          <h1 className="rise-in max-w-xl font-display text-4xl leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-[3.75rem]">
            Find Michelin-starred dining across the United States
          </h1>
          <p className="mt-5 max-w-lg font-sans text-base leading-relaxed text-ink-secondary sm:text-lg">
            An independent atlas for discovering starred restaurants — search,
            save, and explore the map.
          </p>

          <div className="mt-8">
            <SearchForm />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {starQuickLinks.map((item) => (
              <FilterChip key={item.href} href={item.href}>
                {item.label}
              </FilterChip>
            ))}
            {stateQuickLinks.map((item) => (
              <FilterChip key={item.href} href={item.href}>
                {item.label}
              </FilterChip>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/explore"
              className="inline-flex min-h-12 items-center rounded-[var(--radius-md)] bg-forest px-6 font-sans text-[15px] font-medium text-white no-underline transition-colors hover:bg-forest-deep"
            >
              Explore
            </Link>
            <Link
              href="/map"
              className="inline-flex min-h-12 items-center rounded-[var(--radius-md)] border border-border bg-bg px-6 font-sans text-[15px] font-medium text-ink no-underline transition-colors hover:border-ink/30"
            >
              Map
            </Link>
          </div>

          <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-border pt-6">
            <div>
              <dt className="font-sans text-xs uppercase tracking-[0.14em] text-ink-muted">
                Restaurants
              </dt>
              <dd className="mt-1 font-display text-2xl text-ink sm:text-3xl">
                {totals.restaurants}
              </dd>
            </div>
            <div>
              <dt className="font-sans text-xs uppercase tracking-[0.14em] text-ink-muted">
                Three-star
              </dt>
              <dd className="mt-1 font-display text-2xl text-ink sm:text-3xl">
                {totals.threeStar}
              </dd>
            </div>
            <div>
              <dt className="font-sans text-xs uppercase tracking-[0.14em] text-ink-muted">
                Regions
              </dt>
              <dd className="mt-1 font-display text-2xl text-ink sm:text-3xl">
                {regionCount}
              </dd>
            </div>
          </dl>
          <p className="mt-3 font-sans text-sm text-ink-muted">
            {totals.oneStar} one-star · {totals.twoStar} two-star · {cityCount}{" "}
            cities in the current roster
          </p>
        </div>

        <div
          className="relative min-h-[18rem] overflow-hidden rounded-[var(--radius-lg)] sm:min-h-[22rem] lg:min-h-[28rem]"
          aria-hidden="true"
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(145deg, #123b2f 0%, #0a2b21 42%, #1a1a1a 100%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-50"
            style={{
              background:
                "radial-gradient(ellipse 70% 55% at 70% 30%, rgba(184,138,42,0.45), transparent 60%), radial-gradient(ellipse 50% 40% at 20% 80%, rgba(255,255,255,0.12), transparent 55%)",
            }}
          />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
            <p className="font-display text-3xl text-white sm:text-4xl">
              Discover. Save. Dine.
            </p>
            <p className="mt-2 max-w-sm font-sans text-sm text-white/70">
              Atmospheric hero treatment — licensed destination photography can
              replace this panel when assets are approved.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
