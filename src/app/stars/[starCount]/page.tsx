import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  StarPageView,
  toStarPageViewModel,
} from "@/components/stitch/taxonomy";
import {
  getRestaurantsByStars,
  getStarAggregates,
  parseStarCount,
} from "@/lib/data/restaurants";
import { buildPageMetadata } from "@/lib/seo/metadata";

type StarPageProps = {
  params: Promise<{ starCount: string }>;
};

export const dynamicParams = false;

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
  const title =
    stars === 1
      ? "One Michelin Star Restaurants"
      : stars === 2
        ? "Two Michelin Star Restaurants"
        : "Three Michelin Star Restaurants";

  return buildPageMetadata({
    title,
    description: `${aggregate?.count ?? 0} restaurants with ${stars} Michelin ${stars === 1 ? "star" : "stars"} in the current United States roster.`,
    path: `/stars/${stars}`,
  });
}

export default async function StarPage({ params }: StarPageProps) {
  const { starCount } = await params;
  const stars = parseStarCount(starCount);
  if (!stars) notFound();

  const restaurants = getRestaurantsByStars(stars);
  const model = toStarPageViewModel({ stars, restaurants });

  return <StarPageView model={model} />;
}
