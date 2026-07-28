"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MapRestaurant } from "@/lib/data/geocodes";

type MapSearchBoxProps = {
  /** Only restaurants that can actually be flown to (have coordinates). */
  restaurants: MapRestaurant[];
  onSelect: (slug: string) => void;
};

/**
 * Floating search over restaurant names on the map. Selecting a result flies
 * to that pin and opens its preview card (handled by the caller).
 */
export function MapSearchBox({ restaurants, onSelect }: MapSearchBoxProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return restaurants
      .filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.city.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [query, restaurants]);

  // Close when clicking outside.
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open]);

  const choose = (slug: string, name: string) => {
    onSelect(slug);
    setQuery(name);
    setOpen(false);
  };

  const showList = open && results.length > 0;

  return (
    <div
      ref={containerRef}
      className="pointer-events-auto absolute left-1/2 top-4 z-30 w-[min(92vw,28rem)] -translate-x-1/2"
      data-map-search
    >
      <div className="relative">
        <span
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-dp-ink-muted"
          aria-hidden
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M20 20l-3.5-3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <input
          type="text"
          role="combobox"
          aria-expanded={showList}
          aria-controls="map-search-listbox"
          aria-autocomplete="list"
          aria-label="Search restaurants by name"
          placeholder="Search restaurants…"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setActiveIndex(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (results.length === 0) return;
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((i) => Math.min(i + 1, results.length - 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((i) => Math.max(i - 1, 0));
            } else if (event.key === "Enter") {
              event.preventDefault();
              const item = results[activeIndex];
              if (item) choose(item.slug, item.name);
            } else if (event.key === "Escape") {
              setOpen(false);
            }
          }}
          className="h-12 w-full rounded-full border border-dp-outline-variant bg-dp-surface pl-11 pr-10 font-sans text-[15px] text-dp-ink shadow-[0_8px_28px_rgba(0,0,0,0.16)] outline-none transition-colors placeholder:text-dp-ink-muted focus:border-dp-primary"
        />
        {query ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
            className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-dp-ink-muted transition-colors hover:bg-dp-soft hover:text-dp-primary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        ) : null}
      </div>

      {showList ? (
        <ul
          id="map-search-listbox"
          role="listbox"
          aria-label="Restaurant search results"
          className="mt-2 max-h-[min(60vh,20rem)] overflow-auto rounded-[var(--dp-radius-lg)] border border-dp-outline-variant bg-dp-surface py-1 shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
        >
          {results.map((item, index) => (
            <li key={item.slug} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                // Prevent the input blur (which closes the list) from firing before the click.
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(item.slug, item.name)}
                className={`flex w-full items-baseline justify-between gap-3 px-4 py-2.5 text-left transition-colors ${
                  index === activeIndex ? "bg-dp-soft" : "hover:bg-dp-soft"
                }`}
              >
                <span className="truncate font-sans text-[14px] text-dp-ink">
                  {item.name}
                </span>
                <span className="shrink-0 font-sans text-[12px] text-dp-ink-muted">
                  {item.city}, {item.stateCode}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
