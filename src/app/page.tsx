import { BrowseByCuisine } from "@/components/home/BrowseByCuisine";
import { BrowseByState } from "@/components/home/BrowseByState";
import { FeaturedRestaurants } from "@/components/home/FeaturedRestaurants";
import { MapTeaser } from "@/components/home/MapTeaser";
import { MichelinStarsExplained } from "@/components/home/MichelinStarsExplained";
import { PassportPreview } from "@/components/home/PassportPreview";
import { SearchHero } from "@/components/home/SearchHero";
import { homepageConfig } from "@/config/homepage";
import {
  getCityAggregates,
  getCuisineAggregates,
  getRegionCount,
  getRestaurantsBySlugs,
  getStateAggregates,
  getTotals,
} from "@/lib/data/restaurants";

export default function HomePage() {
  const totals = getTotals();
  const regionCount = getRegionCount();
  const cityCount = getCityAggregates().length;
  const featured = getRestaurantsBySlugs(
    homepageConfig.featuredRestaurantSlugs,
  );
  const states = getStateAggregates();
  const cuisines = getCuisineAggregates();

  return (
    <>
      <SearchHero
        totals={totals}
        regionCount={regionCount}
        cityCount={cityCount}
      />
      <FeaturedRestaurants restaurants={featured} />
      <BrowseByState states={states} />
      <BrowseByCuisine cuisines={cuisines} />
      <MapTeaser />
      <MichelinStarsExplained />
      <PassportPreview />
    </>
  );
}
