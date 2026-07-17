"use client";

import Link from "next/link";
import { RestaurantCompactCard } from "@/components/restaurant/RestaurantCompactCard";
import { usePassport } from "@/lib/passport/PassportProvider";
import type { Restaurant } from "@/lib/data/types";
import type { ReservationSurface } from "@/lib/reservations/types";

type PassportRestaurantListProps = {
  restaurants: Restaurant[];
  mode: "saved" | "visited" | "planned" | "wantToVisit";
  emptyTitle: string;
  emptyBody: string;
};

function surfaceForMode(
  mode: PassportRestaurantListProps["mode"],
): ReservationSurface {
  switch (mode) {
    case "saved":
      return "saved";
    case "visited":
      return "visited";
    case "planned":
      return "planned";
    case "wantToVisit":
      return "saved";
    default: {
      const _exhaustive: never = mode;
      return _exhaustive;
    }
  }
}

export function PassportRestaurantList({
  restaurants,
  mode,
  emptyTitle,
  emptyBody,
}: PassportRestaurantListProps) {
  const { ready, store, getRecord } = usePassport();

  if (!ready) {
    return <p className="font-sans text-sm text-ink-muted">Loading…</p>;
  }

  const slugs = new Set(
    Object.values(store.userRestaurants)
      .filter((record) => {
        switch (mode) {
          case "saved":
            return record.saved;
          case "visited":
            return record.visited;
          case "planned":
            return record.planned;
          case "wantToVisit":
            return record.wantToVisit;
          default: {
            const _exhaustive: never = mode;
            return _exhaustive;
          }
        }
      })
      .map((record) => record.restaurantSlug),
  );

  const items = restaurants.filter((restaurant) => slugs.has(restaurant.slug));
  const surface = surfaceForMode(mode);

  if (items.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-border px-6 py-12 text-center">
        <h2 className="font-display text-3xl text-ink">{emptyTitle}</h2>
        <p className="mx-auto mt-3 max-w-lg font-sans text-sm leading-relaxed text-ink-muted">
          {emptyBody}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/explore"
            className="inline-flex min-h-11 items-center rounded-[var(--radius-md)] bg-forest px-5 font-sans text-sm font-medium text-white no-underline hover:bg-forest-deep"
          >
            Explore restaurants
          </Link>
          <Link
            href="/map"
            className="inline-flex min-h-11 items-center rounded-[var(--radius-md)] border border-border px-5 font-sans text-sm text-ink no-underline"
          >
            View map
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-[var(--radius-lg)] border border-border bg-bg px-4 sm:px-5">
      {items.map((restaurant) => {
        const record = getRecord(restaurant.slug);
        const statusBits = [
          mode === "visited" && record?.visitDate
            ? `Visited ${record.visitDate}`
            : null,
          mode === "planned" && record?.reservationPlannedFor
            ? `Planned for ${record.reservationPlannedFor}`
            : null,
          record?.favorite ? "Favorite" : null,
        ].filter(Boolean);

        return (
          <li key={restaurant.slug} className="py-1">
            {statusBits.length > 0 ? (
              <p className="pt-4 font-sans text-xs uppercase tracking-[0.14em] text-ink-muted">
                {statusBits.join(" · ")}
              </p>
            ) : null}
            <RestaurantCompactCard
              restaurant={restaurant}
              surface={surface}
              emphasizeReservation={mode === "planned"}
            />
          </li>
        );
      })}
    </ul>
  );
}
