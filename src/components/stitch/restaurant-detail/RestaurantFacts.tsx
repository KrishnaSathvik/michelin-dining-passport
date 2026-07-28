import type { ReactNode } from "react";
import Link from "next/link";
import { MichelinDistinction } from "@/components/stitch/restaurant";
import type { RestaurantDetailModel } from "./models";

type RestaurantFactsProps = {
  restaurant: RestaurantDetailModel;
};

/**
 * Reliable first-party facts only. Provider-derived hours, rating, and phone
 * stay in the bounded Google surface.
 */
export function RestaurantFacts({ restaurant }: RestaurantFactsProps) {
  const facts: Array<{ label: string; value: ReactNode }> = [
    {
      label: "Michelin distinction",
      value: (
        <MichelinDistinction
          stars={restaurant.stars}
          variant="row"
          showLabel
        />
      ),
    },
    {
      label: "Destination",
      value: (
        <Link
          href={`/cities/${restaurant.citySlug}`}
          className="text-dp-primary no-underline hover:underline"
        >
          {restaurant.locationLabel}
        </Link>
      ),
    },
  ];
  if (restaurant.cuisine) {
    facts.splice(1, 0, {
      label: "Cuisine",
      value: (
        <Link
          href={`/cuisines/${restaurant.cuisineSlug}`}
          className="text-dp-primary no-underline hover:underline"
        >
          {restaurant.cuisine}
        </Link>
      ),
    });
  }
  if (restaurant.price) {
    facts.splice(2, 0, {
      label: "Price",
      value: <span>{restaurant.price}</span>,
    });
  }
  if (restaurant.address) {
    facts.push({
      label: "Address",
      value: (
        <span className="whitespace-pre-line">{restaurant.address}</span>
      ),
    });
  }
  if (
    restaurant.reservation.isDirectBooking &&
    restaurant.reservation.providerLabel
  ) {
    facts.push({
      label: "Reservations",
      value: <span>{restaurant.reservation.providerLabel}</span>,
    });
  }

  return (
    <section
      className="mb-[var(--dp-section)] border-t border-dp-border pt-[var(--dp-section)]"
      aria-labelledby="restaurant-details-heading"
      data-restaurant-facts
    >
      <p className="dp-label-caps text-dp-ink-muted">At a glance</p>
      <h2
        id="restaurant-details-heading"
        className="dp-headline-md mt-2 text-dp-primary-deep"
      >
        Details
      </h2>
      <dl className="mt-7 grid min-w-0 grid-cols-1 border-t border-dp-border sm:grid-cols-2 lg:grid-cols-3">
        {facts.map((fact) => (
          <div
            key={fact.label}
            className="min-w-0 border-b border-dp-border py-5 sm:pr-6"
          >
            <dt className="dp-label-caps text-dp-ink-muted">{fact.label}</dt>
            <dd className="mt-2 font-sans text-base leading-relaxed text-dp-ink">
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
