import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TaxonomyPageShell } from "@/components/taxonomy/TaxonomyPageShell";
import {
  getCityAggregates,
  getRestaurantsByState,
  getStateAggregate,
  getStateAggregates,
} from "@/lib/data/restaurants";
import { buildPageMetadata } from "@/lib/seo/metadata";

type StatePageProps = {
  params: Promise<{ stateSlug: string }>;
};

export function generateStaticParams() {
  return getStateAggregates().map((state) => ({ stateSlug: state.stateSlug }));
}

export async function generateMetadata({
  params,
}: StatePageProps): Promise<Metadata> {
  const { stateSlug } = await params;
  const state = getStateAggregate(stateSlug);
  if (!state) {
    return buildPageMetadata({
      title: "State not found",
      description: "This state page could not be found.",
      path: `/usa/${stateSlug}`,
      noIndex: true,
    });
  }

  return buildPageMetadata({
    title: `Michelin-starred restaurants in ${state.state}`,
    description: `${state.count} Michelin-starred restaurants in ${state.state} (${state.oneStar} one-star, ${state.twoStar} two-star, ${state.threeStar} three-star) in the current roster.`,
    path: `/usa/${state.stateSlug}`,
  });
}

export default async function StatePage({ params }: StatePageProps) {
  const { stateSlug } = await params;
  const state = getStateAggregate(stateSlug);
  if (!state) notFound();

  const restaurants = getRestaurantsByState(stateSlug);
  const cities = getCityAggregates()
    .filter((city) => city.stateSlug === stateSlug)
    .slice(0, 8);

  return (
    <TaxonomyPageShell
      breadcrumbs={[
        { name: "Home", path: "/" },
        { name: "Explore", path: "/explore" },
        { name: state.state, path: `/usa/${state.stateSlug}` },
      ]}
      eyebrow="By state"
      title={state.state}
      introduction={`${state.count} Michelin-starred restaurants appear in the current United States roster for ${state.state}: ${state.threeStar} three-star, ${state.twoStar} two-star, and ${state.oneStar} one-star. Counts reflect the imported workbook only.`}
      count={state.count}
      restaurants={restaurants}
      relatedLinks={[
        {
          href: `/explore?state=${state.stateSlug}`,
          label: `Filter Explore · ${state.state}`,
        },
        ...cities.map((city) => ({
          href: `/cities/${city.citySlug}`,
          label: city.city,
        })),
        { href: "/about-michelin-stars", label: "Michelin stars explained" },
      ]}
    />
  );
}
