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
    <article className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] bg-bg">
      <div className="relative">
        <Link
          href={`/restaurants/${restaurant.slug}`}
          className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
        >
          <RestaurantMedia restaurant={restaurant} />
        </Link>
        <div className="absolute right-3 top-3 z-10">
          <SaveRestaurantButton restaurantSlug={restaurant.slug} overlay />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 px-1 pb-1 pt-4 sm:px-0">
        <StarMark stars={restaurant.stars} size="sm" />
        <h3 className="font-display text-xl leading-tight text-ink sm:text-[1.35rem]">
          <Link
            href={`/restaurants/${restaurant.slug}`}
            className="no-underline hover:text-forest"
          >
            {restaurant.name}
          </Link>
        </h3>
        <CuisineLabel cuisine={restaurant.cuisine} />
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-ink-secondary">
          <LocationLine
            city={restaurant.city}
            state={restaurant.state}
            stateCode={restaurant.stateCode}
          />
          <span className="text-border" aria-hidden="true">
            ·
          </span>
          <PriceMark price={restaurant.price} />
        </div>
        <div className="mt-auto pt-3">
          <ReservationButton
            restaurant={restaurant}
            reservation={reservation}
            surface={surface}
            variant="full"
            showProvider={false}
            className="w-full rounded-[var(--radius-md)] text-center"
          />
        </div>
      </div>
    </article>
  );
}
