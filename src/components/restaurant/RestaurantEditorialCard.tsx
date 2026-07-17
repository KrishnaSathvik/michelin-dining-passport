import Link from "next/link";
import type { Restaurant } from "@/lib/data/types";
import { getRestaurantReservation } from "@/lib/reservations/data";
import { CuisineLabel } from "./CuisineLabel";
import { ExternalTextLink } from "./ExternalTextLink";
import { LocationLine } from "./LocationLine";
import { PriceMark } from "./PriceMark";
import { ReservationButton } from "./ReservationButton";
import { RestaurantImagePlaceholder } from "./RestaurantImagePlaceholder";
import { StarMark } from "./StarMark";

type RestaurantEditorialCardProps = {
  restaurant: Restaurant;
};

export function RestaurantEditorialCard({
  restaurant,
}: RestaurantEditorialCardProps) {
  const reservation = getRestaurantReservation(restaurant.slug);

  return (
    <article className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-10">
      <Link
        href={`/restaurants/${restaurant.slug}`}
        className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
      >
        <RestaurantImagePlaceholder restaurant={restaurant} priorityVisual />
      </Link>

      <div className="flex flex-col justify-center border-t border-border pt-6 lg:border-t-0 lg:border-l lg:pl-10 lg:pt-0">
        <p className="font-sans text-xs uppercase tracking-[0.18em] text-burgundy">
          Featured
        </p>
        <h3 className="mt-3 font-display text-3xl leading-tight text-ink sm:text-4xl">
          <Link
            href={`/restaurants/${restaurant.slug}`}
            className="hover:text-forest"
          >
            {restaurant.name}
          </Link>
        </h3>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <StarMark stars={restaurant.stars} size="lg" />
          <CuisineLabel cuisine={restaurant.cuisine} />
          <LocationLine
            city={restaurant.city}
            state={restaurant.state}
            stateCode={restaurant.stateCode}
          />
          <PriceMark price={restaurant.price} />
        </div>

        <p className="mt-5 max-w-md font-sans text-sm leading-relaxed text-ink-muted">
          Factual listing from the independent 2026 roster — cuisine, distinction,
          location, and source links only.
        </p>

        <div className="mt-6 flex flex-wrap items-end gap-x-5 gap-y-2 font-sans text-sm">
          <ReservationButton
            restaurant={restaurant}
            reservation={reservation}
            surface="homepage"
            variant="full"
          />
          <ExternalTextLink href={restaurant.michelinGuideUrl}>
            Michelin Guide listing
          </ExternalTextLink>
          {restaurant.website ? (
            <ExternalTextLink href={restaurant.website}>
              Restaurant website
            </ExternalTextLink>
          ) : (
            <span className="text-ink-muted">Website unavailable</span>
          )}
        </div>
      </div>
    </article>
  );
}
