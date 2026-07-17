"use client";

import { SearchInput } from "@/components/stitch/SearchInput";
import type { MapQuery } from "@/lib/map/query";

type MapSearchProps = {
  query: MapQuery;
  onQueryChange: (q: string) => void;
};

export function MapSearch({ query, onQueryChange }: MapSearchProps) {
  return (
    <form
      role="search"
      className="mb-4"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <SearchInput
        value={query.q}
        onChange={(event) => onQueryChange(event.target.value)}
        label="Search restaurants on map"
        placeholder="Search restaurants or locations…"
        autoComplete="off"
        className="rounded-[var(--dp-radius-lg)] bg-dp-surface-low"
      />
    </form>
  );
}
