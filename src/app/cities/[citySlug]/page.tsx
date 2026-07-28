import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CityPageView,
  toCityPageViewModel,
} from "@/components/stitch/taxonomy";
import {
  getCityAggregate,
  getCityAggregates,
  getRestaurantsByCity,
} from "@/lib/data/restaurants";
import { buildPageMetadata } from "@/lib/seo/metadata";

type CityPageProps = {
  params: Promise<{ citySlug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getCityAggregates().map((city) => ({ citySlug: city.citySlug }));
}

export async function generateMetadata({
  params,
}: CityPageProps): Promise<Metadata> {
  const { citySlug } = await params;
  const city = getCityAggregate(citySlug);
  if (!city) notFound();

  return buildPageMetadata({
    title: `Michelin-Starred Restaurants in ${city.city}`,
    description: `${city.count} Michelin-starred restaurants in ${city.city}, ${city.state} in the current roster.`,
    path: `/cities/${city.citySlug}`,
  });
}

export default async function CityPage({ params }: CityPageProps) {
  const { citySlug } = await params;
  const city = getCityAggregate(citySlug);
  if (!city) notFound();

  const restaurants = getRestaurantsByCity(citySlug);
  const model = toCityPageViewModel({ city, restaurants });

  return <CityPageView model={model} />;
}
