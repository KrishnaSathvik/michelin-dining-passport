"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DeviceSaveNotice } from "@/components/passport/DeviceSaveNotice";
import { RestaurantCompactCard } from "@/components/restaurant/RestaurantCompactCard";
import { RestaurantDiscoveryCard } from "@/components/restaurant/RestaurantDiscoveryCard";
import { Button } from "@/components/ui/Button";
import { usePassport } from "@/lib/passport/PassportProvider";
import type { Restaurant } from "@/lib/data/types";

type PassportHomeProps = {
  restaurants?: Restaurant[];
};

function plural(count: number, one: string, many: string): string {
  return count === 1 ? one : many;
}

export function PassportHome({ restaurants = [] }: PassportHomeProps) {
  const { ready, mode, metrics, exportJson, importJson, clearAll, store } =
    usePassport();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const bySlug = useMemo(
    () => new Map(restaurants.map((restaurant) => [restaurant.slug, restaurant])),
    [restaurants],
  );

  const records = useMemo(
    () => Object.values(store.userRestaurants),
    [store.userRestaurants],
  );

  const visitedRestaurants = useMemo(() => {
    return records
      .filter((record) => record.visited)
      .map((record) => ({
        record,
        restaurant: bySlug.get(record.restaurantSlug),
      }))
      .filter(
        (
          item,
        ): item is {
          record: (typeof records)[number];
          restaurant: Restaurant;
        } => Boolean(item.restaurant),
      )
      .sort((a, b) => {
        const aDate = a.record.visitDate ?? a.record.updatedAt;
        const bDate = b.record.visitDate ?? b.record.updatedAt;
        return bDate.localeCompare(aDate);
      });
  }, [bySlug, records]);

  const savedRestaurants = useMemo(() => {
    return records
      .filter((record) => record.saved && !record.visited)
      .map((record) => bySlug.get(record.restaurantSlug))
      .filter((restaurant): restaurant is Restaurant => Boolean(restaurant))
      .slice(0, 6);
  }, [bySlug, records]);

  const plannedRestaurants = useMemo(() => {
    return records
      .filter((record) => record.planned)
      .map((record) => bySlug.get(record.restaurantSlug))
      .filter((restaurant): restaurant is Restaurant => Boolean(restaurant));
  }, [bySlug, records]);

  const stateProgress = useMemo(() => {
    const counts = new Map<string, { label: string; count: number }>();
    for (const { restaurant } of visitedRestaurants) {
      const key = restaurant.stateSlug;
      const existing = counts.get(key);
      if (existing) existing.count += 1;
      else counts.set(key, { label: restaurant.state, count: 1 });
    }
    return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 6);
  }, [visitedRestaurants]);

  const cuisineProgress = useMemo(() => {
    const counts = new Map<string, { label: string; count: number }>();
    for (const { restaurant } of visitedRestaurants) {
      const key = restaurant.cuisineSlug;
      const existing = counts.get(key);
      if (existing) existing.count += 1;
      else counts.set(key, { label: restaurant.cuisine, count: 1 });
    }
    return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 6);
  }, [visitedRestaurants]);

  const collections = useMemo(
    () =>
      Object.values(store.collections).sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    [store.collections],
  );

  const isEmpty =
    records.length === 0 && Object.keys(store.collections).length === 0;

  if (!ready) {
    return (
      <p className="font-sans text-sm text-ink-muted">Loading passport…</p>
    );
  }

  if (isEmpty) {
    return (
      <div className="space-y-8">
        <DeviceSaveNotice />
        <section className="rounded-[var(--radius-lg)] border border-border bg-bg px-6 py-12 text-center sm:px-10">
          <h2 className="font-display text-3xl text-ink sm:text-4xl">
            Your Michelin journey starts with one restaurant
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-sans text-base leading-relaxed text-ink-muted">
            Save places you want to try, mark visits when you go, and build
            private collections. Your passport stays personal — no zeroed-out
            dashboards until you begin.
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
              className="inline-flex min-h-11 items-center rounded-[var(--radius-md)] border border-border px-5 font-sans text-sm text-ink no-underline hover:border-forest"
            >
              View map
            </Link>
          </div>
          <ul className="mx-auto mt-10 grid max-w-3xl gap-4 text-left sm:grid-cols-3">
            {[
              {
                title: "Save",
                body: "Bookmark restaurants for later from Explore, Map, or any detail page.",
              },
              {
                title: "Visit",
                body: "Record dates and private notes after a meal — never published.",
              },
              {
                title: "Collect",
                body: "Group restaurants into private lists for trips or themes.",
              },
            ].map((item) => (
              <li
                key={item.title}
                className="rounded-[var(--radius-md)] bg-surface-soft px-4 py-5"
              >
                <p className="font-display text-xl text-ink">{item.title}</p>
                <p className="mt-2 font-sans text-sm text-ink-muted">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </section>
        <PassportSettings
          open={settingsOpen}
          onToggle={() => setSettingsOpen((value) => !value)}
          mode={mode}
          exportJson={exportJson}
          importJson={importJson}
          clearAll={clearAll}
        />
      </div>
    );
  }

  const progressStatement = `You have visited ${metrics.restaurantsVisited} ${plural(
    metrics.restaurantsVisited,
    "restaurant",
    "restaurants",
  )} across ${metrics.statesExplored} ${plural(
    metrics.statesExplored,
    "state",
    "states",
  )} and experienced ${metrics.starsExperienced} Michelin ${plural(
    metrics.starsExperienced,
    "star",
    "stars",
  )}.`;

  return (
    <div className="space-y-12">
      <DeviceSaveNotice />

      <section className="rounded-[var(--radius-lg)] border border-border bg-surface-soft px-6 py-8 sm:px-8">
        <p className="font-sans text-xs uppercase tracking-[0.18em] text-ink-muted">
          Your journey
        </p>
        <p className="mt-3 max-w-3xl font-display text-2xl leading-snug text-ink sm:text-3xl">
          {metrics.restaurantsVisited > 0
            ? progressStatement
            : `You have ${metrics.savedRestaurants} saved ${plural(
                metrics.savedRestaurants,
                "restaurant",
                "restaurants",
              )} waiting for the next table.`}
        </p>
        <div className="mt-6 flex flex-wrap gap-6 font-sans text-sm text-ink-secondary">
          <span>{metrics.savedRestaurants} saved</span>
          <span>{metrics.citiesExplored} cities</span>
          <span>{metrics.cuisinesTried} cuisines</span>
          <span>{metrics.threeStarVisited} three-star visits</span>
          <span>{collections.length} collections</span>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/map?visited=1"
            className="inline-flex min-h-11 items-center rounded-[var(--radius-md)] bg-forest px-5 font-sans text-sm font-medium text-white no-underline hover:bg-forest-deep"
          >
            Open personal map
          </Link>
          <Link
            href="/explore"
            className="inline-flex min-h-11 items-center rounded-[var(--radius-md)] border border-border bg-bg px-5 font-sans text-sm text-ink no-underline hover:border-forest"
          >
            Discover more
          </Link>
        </div>
      </section>

      {visitedRestaurants.length > 0 ? (
        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-display text-2xl text-ink sm:text-3xl">
              Recently visited
            </h2>
            <Link
              href="/visited"
              className="font-sans text-sm text-forest no-underline hover:underline"
            >
              View all visited
            </Link>
          </div>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visitedRestaurants.slice(0, 3).map(({ restaurant }) => (
              <li key={restaurant.slug}>
                <RestaurantDiscoveryCard
                  restaurant={restaurant}
                  surface="visited"
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {savedRestaurants.length > 0 ? (
        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-display text-2xl text-ink sm:text-3xl">
              Saved next
            </h2>
            <Link
              href="/saved"
              className="font-sans text-sm text-forest no-underline hover:underline"
            >
              View all saved
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-border rounded-[var(--radius-lg)] border border-border px-4 sm:px-5">
            {savedRestaurants.map((restaurant) => (
              <li key={restaurant.slug}>
                <RestaurantCompactCard
                  restaurant={restaurant}
                  surface="saved"
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {plannedRestaurants.length > 0 ? (
        <section>
          <h2 className="font-display text-2xl text-ink sm:text-3xl">
            Planned restaurants
          </h2>
          <p className="mt-2 max-w-2xl font-sans text-sm text-ink-muted">
            Outbound booking links for places you marked planned. Opening a link
            does not mark the meal visited.
          </p>
          <ul className="mt-4 divide-y divide-border rounded-[var(--radius-lg)] border border-border px-4 sm:px-5">
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

      {(stateProgress.length > 0 || cuisineProgress.length > 0) && (
        <section className="grid gap-8 lg:grid-cols-2">
          {stateProgress.length > 0 ? (
            <div>
              <h2 className="font-display text-2xl text-ink">State progress</h2>
              <ul className="mt-4 space-y-3">
                {stateProgress.map((item) => (
                  <li key={item.label}>
                    <div className="flex justify-between gap-3 font-sans text-sm">
                      <span className="text-ink">{item.label}</span>
                      <span className="text-ink-muted">
                        {item.count} visited
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-forest"
                        style={{
                          width: `${Math.min(
                            100,
                            (item.count /
                              Math.max(metrics.restaurantsVisited, 1)) *
                              100,
                          )}%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {cuisineProgress.length > 0 ? (
            <div>
              <h2 className="font-display text-2xl text-ink">
                Cuisine progress
              </h2>
              <ul className="mt-4 space-y-3">
                {cuisineProgress.map((item) => (
                  <li key={item.label}>
                    <div className="flex justify-between gap-3 font-sans text-sm">
                      <span className="text-ink">{item.label}</span>
                      <span className="text-ink-muted">
                        {item.count} visited
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-gold"
                        style={{
                          width: `${Math.min(
                            100,
                            (item.count /
                              Math.max(metrics.restaurantsVisited, 1)) *
                              100,
                          )}%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      )}

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-2xl text-ink sm:text-3xl">
            Collections
          </h2>
          <Link
            href="/collections"
            className="font-sans text-sm text-forest no-underline hover:underline"
          >
            Manage collections
          </Link>
        </div>
        {collections.length === 0 ? (
          <p className="mt-4 font-sans text-sm text-ink-muted">
            No collections yet. Create one to curate a private shortlist.
          </p>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {collections.map((collection) => {
              const cover = collection.coverRestaurantSlug
                ? bySlug.get(collection.coverRestaurantSlug)
                : bySlug.get(collection.restaurantSlugs[0] ?? "");
              return (
                <li key={collection.id}>
                  <Link
                    href={`/collections/${collection.slug}`}
                    className="flex gap-4 rounded-[var(--radius-lg)] border border-border p-4 no-underline transition-colors hover:border-forest"
                  >
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[var(--radius-md)] bg-forest">
                      {cover ? (
                        <span className="flex h-full items-end p-2 font-display text-lg text-white">
                          {cover.name.slice(0, 1)}
                        </span>
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="font-display text-xl text-ink">
                        {collection.name}
                      </p>
                      <p className="mt-1 font-sans text-sm text-ink-muted">
                        {collection.restaurantSlugs.length}{" "}
                        {plural(
                          collection.restaurantSlugs.length,
                          "restaurant",
                          "restaurants",
                        )}
                      </p>
                      {collection.description ? (
                        <p className="mt-2 line-clamp-2 font-sans text-sm text-ink-secondary">
                          {collection.description}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {metrics.visitsByYear.length > 0 ? (
        <section>
          <h2 className="font-display text-2xl text-ink sm:text-3xl">
            Yearly activity
          </h2>
          <ul className="mt-4 space-y-2">
            {metrics.visitsByYear.map((entry) => (
              <li
                key={entry.year}
                className="flex items-center justify-between border-b border-border py-3 font-sans text-sm"
              >
                <span className="text-ink">{entry.year}</span>
                <span className="text-ink-muted">
                  {entry.count} {plural(entry.count, "visit", "visits")}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Link
          href="/saved"
          className="inline-flex min-h-11 items-center rounded-[var(--radius-md)] border border-border px-5 font-sans text-sm text-ink no-underline hover:border-forest"
        >
          Saved
        </Link>
        <Link
          href="/visited"
          className="inline-flex min-h-11 items-center rounded-[var(--radius-md)] border border-border px-5 font-sans text-sm text-ink no-underline hover:border-forest"
        >
          Visited
        </Link>
        <Link
          href="/collections"
          className="inline-flex min-h-11 items-center rounded-[var(--radius-md)] border border-border px-5 font-sans text-sm text-ink no-underline hover:border-forest"
        >
          Collections
        </Link>
      </div>

      <PassportSettings
        open={settingsOpen}
        onToggle={() => setSettingsOpen((value) => !value)}
        mode={mode}
        exportJson={exportJson}
        importJson={importJson}
        clearAll={clearAll}
      />
    </div>
  );
}

function PassportSettings({
  open,
  onToggle,
  mode,
  exportJson,
  importJson,
  clearAll,
}: {
  open: boolean;
  onToggle: () => void;
  mode: "local" | "cloud";
  exportJson: () => string;
  importJson: (raw: string) => void;
  clearAll: () => void;
}) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-border">
      <button
        type="button"
        className="flex min-h-14 w-full items-center justify-between px-5 text-left font-sans text-sm text-ink"
        aria-expanded={open}
        onClick={onToggle}
      >
        <span>Passport settings &amp; device backup</span>
        <span className="text-ink-muted">{open ? "Hide" : "Show"}</span>
      </button>
      {open ? (
        <div className="space-y-4 border-t border-border px-5 py-5">
          <p className="font-sans text-sm text-ink-muted">
            {mode === "cloud"
              ? "Your signed-in Passport syncs to your account. Export remains available as a personal backup copy."
              : "Import, export, and clear apply to Passport data saved in this browser."}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="secondary"
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
              Export data
            </Button>
            <label className="inline-flex min-h-11 cursor-pointer items-center rounded-[var(--radius-md)] border border-border bg-bg px-5 font-sans text-[15px] font-medium text-ink hover:border-ink/30">
              Import data
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
            {mode === "local" ? (
              <Button
                type="button"
                variant="ghost"
                className="text-burgundy"
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
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
