import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TaxonomyPageShell } from "@/components/taxonomy/TaxonomyPageShell";
import {
  getCityAggregate,
  getCityAggregates,
  getCuisineAggregates,
  getRestaurantsByCity,
} from "@/lib/data/restaurants";
import { buildPageMetadata } from "@/lib/seo/metadata";

type CityPageProps = {
  params: Promise<{ citySlug: string }>;
};

export function generateStaticParams() {
  return getCityAggregates().map((city) => ({ citySlug: city.citySlug }));
}

export async function generateMetadata({
  params,
}: CityPageProps): Promise<Metadata> {
  const { citySlug } = await params;
  const city = getCityAggregate(citySlug);
  if (!city) {
    return buildPageMetadata({
      title: "City not found",
      description: "This city page could not be found.",
      path: `/cities/${citySlug}`,
      noIndex: true,
    });
  }

  return buildPageMetadata({
    title: `Michelin-starred restaurants in ${city.city}, ${city.stateCode}`,
    description: `${city.count} Michelin-starred restaurants in ${city.city}, ${city.state} in the current roster.`,
    path: `/cities/${city.citySlug}`,
  });
}

export default async function CityPage({ params }: CityPageProps) {
  const { citySlug } = await params;
  const city = getCityAggregate(citySlug);
  if (!city) notFound();

  const restaurants = getRestaurantsByCity(citySlug);
  const cuisineSlugs = new Set(restaurants.map((item) => item.cuisineSlug));
  const relatedCuisines = getCuisineAggregates()
    .filter((cuisine) => cuisineSlugs.has(cuisine.cuisineSlug))
    .slice(0, 6);

  return (
    <TaxonomyPageShell
      breadcrumbs={[
        { name: "Home", path: "/" },
        { name: "Explore", path: "/explore" },
        { name: city.state, path: `/usa/${city.stateSlug}` },
        { name: city.city, path: `/cities/${city.citySlug}` },
      ]}
      eyebrow="By city"
      title={`${city.city}, ${city.stateCode}`}
      introduction={`${city.count} Michelin-starred restaurants are listed for ${city.city}, ${city.state} in the current roster (${city.threeStar} three-star, ${city.twoStar} two-star, ${city.oneStar} one-star).`}
      count={city.count}
      restaurants={restaurants}
      relatedLinks={[
        {
          href: `/usa/${city.stateSlug}`,
          label: `All of ${city.state}`,
        },
        {
          href: `/explore?city=${city.citySlug}`,
          label: `Filter Explore · ${city.city}`,
        },
        ...relatedCuisines.map((cuisine) => ({
          href: `/cuisines/${cuisine.cuisineSlug}`,
          label: cuisine.cuisine,
        })),
      ]}
    />
  );
}
