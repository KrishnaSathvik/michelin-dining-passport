"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  useTransition,
  type CSSProperties,
} from "react";
import type { MapBounds } from "@/config/map";
import { mapConfig } from "@/config/map";
import {
  filterRestaurants,
  type ExploreQuery,
} from "@/lib/data/explore";
import type { MapRestaurant, MappableRestaurant } from "@/lib/data/geocodes";
import { restaurantInBounds } from "@/lib/data/geocodes";
import {
  boundsMeaningfullyDifferent,
  buildMapHref,
  parseMapSearchParams,
  type MapQuery,
} from "@/lib/map/query";
import { ReservationButton } from "@/components/restaurant/ReservationButton";
import { getRestaurantReservation } from "@/lib/reservations/data";
import { usePassport } from "@/lib/passport/PassportProvider";

const MapCanvas = dynamic(
  () => import("./MapCanvas").then((mod) => mod.MapCanvas),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-full min-h-[20rem] items-center justify-center border border-border bg-bg-elevated font-sans text-sm text-ink-muted"
        role="status"
      >
        Loading map…
      </div>
    ),
  },
);

type RestaurantMapProps = {
  restaurants: MapRestaurant[];
  initialQuery?: Record<string, string | string[] | undefined>;
  facetOptions: {
    states: Array<{ value: string; label: string }>;
    cuisines: Array<{ value: string; label: string }>;
  };
};

function toExploreQuery(query: MapQuery): ExploreQuery {
  return {
    q: query.q,
    stars: query.stars,
    state: query.state,
    city: query.city,
    cuisine: query.cuisine,
    price: query.price,
    sort: query.sort,
    view: query.view,
    page: query.page,
  };
}

export function RestaurantMap({
  restaurants,
  initialQuery = {},
  facetOptions,
}: RestaurantMapProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { ready, store } = usePassport();
  const [isPending, startTransition] = useTransition();
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<Record<string, HTMLLIElement | null>>({});

  const [query, setQuery] = useState<MapQuery>(() =>
    parseMapSearchParams(initialQuery),
  );
  const [selectedSlug, setSelectedSlug] = useState<string | null>(
    () => parseMapSearchParams(initialQuery).selected || null,
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [showSearchArea, setShowSearchArea] = useState(false);
  const [currentBounds, setCurrentBounds] = useState<MapBounds | null>(null);
  const [searchedBounds, setSearchedBounds] = useState<MapBounds | null>(
    () => parseMapSearchParams(initialQuery).bounds,
  );
  const baselineBoundsRef = useRef<MapBounds | null>(null);
  const [fitToken, setFitToken] = useState(0);
  const [flyToSlug, setFlyToSlug] = useState<string | null>(null);
  const [mapFailed, setMapFailed] = useState(false);

  const syncUrl = useEffectEvent((next: MapQuery) => {
    const href = buildMapHref(next);
    startTransition(() => {
      router.replace(href, { scroll: false });
    });
  });

  useEffect(() => {
    syncUrl({
      ...query,
      selected: selectedSlug ?? "",
      bounds: searchedBounds,
    });
  }, [query, selectedSlug, searchedBounds]);

  const filtered = useMemo(() => {
    let items = filterRestaurants(
      restaurants,
      toExploreQuery(query),
    ) as MapRestaurant[];

    items = items.filter((item) => {
      if (!ready) return true;
      const record = store.userRestaurants[item.slug];
      if (query.savedOnly && !record?.saved) return false;
      if (query.visitedOnly && !record?.visited) return false;
      return true;
    });

    if (searchedBounds) {
      items = items.filter((item) => restaurantInBounds(item, searchedBounds));
    }

    return items;
  }, [query, ready, restaurants, searchedBounds, store.userRestaurants]);

  const mappableFiltered = useMemo(
    () =>
      filtered.filter(
        (item): item is MappableRestaurant => item.hasApprovedCoordinates,
      ),
    [filtered],
  );

  const selected =
    filtered.find((item) => item.slug === selectedSlug) ?? null;

  const selectedIndex = selected
    ? filtered.findIndex((item) => item.slug === selected.slug)
    : -1;

  useEffect(() => {
    if (!selectedSlug) return;
    const node = itemRefs.current[selectedSlug];
    node?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedSlug]);

  const handleBoundsChange = (bounds: MapBounds) => {
    setCurrentBounds(bounds);
    if (!baselineBoundsRef.current) {
      baselineBoundsRef.current = bounds;
      setShowSearchArea(false);
      return;
    }
    const reference = searchedBounds ?? baselineBoundsRef.current;
    setShowSearchArea(boundsMeaningfullyDifferent(bounds, reference, 0.02));
  };

  const updateQuery = (patch: Partial<MapQuery>) => {
    setQuery((prev) => ({ ...prev, ...patch }));
  };

  const selectRestaurant = (slug: string | null, opts?: { fly?: boolean }) => {
    setSelectedSlug(slug);
    if (slug && opts?.fly !== false) {
      const target = mappableFiltered.find((item) => item.slug === slug);
      if (target) setFlyToSlug(slug);
    }
    if (slug) setSheetExpanded(true);
  };

  const resultCountLabel = `${filtered.length} restaurant${filtered.length === 1 ? "" : "s"}`;

  return (
    <div className="space-y-3">
      <div
        className="flex flex-wrap items-center gap-2 font-sans text-sm"
        role="toolbar"
        aria-label="Map filters and controls"
      >
        <button
          type="button"
          className="inline-flex min-h-11 items-center border border-border px-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest lg:hidden"
          aria-expanded={filterOpen}
          onClick={() => setFilterOpen((value) => !value)}
        >
          Filters
        </button>
        <button
          type="button"
          className={`inline-flex min-h-11 items-center border px-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest lg:hidden ${
            query.panel === "list"
              ? "border-forest bg-forest text-bg-elevated"
              : "border-border"
          }`}
          aria-pressed={query.panel === "list"}
          onClick={() =>
            updateQuery({ panel: query.panel === "list" ? "map" : "list" })
          }
        >
          {query.panel === "list" ? "Show map" : "Show list"}
        </button>
        <button
          type="button"
          className={`inline-flex min-h-11 items-center border px-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest ${
            query.savedOnly
              ? "border-forest bg-forest text-bg-elevated"
              : "border-border"
          }`}
          aria-pressed={query.savedOnly}
          onClick={() => updateQuery({ savedOnly: !query.savedOnly })}
        >
          Saved only
        </button>
        <button
          type="button"
          className={`inline-flex min-h-11 items-center border px-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest ${
            query.visitedOnly
              ? "border-forest bg-forest text-bg-elevated"
              : "border-border"
          }`}
          aria-pressed={query.visitedOnly}
          onClick={() => updateQuery({ visitedOnly: !query.visitedOnly })}
        >
          Visited only
        </button>
        <button
          type="button"
          className="inline-flex min-h-11 items-center border border-border px-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
          onClick={() => {
            baselineBoundsRef.current = null;
            setFitToken((value) => value + 1);
          }}
        >
          Fit to results
        </button>
        <button
          type="button"
          className="inline-flex min-h-11 items-center border border-border px-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
          onClick={() => {
            setSearchedBounds(null);
            baselineBoundsRef.current = null;
            setShowSearchArea(false);
            setSelectedSlug(null);
            setFitToken((value) => value + 1);
          }}
        >
          Reset map
        </button>
        {searchedBounds ? (
          <button
            type="button"
            className="inline-flex min-h-11 items-center border border-burgundy px-3 text-burgundy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
            onClick={() => {
              setSearchedBounds(null);
              setShowSearchArea(false);
            }}
          >
            Clear area search
          </button>
        ) : null}
        <p className="min-h-11 font-sans text-sm text-ink-muted" aria-live="polite">
          <span className="sr-only">Result count: </span>
          {resultCountLabel}
          {isPending ? " · updating" : ""}
          {searchedBounds ? " · current map area" : ""}
        </p>
      </div>

      <div
        className={`border border-border bg-bg-elevated p-3 lg:block ${
          filterOpen ? "block" : "hidden"
        }`}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="font-sans text-sm text-ink">
            State
            <select
              className="mt-1 min-h-11 w-full border border-border bg-bg px-2"
              value={query.state}
              onChange={(event) => updateQuery({ state: event.target.value })}
            >
              <option value="">All states</option>
              {facetOptions.states.map((state) => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </select>
          </label>
          <label className="font-sans text-sm text-ink">
            Stars
            <select
              className="mt-1 min-h-11 w-full border border-border bg-bg px-2"
              value={query.stars ?? ""}
              onChange={(event) => {
                const value = event.target.value;
                updateQuery({
                  stars:
                    value === "1" || value === "2" || value === "3"
                      ? (Number(value) as 1 | 2 | 3)
                      : null,
                });
              }}
            >
              <option value="">All stars</option>
              <option value="1">1 star</option>
              <option value="2">2 stars</option>
              <option value="3">3 stars</option>
            </select>
          </label>
          <label className="font-sans text-sm text-ink">
            Cuisine
            <select
              className="mt-1 min-h-11 w-full border border-border bg-bg px-2"
              value={query.cuisine}
              onChange={(event) => updateQuery({ cuisine: event.target.value })}
            >
              <option value="">All cuisines</option>
              {facetOptions.cuisines.map((cuisine) => (
                <option key={cuisine.value} value={cuisine.value}>
                  {cuisine.label}
                </option>
              ))}
            </select>
          </label>
          <label className="font-sans text-sm text-ink">
            Search
            <input
              className="mt-1 min-h-11 w-full border border-border bg-bg px-2"
              value={query.q}
              onChange={(event) => updateQuery({ q: event.target.value })}
              placeholder="Name, city, cuisine…"
            />
          </label>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-4">
        <div
          className={`relative ${
            query.panel === "list" ? "hidden lg:block" : "block"
          }`}
        >
          <div className="h-[min(78vh,42rem)] overflow-hidden border border-border lg:h-[min(70vh,40rem)]">
            <MapCanvas
              restaurants={mappableFiltered}
              selectedSlug={selectedSlug}
              onSelectSlug={(slug) => selectRestaurant(slug)}
              onBoundsChange={handleBoundsChange}
              onMapReady={(ready) => setMapFailed(!ready)}
              fitToken={fitToken}
              flyToSlug={flyToSlug}
            />
          </div>
          {mapFailed ? (
            <p className="mt-2 font-sans text-sm text-ink-muted" role="status">
              Map tiles failed to load. Use the result list to browse restaurants.
            </p>
          ) : null}

          {showSearchArea && currentBounds ? (
            <div className="absolute bottom-14 left-1/2 z-10 -translate-x-1/2">
              <button
                type="button"
                className="min-h-11 border border-forest bg-bg-elevated px-4 font-sans text-sm text-forest shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
                onClick={() => {
                  setSearchedBounds(currentBounds);
                  setShowSearchArea(false);
                  setSelectedSlug(null);
                }}
              >
                Search this area
              </button>
            </div>
          ) : null}

          <p className="mt-2 font-sans text-xs text-ink-muted">
            {mapConfig.providerName} · {mapConfig.attribution}
          </p>
        </div>

        <aside
          className={`border border-border bg-bg-elevated/50 ${
            query.panel === "map" ? "hidden lg:flex lg:flex-col" : "flex flex-col"
          } lg:max-h-[min(70vh,40rem)]`}
        >
          <div className="border-b border-border px-4 py-3">
            <h2 className="font-display text-xl text-ink">Results</h2>
            <p className="mt-1 font-sans text-xs text-ink-muted">
              List stays in sync with markers. Restaurants without approved
              coordinates stay in the list with location verification pending.
            </p>
          </div>
          <ul
            ref={listRef}
            className="divide-y divide-border overflow-y-auto"
            aria-label="Map restaurant results"
          >
            {filtered.map((restaurant) => {
              const isSelected = restaurant.slug === selectedSlug;
              const reservation = getRestaurantReservation(restaurant.slug);
              return (
                <li
                  key={restaurant.slug}
                  ref={(node) => {
                    itemRefs.current[restaurant.slug] = node;
                  }}
                  className={`flex items-stretch gap-2 px-3 py-2 ${
                    isSelected ? "bg-bg" : "hover:bg-bg"
                  }`}
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 px-1 py-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-forest"
                    aria-current={isSelected ? "true" : undefined}
                    onClick={() => {
                      selectRestaurant(restaurant.slug);
                      updateQuery({ panel: "map" });
                    }}
                  >
                    <span className="font-display text-lg text-ink">
                      {restaurant.name}
                    </span>
                    <span className="mt-1 block font-sans text-xs text-ink-muted">
                      {restaurant.city}, {restaurant.stateCode} ·{" "}
                      {restaurant.stars}★ · {restaurant.cuisine}
                    </span>
                    {restaurant.locationPending ? (
                      <span className="mt-1 block font-sans text-xs text-burgundy">
                        Location verification pending
                      </span>
                    ) : null}
                  </button>
                  <div className="flex shrink-0 items-center py-1">
                    <ReservationButton
                      restaurant={restaurant}
                      reservation={reservation}
                      surface="map_list"
                      variant="compact"
                      showProvider={false}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
          {filtered.length === 0 ? (
            <p className="px-4 py-8 font-sans text-sm text-ink-muted">
              No restaurants match the current filters
              {searchedBounds ? " in this map area" : ""}. Clear filters or area
              search to broaden results.
            </p>
          ) : null}
        </aside>
      </div>

      {/* Mobile bottom sheet preview */}
      {selected ? (
        <div
          className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-bg-elevated shadow-[0_-8px_24px_rgba(0,0,0,0.08)] lg:hidden"
          style={
            {
              paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
            } as CSSProperties
          }
          role="dialog"
          aria-label="Selected restaurant preview"
        >
          <div className="flex items-center justify-between gap-2 px-3 pt-2">
            <button
              type="button"
              className="min-h-11 px-2 font-sans text-sm text-ink-muted"
              onClick={() => setSheetExpanded((value) => !value)}
              aria-expanded={sheetExpanded}
            >
              {sheetExpanded ? "Collapse" : "Expand"}
            </button>
            <div className="flex gap-1">
              <button
                type="button"
                className="min-h-11 min-w-11 border border-border px-2 font-sans text-sm disabled:opacity-40"
                disabled={selectedIndex <= 0}
                onClick={() => {
                  const prev = filtered[selectedIndex - 1];
                  if (prev) selectRestaurant(prev.slug);
                }}
                aria-label="Previous restaurant"
              >
                Prev
              </button>
              <button
                type="button"
                className="min-h-11 min-w-11 border border-border px-2 font-sans text-sm disabled:opacity-40"
                disabled={
                  selectedIndex < 0 || selectedIndex >= filtered.length - 1
                }
                onClick={() => {
                  const next = filtered[selectedIndex + 1];
                  if (next) selectRestaurant(next.slug);
                }}
                aria-label="Next restaurant"
              >
                Next
              </button>
              <button
                type="button"
                className="min-h-11 border border-border px-3 font-sans text-sm"
                onClick={() => {
                  setSelectedSlug(null);
                  setSheetExpanded(false);
                }}
              >
                Close
              </button>
            </div>
          </div>
          <div className={`px-4 pb-3 ${sheetExpanded ? "pt-2" : "pt-1"}`}>
            <p className="font-display text-2xl text-ink">{selected.name}</p>
            <p className="mt-1 font-sans text-sm text-ink-muted">
              {selected.city}, {selected.stateCode} · {selected.stars}★ ·{" "}
              {selected.cuisine}
            </p>
            {selected.locationPending ? (
              <p className="mt-2 font-sans text-xs text-burgundy">
                Location verification pending — listed without a map marker.
              </p>
            ) : null}
            {sheetExpanded ? (
              <p className="mt-2 font-sans text-sm text-ink-muted">
                {selected.address}
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <ReservationButton
                restaurant={selected}
                reservation={getRestaurantReservation(selected.slug)}
                surface="map_mobile_sheet"
                variant="full"
              />
              <Link
                href={`/restaurants/${selected.slug}`}
                className="inline-flex min-h-11 items-center border border-border px-4 font-sans text-sm text-ink"
              >
                Open restaurant page
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {/* Desktop preview */}
      {selected ? (
        <div className="hidden border border-border bg-bg-elevated p-4 lg:block">
          <p className="font-display text-2xl text-ink">{selected.name}</p>
          <p className="mt-1 font-sans text-sm text-ink-muted">
            {selected.city}, {selected.stateCode} · {selected.stars}★ ·{" "}
            {selected.cuisine}
          </p>
          {selected.locationPending ? (
            <p className="mt-2 font-sans text-xs text-burgundy">
              Location verification pending — listed without a map marker.
            </p>
          ) : (
            <p className="mt-2 font-sans text-sm text-ink-muted">
              {selected.address}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <ReservationButton
              restaurant={selected}
              reservation={getRestaurantReservation(selected.slug)}
              surface="map_marker"
              variant="full"
            />
            <Link
              href={`/restaurants/${selected.slug}`}
              className="inline-flex min-h-11 items-center text-forest underline"
            >
              Open restaurant page
            </Link>
          </div>
        </div>
      ) : null}

      {/* Keep pathname referenced so Next treats this as a navigable client island */}
      <span className="sr-only" data-pathname={pathname}>
        Map route
      </span>
    </div>
  );
}
