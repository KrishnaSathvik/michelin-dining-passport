import Link from "next/link";
import { MichelinDistinction } from "@/components/stitch/restaurant/MichelinDistinction";
import { RestaurantMedia } from "@/components/stitch/restaurant/RestaurantMedia";
import type { PassportSavedRestaurantModel } from "./models";

const PREVIEW_LIMIT = 3;

type PassportSavedSectionProps = {
  restaurants: PassportSavedRestaurantModel[];
};

export function PassportSavedSection({
  restaurants,
}: PassportSavedSectionProps) {
  if (restaurants.length === 0) return null;

  const preview = restaurants.slice(0, PREVIEW_LIMIT);
  const showViewAll = restaurants.length > PREVIEW_LIMIT;

  return (
    <section
      aria-labelledby="saved-restaurants-heading"
      className="mb-[var(--dp-section)]"
      data-passport-section="saved-restaurants"
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="dp-label-caps text-dp-ink-muted">Keep close</p>
          <h2
            id="saved-restaurants-heading"
            className="dp-headline-md mt-2 text-dp-primary-deep"
          >
            Saved restaurants
          </h2>
        </div>
        {showViewAll ? (
          <Link
            href="/saved"
            className="inline-flex min-h-11 items-center font-sans text-sm font-semibold text-dp-primary underline-offset-4 hover:underline"
          >
            View all saved
          </Link>
        ) : null}
      </div>

      <ul className="grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {preview.map((restaurant) => (
          <li key={restaurant.slug} className="min-w-0">
            <article
              className="group flex h-full min-w-0 flex-col"
              data-passport-card="saved"
            >
              <Link
                href={`/restaurants/${restaurant.slug}`}
                aria-label={`Open ${restaurant.name}`}
                className="block min-w-0 overflow-hidden rounded-[var(--dp-radius-lg)]"
              >
                <div className="motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.02]">
                  <RestaurantMedia
                    name={restaurant.name}
                    seed={restaurant.slug}
                    city={restaurant.location}
                    stars={restaurant.distinction}
                    imageUrl={restaurant.imageUrl}
                    placeId={restaurant.placeId}
                    ratioClass="aspect-[4/3]"
                  />
                </div>
              </Link>
              <div className="flex flex-1 flex-col pt-4">
                <div className="flex items-center justify-between gap-3">
                  <MichelinDistinction
                    stars={restaurant.distinction}
                    variant="compact"
                  />
                  <span className="font-sans text-xs font-semibold text-dp-primary">
                    <span aria-hidden="true">♥</span> Saved
                  </span>
                </div>
                <h3 className="mt-2 font-display text-xl leading-tight text-dp-primary-deep">
                  <Link
                    href={`/restaurants/${restaurant.slug}`}
                    className="no-underline hover:text-dp-primary"
                  >
                    {restaurant.name}
                  </Link>
                </h3>
                <p className="mt-2 font-sans text-sm leading-relaxed text-dp-ink-muted">
                  {[restaurant.cuisine, restaurant.location, restaurant.price]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <Link
                  href={`/restaurants/${restaurant.slug}`}
                  className="mt-auto inline-flex min-h-11 items-center pt-3 font-sans text-sm font-semibold text-dp-primary hover:underline"
                >
                  Open details
                </Link>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
