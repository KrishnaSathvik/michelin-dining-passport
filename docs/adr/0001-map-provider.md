# ADR 0001 — Map provider for `/map`

**Status:** Accepted  
**Date:** 2026-07-16  
**Phase:** 5 — Geocoding and map

## Context

The product needs an interactive United States map of Michelin-starred restaurants with marker clustering, list synchronization, filter parity with Explore, saved/visited overlays, and mobile bottom-sheet UX. Geocoding is a separate batch process; coordinates will be stored in first-party data.

Candidates compared:

1. MapLibre GL JS + compatible tile provider (e.g. MapTiler, OpenFreeMap, self-hosted tiles)
2. Mapbox GL JS / Mapbox GL
3. Google Maps JavaScript API

Decision criteria: cost, licensing, Places-data compatibility, clustering, React/Next.js integration, mobile performance, attribution requirements, and long-term international expansion.

## Comparison

| Criterion | MapLibre + tiles | Mapbox | Google Maps |
| --- | --- | --- | --- |
| Cost | Tile usage fees or free community tiles; no Mapbox/Google SDK tax | Free tier then MAU/map-load pricing; can grow quickly with consumer traffic | Pay-as-you-go map loads; usually highest at scale |
| Licensing | BSD MapLibre; tile ToS vary by provider | Proprietary SDK + strict ToS | Proprietary SDK + strict ToS |
| Places compatibility | Neutral — we store our own coords; Places not required for Phase 5 | Strong Places/Search ecosystem, but we intentionally avoid Places-driven discovery | Best Places integration; conflicts with “no Google Places dependency for discovery” product stance |
| Clustering | Mature via `supercluster` / MapLibre cluster layers | Built-in / well documented | MarkerClusterer libraries available |
| React / Next.js | `react-map-gl` (MapLibre mapLib) works well with App Router client islands | Same `react-map-gl` path with Mapbox token | `@react-google-maps/api` or newer loaders; heavier Google loader surface |
| Mobile performance | Excellent WebGL performance when tile style is lean | Excellent | Good; script + billing complexity higher |
| Attribution | Required for OSM-derived tiles and style authors | Required Mapbox attribution | Required Google attribution |
| International expansion | Tile providers and OSM coverage are global; no Google/Mapbox lock-in | Global, but pricing and ToS lock-in | Global, strongest Places data later if ever needed |

## Decision

**Use MapLibre GL JS with a compatible vector tile provider, rendered through `react-map-gl`.**

Rationale:

- Keeps discovery independent of Google Places and Mapbox proprietary lock-in.
- Matches the architecture note preferring MapLibre/Mapbox over Google until Places is truly required.
- Clustering, filters, and custom restaurant markers are first-party data problems — not Places problems.
- Cost stays predictable: we pay for tiles (or use a free/community source in development) rather than per-map-load SaaS that scales with curiosity traffic.
- International expansion later does not require rewriting the map stack.

**Default tile path for implementation:**

- Development: MapLibre demo style or an explicitly attributed free/community style.
- Production: a commercial MapLibre-compatible provider (MapTiler or equivalent) behind `NEXT_PUBLIC_MAP_STYLE_URL` / API key env vars.

## Consequences

- Geocoding remains a **batch offline job** writing approved `latitude` / `longitude` into first-party data. The map never geocodes on page load.
- Attribution UI must be visible and correct for the chosen tiles.
- If a future phase truly needs Google Places enrichment, it can be added as a separate data pipeline without replacing the MapLibre map shell.
- Mapbox remains a fallback if a specific Mapbox-only style/product becomes mandatory; migration cost is moderate because both speak MapLibre-compatible GL concepts.

## Non-goals for this ADR

- Choosing a geocoder (Nominatim, MapTiler Geocoding, Google Geocoding, etc.) — separate follow-up ADR if needed.
- Final production tile vendor contract — env-configurable.
