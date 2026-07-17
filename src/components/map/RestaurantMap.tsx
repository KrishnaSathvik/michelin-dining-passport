"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  useTransition,
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
import { getApprovedGooglePlaceId } from "@/lib/google-places/place-ids";
import { usePassport } from "@/lib/passport/PassportProvider";
import {
  MapWorkspaceView,
  buildMapActiveFilters,
  toMapRowModels,
  toMapSelectedModel,
} from "@/components/stitch/map";

const MapCanvas = dynamic(
  () => import("./MapCanvas").then((mod) => mod.MapCanvas),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-full min-h-[20rem] items-center justify-center bg-dp-soft font-sans text-sm text-dp-ink-muted"
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

/**
 * Map workspace controller — preserves URL, filters, camera, Google gates.
 * Presentation is Stitch MapWorkspaceView + MapCanvas.
 */
export function RestaurantMap({
  restaurants,
  initialQuery = {},
  facetOptions,
}: RestaurantMapProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { ready, store } = usePassport();
  const [isPending, startTransition] = useTransition();
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

  const selectedRestaurant =
    filtered.find((item) => item.slug === selectedSlug) ?? null;
  const selectedGooglePlaceId = selectedRestaurant
    ? getApprovedGooglePlaceId(selectedRestaurant.slug)
    : null;
  const selected = selectedRestaurant
    ? toMapSelectedModel(selectedRestaurant, selectedGooglePlaceId)
    : null;

  const selectedIndex = selectedRestaurant
    ? filtered.findIndex((item) => item.slug === selectedRestaurant.slug)
    : -1;

  const rows = useMemo(
    () => toMapRowModels(filtered, selectedSlug),
    [filtered, selectedSlug],
  );

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

  const clearArea = () => {
    setSearchedBounds(null);
    setShowSearchArea(false);
  };

  const clearAllFilters = () => {
    updateQuery({
      q: "",
      stars: null,
      state: "",
      city: "",
      cuisine: "",
      price: "",
      savedOnly: false,
      visitedOnly: false,
    });
    clearArea();
  };

  const fitMap = () => {
    baselineBoundsRef.current = null;
    setFitToken((value) => value + 1);
  };

  const resetMap = () => {
    setSearchedBounds(null);
    baselineBoundsRef.current = null;
    setShowSearchArea(false);
    setSelectedSlug(null);
    setSheetExpanded(false);
    setFitToken((value) => value + 1);
  };

  const activeFilters = buildMapActiveFilters(
    query,
    facetOptions,
    Boolean(searchedBounds),
    {
      clearQ: () => updateQuery({ q: "" }),
      clearStars: () => updateQuery({ stars: null }),
      clearState: () => updateQuery({ state: "", city: "" }),
      clearCuisine: () => updateQuery({ cuisine: "" }),
      clearSaved: () => updateQuery({ savedOnly: false }),
      clearVisited: () => updateQuery({ visitedOnly: false }),
      clearArea,
    },
  );

  const resultCountLabel = `${filtered.length} restaurant${filtered.length === 1 ? "" : "s"}`;

  return (
    <>
      <MapWorkspaceView
        query={query}
        facets={facetOptions}
        rows={rows}
        resultCountLabel={resultCountLabel}
        isPending={isPending}
        activeFilters={activeFilters}
        selected={selected}
        selectedIndex={selectedIndex}
        totalFiltered={filtered.length}
        showSearchArea={Boolean(showSearchArea && currentBounds)}
        hasAreaFilter={Boolean(searchedBounds)}
        mapFailed={mapFailed}
        isDesktopViewport={isDesktopViewport}
        sheetExpanded={sheetExpanded}
        attribution={mapConfig.attribution}
        providerName={mapConfig.providerName}
        listRef={listRef}
        itemRefs={itemRefs}
        mapStage={
          <MapCanvas
            restaurants={mappableFiltered}
            selectedSlug={selectedSlug}
            onSelectSlug={(slug) => selectRestaurant(slug)}
            onBoundsChange={handleBoundsChange}
            onMapReady={(readyState) => setMapFailed(!readyState)}
            fitToken={fitToken}
            flyToSlug={flyToSlug}
          />
        }
        onQueryChange={(q) => updateQuery({ q })}
        onFilterChange={updateQuery}
        onSelect={(slug) => {
          selectRestaurant(slug);
          updateQuery({ panel: "map" });
        }}
        onClearAllFilters={clearAllFilters}
        onFit={fitMap}
        onReset={resetMap}
        onClearArea={clearArea}
        onSearchThisArea={() => {
          if (!currentBounds) return;
          setSearchedBounds(currentBounds);
          setShowSearchArea(false);
          setSelectedSlug(null);
        }}
        onTogglePanel={() =>
          updateQuery({ panel: query.panel === "list" ? "map" : "list" })
        }
        onToggleSheetExpanded={() => setSheetExpanded((value) => !value)}
        onSheetPrevious={() => {
          const prev = filtered[selectedIndex - 1];
          if (prev) selectRestaurant(prev.slug);
        }}
        onSheetNext={() => {
          const next = filtered[selectedIndex + 1];
          if (next) selectRestaurant(next.slug);
        }}
        onSheetClose={() => {
          setSelectedSlug(null);
          setSheetExpanded(false);
        }}
      />
      <span className="sr-only" data-pathname={pathname}>
        Map route
      </span>
    </>
  );
}
