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
import { SaveRestaurantButton } from "@/components/restaurant/SaveRestaurantButton";
import { MapSelectedGooglePlace } from "@/components/google-places/MapSelectedGooglePlace";
import { getApprovedGooglePlaceId } from "@/lib/google-places/place-ids";
import { getRestaurantReservation } from "@/lib/reservations/data";
import { usePassport } from "@/lib/passport/PassportProvider";

const MapCanvas = dynamic(
  () => import("./MapCanvas").then((mod) => mod.MapCanvas),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-full min-h-[20rem] items-center justify-center bg-surface-soft font-sans text-sm text-ink-muted"
        role="status"
      >
        Loading map…
      </div>
    ),
  },
);

const chipClass =
  "inline-flex min-h-11 items-center rounded-full border border-border bg-bg px-3 font-sans text-sm text-ink shadow-[var(--shadow-float)] transition-colors hover:border-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest";

const chipActiveClass =
  "inline-flex min-h-11 items-center rounded-full border border-forest bg-forest px-3 font-sans text-sm text-white shadow-[var(--shadow-float)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest";

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
  const [sheetExpanded, setSheetExpanded] = useState(false);
  /** Desktop selected panel is CSS-hidden on mobile — do not mount Google there. */
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);
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

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktopViewport(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

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
  const selectedGooglePlaceId = selected
    ? getApprovedGooglePlaceId(selected.slug)
    : null;

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
    <div className="relative flex h-full min-h-0 flex-col bg-bg lg:flex-row">
      {/* Desktop: 420px list LEFT · Mobile: full-width when list panel */}
      <aside
        className={`z-20 flex w-full flex-col border-border bg-bg lg:w-[420px] lg:shrink-0 lg:border-r ${
          query.panel === "map" ? "hidden lg:flex" : "flex min-h-0 flex-1"
        }`}
      >
        <div className="space-y-3 border-b border-border p-4">
          <div className="flex items-center justify-between gap-2">
            <h1 className="font-display text-2xl text-ink">Map</h1>
            <p className="font-sans text-sm text-ink-muted" aria-live="polite">
              {resultCountLabel}
              {isPending ? " · updating" : ""}
            </p>
          </div>
          <input
            className="min-h-11 w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 font-sans text-sm text-ink outline-none focus-visible:border-forest"
            value={query.q}
            onChange={(event) => updateQuery({ q: event.target.value })}
            placeholder="Search name, city, cuisine…"
            aria-label="Search restaurants on map"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              className="min-h-11 rounded-[var(--radius-md)] border border-border bg-bg px-2 font-sans text-sm"
              value={query.state}
              onChange={(event) => updateQuery({ state: event.target.value })}
              aria-label="State"
            >
              <option value="">State</option>
              {facetOptions.states.map((state) => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </select>
            <select
              className="min-h-11 rounded-[var(--radius-md)] border border-border bg-bg px-2 font-sans text-sm"
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
              aria-label="Michelin stars"
            >
              <option value="">Stars</option>
              <option value="1">1 Michelin Star</option>
              <option value="2">2 Michelin Stars</option>
              <option value="3">3 Michelin Stars</option>
            </select>
            <select
              className="col-span-2 min-h-11 rounded-[var(--radius-md)] border border-border bg-bg px-2 font-sans text-sm"
              value={query.cuisine}
              onChange={(event) => updateQuery({ cuisine: event.target.value })}
              aria-label="Cuisine"
            >
              <option value="">Cuisine</option>
              {facetOptions.cuisines.map((cuisine) => (
                <option key={cuisine.value} value={cuisine.value}>
                  {cuisine.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={query.savedOnly ? chipActiveClass : chipClass}
              aria-pressed={query.savedOnly}
              onClick={() => updateQuery({ savedOnly: !query.savedOnly })}
            >
              Saved
            </button>
            <button
              type="button"
              className={query.visitedOnly ? chipActiveClass : chipClass}
              aria-pressed={query.visitedOnly}
              onClick={() => updateQuery({ visitedOnly: !query.visitedOnly })}
            >
              Visited
            </button>
          </div>
        </div>

        <ul
          ref={listRef}
          className="min-h-0 flex-1 divide-y divide-border overflow-y-auto"
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
                  isSelected ? "bg-surface-soft" : "hover:bg-surface-soft/70"
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
                    {"★".repeat(restaurant.stars)} · {restaurant.cuisine} ·{" "}
                    {restaurant.city}, {restaurant.stateCode}
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
                    className="rounded-[var(--radius-md)]"
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

        {selected && isDesktopViewport ? (
          <div className="border-t border-border p-4">
            <p className="font-display text-xl text-ink">{selected.name}</p>
            <p className="mt-1 font-sans text-sm text-ink-muted">
              {"★".repeat(selected.stars)} · {selected.cuisine} · {selected.city}
              , {selected.stateCode}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <ReservationButton
                restaurant={selected}
                reservation={getRestaurantReservation(selected.slug)}
                surface="map_marker"
                variant="full"
                showProvider={false}
                className="rounded-[var(--radius-md)]"
              />
              <SaveRestaurantButton restaurantSlug={selected.slug} />
              <Link
                href={`/restaurants/${selected.slug}`}
                className="inline-flex min-h-11 items-center font-sans text-sm text-forest no-underline hover:text-forest-deep"
              >
                Open page
              </Link>
            </div>
            <MapSelectedGooglePlace
              restaurantSlug={selected.slug}
              placeId={selectedGooglePlaceId}
              enabled
            />
          </div>
        ) : null}
      </aside>

      {/* Map RIGHT (desktop) / full screen (mobile) */}
      <div
        className={`relative min-h-0 min-w-0 flex-1 ${
          query.panel === "list" ? "hidden lg:block" : "block"
        }`}
      >
        <div className="absolute inset-0">
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

        <div
          className="absolute left-3 right-3 top-3 z-10 flex flex-wrap gap-2 lg:left-auto lg:right-4 lg:max-w-md lg:justify-end"
          role="toolbar"
          aria-label="Map controls"
        >
          <button
            type="button"
            className={`${chipClass} lg:hidden`}
            aria-pressed={query.panel === "list"}
            onClick={() =>
              updateQuery({ panel: query.panel === "list" ? "map" : "list" })
            }
          >
            {query.panel === "list" ? "Map" : "List"}
          </button>
          <button
            type="button"
            className={chipClass}
            onClick={() => {
              baselineBoundsRef.current = null;
              setFitToken((value) => value + 1);
            }}
          >
            Fit
          </button>
          <button
            type="button"
            className={chipClass}
            onClick={() => {
              setSearchedBounds(null);
              baselineBoundsRef.current = null;
              setShowSearchArea(false);
              setSelectedSlug(null);
              setFitToken((value) => value + 1);
            }}
          >
            Reset
          </button>
          {searchedBounds ? (
            <button
              type="button"
              className={chipClass}
              onClick={() => {
                setSearchedBounds(null);
                setShowSearchArea(false);
              }}
            >
              Clear area
            </button>
          ) : null}
        </div>

        {showSearchArea && currentBounds ? (
          <div className="absolute bottom-24 left-1/2 z-10 -translate-x-1/2 lg:bottom-8">
            <button
              type="button"
              className="min-h-11 rounded-full border border-forest bg-bg px-5 font-sans text-sm font-medium text-forest shadow-[var(--shadow-float)]"
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

        {mapFailed ? (
          <p
            className="absolute bottom-4 left-4 right-4 rounded-[var(--radius-md)] bg-bg/95 p-3 font-sans text-sm text-ink-muted shadow-[var(--shadow-float)]"
            role="status"
          >
            Map tiles failed to load. Use the result list to browse restaurants.
          </p>
        ) : (
          <p className="pointer-events-none absolute bottom-2 left-3 hidden font-sans text-[10px] text-ink-muted lg:block">
            {mapConfig.providerName} · {mapConfig.attribution}
          </p>
        )}
      </div>

      {/* Mobile bottom sheet preview */}
      {selected && query.panel !== "list" ? (
        <div
          className="fixed inset-x-0 bottom-0 z-30 rounded-t-[var(--radius-lg)] border-t border-border bg-bg shadow-[var(--shadow-float)] lg:hidden"
          style={
            {
              paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
            } as CSSProperties
          }
          role="dialog"
          aria-label="Selected restaurant preview"
        >
          <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-border" aria-hidden="true" />
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
                className="min-h-11 min-w-11 rounded-[var(--radius-md)] border border-border px-2 font-sans text-sm disabled:opacity-40"
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
                className="min-h-11 min-w-11 rounded-[var(--radius-md)] border border-border px-2 font-sans text-sm disabled:opacity-40"
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
                className="min-h-11 rounded-[var(--radius-md)] border border-border px-3 font-sans text-sm"
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
              {"★".repeat(selected.stars)} · {selected.cuisine} · {selected.city}
              , {selected.stateCode}
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
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <ReservationButton
                restaurant={selected}
                reservation={getRestaurantReservation(selected.slug)}
                surface="map_mobile_sheet"
                variant="full"
                showProvider={false}
                className="rounded-[var(--radius-md)]"
              />
              <SaveRestaurantButton restaurantSlug={selected.slug} />
              <Link
                href={`/restaurants/${selected.slug}`}
                className="inline-flex min-h-11 items-center rounded-[var(--radius-md)] border border-border px-4 font-sans text-sm text-ink no-underline"
              >
                Open page
              </Link>
            </div>
            {sheetExpanded ? (
              <MapSelectedGooglePlace
                restaurantSlug={selected.slug}
                placeId={selectedGooglePlaceId}
                enabled
              />
            ) : null}
          </div>
        </div>
      ) : null}

      <span className="sr-only" data-pathname={pathname}>
        Map route
      </span>
    </div>
  );
}
