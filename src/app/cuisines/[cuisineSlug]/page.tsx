import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TaxonomyPageShell } from "@/components/taxonomy/TaxonomyPageShell";
import {
  getCuisineAggregate,
  getCuisineAggregates,
  getRestaurantsByCuisine,
  getStateAggregates,
} from "@/lib/data/restaurants";
import { buildPageMetadata } from "@/lib/seo/metadata";

type CuisinePageProps = {
  params: Promise<{ cuisineSlug: string }>;
};

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
    title: `${cuisine.cuisine} Michelin-starred restaurants`,
    description: `${cuisine.count} ${cuisine.cuisine} Michelin-starred restaurants in the current United States roster.`,
    path: `/cuisines/${cuisine.cuisineSlug}`,
  });
}

export default async function CuisinePage({ params }: CuisinePageProps) {
  const { cuisineSlug } = await params;
  const cuisine = getCuisineAggregate(cuisineSlug);
  if (!cuisine) notFound();

  const restaurants = getRestaurantsByCuisine(cuisineSlug);
  const stateSlugs = new Set(restaurants.map((item) => item.stateSlug));
  const relatedStates = getStateAggregates()
    .filter((state) => stateSlugs.has(state.stateSlug))
    .slice(0, 6);
  const peerCuisines = getCuisineAggregates()
    .filter((item) => item.cuisineSlug !== cuisineSlug)
    .slice(0, 6);

  return (
    <TaxonomyPageShell
      breadcrumbs={[
        { name: "Home", path: "/" },
        { name: "Explore", path: "/explore" },
        { name: cuisine.cuisine, path: `/cuisines/${cuisine.cuisineSlug}` },
      ]}
      eyebrow="By cuisine"
      title={cuisine.cuisine}
      introduction={`${cuisine.count} restaurants labeled ${cuisine.cuisine} appear in the current Michelin-starred United States roster. Cuisine labels are preserved from the source workbook.`}
      count={cuisine.count}
      restaurants={restaurants}
      relatedLinks={[
        {
          href: `/explore?cuisine=${cuisine.cuisineSlug}`,
          label: `Filter Explore · ${cuisine.cuisine}`,
        },
        ...relatedStates.map((state) => ({
          href: `/usa/${state.stateSlug}`,
          label: state.state,
        })),
        ...peerCuisines.map((item) => ({
          href: `/cuisines/${item.cuisineSlug}`,
          label: item.cuisine,
        })),
      ]}
    />
  );
}
