"use client";

import Link from "next/link";
import { DeviceSaveNotice } from "@/components/passport/DeviceSaveNotice";
import { RestaurantCompactCard } from "@/components/restaurant/RestaurantCompactCard";
import { usePassport } from "@/lib/passport/PassportProvider";
import type { Restaurant } from "@/lib/data/types";

type PassportHomeProps = {
  restaurants?: Restaurant[];
};

export function PassportHome({ restaurants = [] }: PassportHomeProps) {
  const { ready, metrics, exportJson, importJson, clearAll, store } =
    usePassport();

  if (!ready) {
    return <p className="font-sans text-sm text-ink-muted">Loading passport…</p>;
  }

  const cards = [
    { label: "Restaurants visited", value: metrics.restaurantsVisited },
    { label: "Stars experienced", value: metrics.starsExperienced },
    { label: "States explored", value: metrics.statesExplored },
    { label: "Cities explored", value: metrics.citiesExplored },
    { label: "Cuisines tried", value: metrics.cuisinesTried },
    { label: "Three-star visited", value: metrics.threeStarVisited },
    { label: "Saved restaurants", value: metrics.savedRestaurants },
    {
      label: "Collections",
      value: Object.keys(store.collections).length,
    },
  ];

  const plannedSlugs = new Set(
    Object.values(store.userRestaurants)
      .filter((record) => record.planned)
      .map((record) => record.restaurantSlug),
  );
  const plannedRestaurants = restaurants.filter((restaurant) =>
    plannedSlugs.has(restaurant.slug),
  );

  return (
    <div className="space-y-8">
      <DeviceSaveNotice />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="border border-border bg-bg-elevated/50 px-4 py-5"
          >
            <p className="font-sans text-xs uppercase tracking-[0.16em] text-ink-muted">
              {card.label}
            </p>
            <p className="mt-2 font-display text-3xl text-ink">{card.value}</p>
          </div>
        ))}
      </div>

      {plannedRestaurants.length > 0 ? (
        <section className="border border-border p-5">
          <h2 className="font-display text-2xl text-ink">Planned reservations</h2>
          <p className="mt-2 max-w-2xl font-sans text-sm text-ink-muted">
            Outbound booking links for restaurants you marked planned. Opening a
            link does not mark the meal visited.
          </p>
          <ul className="mt-4 divide-y divide-border border border-border bg-bg-elevated/40 px-4 sm:px-5">
            {plannedRestaurants.map((restaurant) => (
              <li key={restaurant.slug}>
                <RestaurantCompactCard
                  restaurant={restaurant}
                  surface="planned"
                  emphasizeReservation
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="border border-border p-5">
        <h2 className="font-display text-2xl text-ink">Stars experienced</h2>
        <p className="mt-3 max-w-2xl font-sans text-sm leading-relaxed text-ink-muted">
          Formula: visiting a one-star restaurant adds one star, a two-star
          restaurant adds two stars, and a three-star restaurant adds three
          stars. Totals count each visited restaurant once.
        </p>
      </section>

      {metrics.visitsByYear.length > 0 ? (
        <section className="border border-border p-5">
          <h2 className="font-display text-2xl text-ink">Visits by year</h2>
          <ul className="mt-4 space-y-2 font-sans text-sm text-ink">
            {metrics.visitsByYear.map((entry) => (
              <li key={entry.year} className="flex justify-between border-b border-border py-2">
                <span>{entry.year}</span>
                <span className="text-ink-muted">{entry.count}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Link
          href="/saved"
          className="inline-flex min-h-11 items-center bg-forest px-5 font-sans text-sm font-medium text-bg-elevated"
        >
          Saved
        </Link>
        <Link
          href="/visited"
          className="inline-flex min-h-11 items-center border border-forest px-5 font-sans text-sm font-medium text-forest"
        >
          Visited
        </Link>
        <Link
          href="/collections"
          className="inline-flex min-h-11 items-center border border-border px-5 font-sans text-sm text-ink"
        >
          Collections
        </Link>
      </div>

      <section className="space-y-4 border border-border p-5">
        <h2 className="font-display text-2xl text-ink">Backup</h2>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="min-h-11 border border-border px-4 font-sans text-sm"
            onClick={() => {
              const blob = new Blob([exportJson()], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const anchor = document.createElement("a");
              anchor.href = url;
              anchor.download = "michelin-dining-passport.json";
              anchor.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export local data
          </button>
          <label className="inline-flex min-h-11 cursor-pointer items-center border border-border px-4 font-sans text-sm">
            Import local data
            <input
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                const text = await file.text();
                importJson(text);
                event.target.value = "";
              }}
            />
          </label>
          <button
            type="button"
            className="min-h-11 border border-burgundy px-4 font-sans text-sm text-burgundy"
            onClick={() => {
              if (
                window.confirm(
                  "Clear all Passport data saved on this device? This cannot be undone.",
                )
              ) {
                clearAll();
              }
            }}
          >
            Clear local data
          </button>
        </div>
      </section>
    </div>
  );
}
