import Link from "next/link";
import type { Restaurant } from "@/lib/data/types";
import { CuisineLabel } from "./CuisineLabel";
import { ExternalTextLink } from "./ExternalTextLink";
import { LocationLine } from "./LocationLine";
import { PriceMark } from "./PriceMark";
import { StarMark } from "./StarMark";

type RestaurantCompactCardProps = {
  restaurant: Restaurant;
};

export function RestaurantCompactCard({
  restaurant,
}: RestaurantCompactCardProps) {
  return (
    <article className="grid gap-2 border-t border-border py-4 first:border-t-0 first:pt-0 sm:grid-cols-[minmax(0,1.4fr)_auto] sm:items-baseline sm:gap-6">
      <div>
        <h3 className="font-display text-xl text-ink">
          <Link
            href={`/restaurants/${restaurant.slug}`}
            className="hover:text-forest"
          >
            {restaurant.name}
          </Link>
        </h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
          <StarMark stars={restaurant.stars} size="sm" />
          <CuisineLabel cuisine={restaurant.cuisine} />
          <LocationLine
            city={restaurant.city}
            state={restaurant.state}
            stateCode={restaurant.stateCode}
          />
          <PriceMark price={restaurant.price} />
        </div>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 font-sans text-sm sm:justify-end">
        <ExternalTextLink href={restaurant.michelinGuideUrl}>
          Guide
        </ExternalTextLink>
        {restaurant.website ? (
          <ExternalTextLink href={restaurant.website}>Website</ExternalTextLink>
        ) : null}
      </div>
    </article>
  );
}
