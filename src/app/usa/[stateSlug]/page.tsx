import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  StatePageView,
  toStatePageViewModel,
} from "@/components/stitch/taxonomy";
import {
  getRestaurantsByState,
  getStateAggregate,
  getStateAggregates,
} from "@/lib/data/restaurants";
import { buildPageMetadata } from "@/lib/seo/metadata";

type StatePageProps = {
  params: Promise<{ stateSlug: string }>;
};

/** Unknown state slugs 404 instead of falling through to a soft render. */
export const dynamicParams = false;

export function generateStaticParams() {
  return getStateAggregates().map((state) => ({ stateSlug: state.stateSlug }));
}

export async function generateMetadata({
  params,
}: StatePageProps): Promise<Metadata> {
  const { stateSlug } = await params;
  const state = getStateAggregate(stateSlug);
  if (!state) notFound();

  return buildPageMetadata({
    title: `Michelin-Starred Restaurants in ${state.state}`,
    description: `${state.count} Michelin-starred restaurants in ${state.state} (${state.oneStar} one-star, ${state.twoStar} two-star, ${state.threeStar} three-star) in the current roster.`,
    path: `/usa/${state.stateSlug}`,
  });
}

export default async function StatePage({ params }: StatePageProps) {
  const { stateSlug } = await params;
  const state = getStateAggregate(stateSlug);
  if (!state) notFound();

  const restaurants = getRestaurantsByState(stateSlug);
  const model = toStatePageViewModel({ state, restaurants });

  return <StatePageView model={model} />;
}
