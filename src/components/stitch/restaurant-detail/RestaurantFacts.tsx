import type { ReactNode } from "react";
import Link from "next/link";
import type { RestaurantDetailModel } from "./models";
import { RestaurantLocationPreview } from "./RestaurantLocationPreview";

type RestaurantFactsProps = {
  restaurant: RestaurantDetailModel;
};

function Fact({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-6">
      <h3 className="dp-label-caps mb-2 text-dp-ink-muted">{label}</h3>
      <div className="font-sans text-base text-dp-ink">{children}</div>
    </div>
  );
}

/**
 * Factual details + location band (left side of Details / Google silhouette).
 */
export function RestaurantFacts({ restaurant }: RestaurantFactsProps) {
  return (
    <div className="min-w-0 flex-1" data-restaurant-facts>
      <h2 className="dp-headline-md mb-8 text-dp-ink">Details</h2>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          {restaurant.address ? (
            <Fact label="Address">
              <p className="whitespace-pre-line leading-relaxed">
                {restaurant.address}
              </p>
            </Fact>
          ) : null}
          {restaurant.cuisine ? (
            <Fact label="Cuisine">
              <Link
                href={`/cuisines/${restaurant.cuisineSlug}`}
                className="text-dp-primary no-underline hover:underline"
              >
                {restaurant.cuisine}
              </Link>
            </Fact>
          ) : null}
          {restaurant.price ? (
            <Fact label="Price">
              <span>{restaurant.price}</span>
            </Fact>
          ) : null}
          <Fact label="Location">
            <Link
              href={`/cities/${restaurant.citySlug}`}
              className="text-dp-primary no-underline hover:underline"
            >
              {restaurant.locationLabel}
            </Link>
          </Fact>
        </div>
        <RestaurantLocationPreview restaurant={restaurant} />
      </div>
    </div>
  );
}
