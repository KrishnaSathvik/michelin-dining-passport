import Link from "next/link";
import type { Restaurant } from "@/lib/data/types";
import { getRestaurantReservation } from "@/lib/reservations/data";
import type { ReservationSurface } from "@/lib/reservations/types";
import { CuisineLabel } from "./CuisineLabel";
import { LocationLine } from "./LocationLine";
import { PriceMark } from "./PriceMark";
import { ReservationButton } from "./ReservationButton";
import { RestaurantMedia } from "./RestaurantMedia";
import { SaveRestaurantButton } from "./SaveRestaurantButton";
import { StarMark } from "./StarMark";

type RestaurantCompactCardProps = {
  restaurant: Restaurant;
  surface?: ReservationSurface;
  emphasizeReservation?: boolean;
};

export function RestaurantCompactCard({
  restaurant,
  surface = "explore_list",
  emphasizeReservation = false,
}: RestaurantCompactCardProps) {
  const reservation = getRestaurantReservation(restaurant.slug);

  return (
    <article className="grid gap-4 border-t border-border py-5 first:border-t-0 first:pt-0 sm:grid-cols-[5.5rem_minmax(0,1fr)_auto] sm:items-center sm:gap-5">
      <Link
        href={`/restaurants/${restaurant.slug}`}
        className="hidden overflow-hidden rounded-[var(--radius-md)] sm:block"
      >
        <RestaurantMedia
          restaurant={restaurant}
          className="!aspect-square [&_>div]:aspect-square"
        />
      </Link>
      <div>
        <h3 className="font-display text-xl text-ink sm:text-2xl">
          <Link
            href={`/restaurants/${restaurant.slug}`}
            className="no-underline hover:text-forest"
          >
            {restaurant.name}
          </Link>
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
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
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <ReservationButton
          restaurant={restaurant}
          reservation={reservation}
          surface={surface}
          variant={emphasizeReservation ? "full" : "compact"}
          showProvider={false}
          className="rounded-[var(--radius-md)]"
        />
        <SaveRestaurantButton restaurantSlug={restaurant.slug} />
      </div>
    </article>
  );
}
