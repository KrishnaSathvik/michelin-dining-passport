import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CuisinePageView,
  toCuisinePageViewModel,
} from "@/components/stitch/taxonomy";
import {
  getCuisineAggregate,
  getCuisineAggregates,
  getRestaurantsByCuisine,
} from "@/lib/data/restaurants";
import { buildPageMetadata } from "@/lib/seo/metadata";

type CuisinePageProps = {
  params: Promise<{ cuisineSlug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getCuisineAggregates().map((cuisine) => ({
    cuisineSlug: cuisine.cuisineSlug,
  }));
}

export async function generateMetadata({
  params,
}: CuisinePageProps): Promise<Metadata> {
  const { cuisineSlug } = await params;
  const cuisine = getCuisineAggregate(cuisineSlug);
  if (!cuisine) {
    return buildPageMetadata({
      title: "Cuisine not found",
      description: "This cuisine page could not be found.",
      path: `/cuisines/${cuisineSlug}`,
      noIndex: true,
    });
  }

  return buildPageMetadata({
    title: `${cuisine.cuisine} Michelin-Starred Restaurants`,
    description: `${cuisine.count} ${cuisine.cuisine} Michelin-starred restaurants in the current United States roster.`,
    path: `/cuisines/${cuisine.cuisineSlug}`,
  });
}

export default async function CuisinePage({ params }: CuisinePageProps) {
  const { cuisineSlug } = await params;
  const cuisine = getCuisineAggregate(cuisineSlug);
  if (!cuisine) notFound();

  const restaurants = getRestaurantsByCuisine(cuisineSlug);
  const model = toCuisinePageViewModel({ cuisine, restaurants });

  return <CuisinePageView model={model} />;
}
