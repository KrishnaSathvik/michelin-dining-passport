import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TaxonomyPageShell } from "@/components/taxonomy/TaxonomyPageShell";
import {
  getRestaurantsByStars,
  getStarAggregates,
  getStateAggregates,
  parseStarCount,
} from "@/lib/data/restaurants";
import { buildPageMetadata } from "@/lib/seo/metadata";

type StarPageProps = {
  params: Promise<{ starCount: string }>;
};

const starMeanings = {
  1: "High-quality cooking worth a stop",
  2: "Excellent cooking worth a detour",
  3: "Exceptional cuisine worth a special journey",
} as const;

export function generateStaticParams() {
  return [{ starCount: "1" }, { starCount: "2" }, { starCount: "3" }];
}

export async function generateMetadata({
  params,
}: StarPageProps): Promise<Metadata> {
  const { starCount } = await params;
  const stars = parseStarCount(starCount);
  if (!stars) {
    return buildPageMetadata({
      title: "Star level not found",
      description: "This star level page could not be found.",
      path: `/stars/${starCount}`,
      noIndex: true,
    });
  }

  const aggregate = getStarAggregates().find((item) => item.stars === stars);
  const label = stars === 1 ? "1-star" : `${stars}-star`;

  return buildPageMetadata({
    title: `${label} Michelin restaurants in the United States`,
    description: `${aggregate?.count ?? 0} ${label} Michelin Guide restaurants in the current United States roster.`,
    path: `/stars/${stars}`,
  });
}

export default async function StarPage({ params }: StarPageProps) {
  const { starCount } = await params;
  const stars = parseStarCount(starCount);
  if (!stars) notFound();

  const restaurants = getRestaurantsByStars(stars);
  const aggregate = getStarAggregates().find((item) => item.stars === stars);
  const label = stars === 1 ? "1-star" : `${stars}-star`;
  const relatedStates = getStateAggregates().slice(0, 6);

  return (
    <TaxonomyPageShell
      breadcrumbs={[
        { name: "Home", path: "/" },
        { name: "Explore", path: "/explore" },
        { name: label, path: `/stars/${stars}` },
      ]}
      eyebrow="By star level"
      title={`${label} restaurants`}
      introduction={`${aggregate?.count ?? restaurants.length} restaurants currently carry a ${label} Michelin Guide distinction in this United States roster. In Guide terms: ${starMeanings[stars]}. See the education page for coverage limits and related distinctions.`}
      count={restaurants.length}
      restaurants={restaurants}
      relatedLinks={[
        {
          href: `/explore?stars=${stars}`,
          label: `Filter Explore · ${label}`,
        },
        { href: "/about-michelin-stars", label: "Michelin stars explained" },
        ...[1, 2, 3]
          .filter((value) => value !== stars)
          .map((value) => ({
            href: `/stars/${value}`,
            label: value === 1 ? "1-star restaurants" : `${value}-star restaurants`,
          })),
        ...relatedStates.map((state) => ({
          href: `/usa/${state.stateSlug}`,
          label: state.state,
        })),
      ]}
    />
  );
}
