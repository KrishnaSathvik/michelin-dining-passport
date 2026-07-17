import Link from "next/link";
import type { Restaurant } from "@/lib/data/types";
import { getRestaurantReservation } from "@/lib/reservations/data";
import type { ReservationSurface } from "@/lib/reservations/types";
import { CuisineLabel } from "./CuisineLabel";
import { ExternalTextLink } from "./ExternalTextLink";
import { LocationLine } from "./LocationLine";
import { PriceMark } from "./PriceMark";
import { ReservationButton } from "./ReservationButton";
import { RestaurantImagePlaceholder } from "./RestaurantImagePlaceholder";
import { StarMark } from "./StarMark";

type RestaurantDiscoveryCardProps = {
  restaurant: Restaurant;
  surface?: ReservationSurface;
};

export function RestaurantDiscoveryCard({
  restaurant,
  surface = "explore_grid",
}: RestaurantDiscoveryCardProps) {
  const reservation = getRestaurantReservation(restaurant.slug);

  return (
    <article className="flex h-full flex-col border border-border bg-bg-elevated/60">
      <Link
        href={`/restaurants/${restaurant.slug}`}
        className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
      >
        <RestaurantImagePlaceholder restaurant={restaurant} />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <h3 className="font-display text-2xl leading-tight text-ink">
          <Link
            href={`/restaurants/${restaurant.slug}`}
            className="hover:text-forest"
          >
            {restaurant.name}
          </Link>
        </h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <StarMark stars={restaurant.stars} size="sm" />
          <CuisineLabel cuisine={restaurant.cuisine} />
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <LocationLine
            city={restaurant.city}
            state={restaurant.state}
            stateCode={restaurant.stateCode}
          />
          <PriceMark price={restaurant.price} />
        </div>
        <div className="mt-auto flex flex-wrap items-end gap-x-4 gap-y-2 pt-2 font-sans text-sm">
          <ReservationButton
            restaurant={restaurant}
            reservation={reservation}
            surface={surface}
            variant="compact"
          />
          <ExternalTextLink href={restaurant.michelinGuideUrl}>
            Guide listing
          </ExternalTextLink>
          {restaurant.website ? (
            <ExternalTextLink href={restaurant.website}>
              Website
            </ExternalTextLink>
          ) : null}
        </div>
      </div>
    </article>
  );
}
