import Link from "next/link";
import type { Restaurant } from "@/lib/data/types";
import { getRestaurantReservation } from "@/lib/reservations/data";
import { CuisineLabel } from "./CuisineLabel";
import { LocationLine } from "./LocationLine";
import { PriceMark } from "./PriceMark";
import { ReservationButton } from "./ReservationButton";
import { RestaurantMedia } from "./RestaurantMedia";
import { SaveRestaurantButton } from "./SaveRestaurantButton";
import { StarMark } from "./StarMark";

type RestaurantEditorialCardProps = {
  restaurant: Restaurant;
};

export function RestaurantEditorialCard({
  restaurant,
}: RestaurantEditorialCardProps) {
  const reservation = getRestaurantReservation(restaurant.slug);

  return (
    <article className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-center lg:gap-12">
      <div className="relative">
        <Link
          href={`/restaurants/${restaurant.slug}`}
          className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
        >
          <RestaurantMedia
            restaurant={restaurant}
            priorityVisual
            className="min-h-[20rem] sm:min-h-[22rem] lg:min-h-[24rem] [&_>div]:aspect-auto [&_>div]:h-full [&_>div]:min-h-[20rem] lg:[&_>div]:min-h-[24rem]"
          />
        </Link>
        <div className="absolute right-3 top-3 z-10">
          <SaveRestaurantButton restaurantSlug={restaurant.slug} overlay />
        </div>
      </div>

      <div className="flex flex-col justify-center">
        <p className="font-sans text-xs uppercase tracking-[0.18em] text-ink-muted">
          Featured
        </p>
        <h3 className="mt-3 font-display text-3xl leading-tight text-ink sm:text-4xl lg:text-5xl">
          <Link
            href={`/restaurants/${restaurant.slug}`}
            className="no-underline hover:text-forest"
          >
            {restaurant.name}
          </Link>
        </h3>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
          <StarMark stars={restaurant.stars} size="lg" />
          <CuisineLabel cuisine={restaurant.cuisine} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-ink-secondary">
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

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <ReservationButton
            restaurant={restaurant}
            reservation={reservation}
            surface="homepage"
            variant="full"
            showProvider={false}
            className="rounded-[var(--radius-md)]"
          />
          <SaveRestaurantButton restaurantSlug={restaurant.slug} />
        </div>
      </div>
    </article>
  );
}
