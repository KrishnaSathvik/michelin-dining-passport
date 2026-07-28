"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MichelinDistinction } from "@/components/stitch/MichelinDistinction";
import {
  GLOBAL_SEARCH_MIN_QUERY,
  type GlobalSearchResults,
} from "@/lib/data/search";

type GlobalSearchDialogProps = {
  open: boolean;
  onClose: () => void;
};

const DEBOUNCE_MS = 160;

const EMPTY_RESULTS: GlobalSearchResults = {
  query: "",
  tooShort: true,
  restaurants: [],
  refinements: [],
  totalRestaurants: 0,
  exploreHref: "/explore",
};

type Option = { id: string; href: string };

/**
 * Header global search.
 *
 * Results are fetched from /api/search so the client never loads the full
 * catalog, and every "see everything" destination is an Explore URL so the
 * Explore query contract stays the only place search semantics live.
 *
 * This outer component is a mount gate: keeping the stateful panel unmounted
 * while closed means every open starts from a clean query.
 */
export function GlobalSearchDialog({ open, onClose }: GlobalSearchDialogProps) {
  if (!open) return null;
  return <GlobalSearchPanel onClose={onClose} />;
}

function GlobalSearchPanel({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const baseId = useId();
  const listboxId = `${baseId}-listbox`;
  const inputId = `${baseId}-input`;

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GlobalSearchResults>(EMPTY_RESULTS);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const trimmed = query.trim();
  const searchable = trimmed.length >= GLOBAL_SEARCH_MIN_QUERY;
  /** Results are only trustworthy once they describe the current query. */
  const settled = searchable && results.query === trimmed;

  const visible = settled ? results : EMPTY_RESULTS;
  const showEmptyState =
    settled &&
    results.restaurants.length === 0 &&
    results.refinements.length === 0;

  const options: Option[] = [
    ...visible.restaurants.map((restaurant) => ({
      id: `r-${restaurant.slug}`,
      href: restaurant.href,
    })),
    ...visible.refinements.map((refinement) => ({
      id: `f-${refinement.key}`,
      href: refinement.href,
    })),
  ];

  // Fetch results for the current query. Every setState here runs inside an
  // async callback, never synchronously in the effect body.
  useEffect(() => {
    if (trimmed.length < GLOBAL_SEARCH_MIN_QUERY) return;

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
        signal: controller.signal,
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((data: GlobalSearchResults | null) => {
          if (!data) return;
          setResults(data);
          setActiveIndex(-1);
        })
        .catch(() => {
          /* aborted or offline — the previous preview stays on screen */
        });
    }, DEBOUNCE_MS);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [trimmed]);

  const go = useCallback(
    (href: string) => {
      onClose();
      router.push(href);
    },
    [onClose, router],
  );

  const exploreHref =
    trimmed.length >= GLOBAL_SEARCH_MIN_QUERY
      ? `/explore?q=${encodeURIComponent(trimmed)}`
      : "/explore";

  // Focus management, scroll lock, and background inerting.
  useEffect(() => {
    returnFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    inputRef.current?.focus();

    const overlay = overlayRef.current;
    const inerted = Array.from(document.body.children).filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement && element !== overlay,
    );
    const priorInert = inerted.map((element) => element.inert);
    inerted.forEach((element) => {
      element.inert = true;
    });

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      inerted.forEach((element, index) => {
        element.inert = priorInert[index];
      });
      returnFocusRef.current?.focus();
    };
  }, []);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key === "Tab") {
      const items = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          "input:not([disabled]), button:not([disabled]), a[href]",
        ) ?? [],
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
      return;
    }
    if (options.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % options.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) =>
        index <= 0 ? options.length - 1 : index - 1,
      );
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(options.length - 1);
    }
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const active = activeIndex >= 0 ? options[activeIndex] : undefined;
    go(active ? active.href : exploreHref);
  };

  const activeId = activeIndex >= 0 ? options[activeIndex]?.id : undefined;
  const hasResults = options.length > 0;

  const overlay = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[var(--z-modal-backdrop)] flex items-start justify-center overflow-x-hidden p-0 sm:p-6 sm:pt-[10vh]"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={onKeyDown}
    >
      <div className="absolute inset-0 bg-dp-ink/40" aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search restaurants"
        data-global-search-dialog
        className="relative z-[var(--z-modal)] flex h-[100dvh] w-full min-w-0 flex-col overflow-hidden bg-dp-surface shadow-[var(--dp-shadow-drawer)] sm:h-auto sm:max-h-[min(70dvh,640px)] sm:max-w-[var(--dp-modal-width)] sm:rounded-[var(--dp-radius-lg)]"
      >
        <form
          onSubmit={onSubmit}
          role="search"
          className="flex shrink-0 items-center gap-2 border-b border-dp-border px-4 py-3 sm:px-5"
        >
          <span
            className="pointer-events-none flex shrink-0 items-center text-dp-ink-muted"
            aria-hidden="true"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M20 20l-3.5-3.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <label htmlFor={inputId} className="sr-only">
            Search restaurants, cities, states, or cuisines
          </label>
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            role="combobox"
            aria-expanded={hasResults}
            aria-controls={listboxId}
            aria-activedescendant={activeId}
            aria-autocomplete="list"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="search"
            placeholder="Restaurants, cities, states, cuisines"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-11 min-w-0 flex-1 border-0 bg-transparent font-sans text-[16px] text-dp-ink placeholder:text-dp-ink-muted focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults(EMPTY_RESULTS);
                setActiveIndex(-1);
                inputRef.current?.focus();
              }}
              className="dp-meta inline-flex h-11 shrink-0 items-center rounded-[var(--dp-radius-md)] px-2 font-medium text-dp-ink-secondary hover:text-dp-primary"
            >
              Clear
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="dp-meta inline-flex h-11 shrink-0 items-center rounded-[var(--dp-radius-md)] px-2 font-medium text-dp-ink-secondary hover:text-dp-primary"
          >
            Close
          </button>
        </form>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {!searchable ? (
            <p className="px-5 py-8 font-sans text-sm text-dp-ink-muted">
              Search by restaurant, city, state, or cuisine.
            </p>
          ) : showEmptyState ? (
            <p
              role="status"
              className="px-5 py-8 font-sans text-sm text-dp-ink-muted"
            >
              No matches for “{trimmed}”. Try a city, state, or cuisine.
            </p>
          ) : (
            <ul id={listboxId} role="listbox" aria-label="Search results">
              {visible.restaurants.map((restaurant, index) => (
                <li key={restaurant.slug}>
                  <a
                    id={`r-${restaurant.slug}`}
                    role="option"
                    aria-selected={activeIndex === index}
                    href={restaurant.href}
                    onClick={(event) => {
                      event.preventDefault();
                      go(restaurant.href);
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`flex min-h-[56px] items-center justify-between gap-3 px-5 py-3 no-underline ${
                      activeIndex === index ? "bg-dp-soft" : ""
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-sans text-[15px] font-medium text-dp-ink">
                        {restaurant.name}
                      </span>
                      <span className="dp-meta block truncate text-dp-ink-muted">
                        {restaurant.city}, {restaurant.stateCode} ·{" "}
                        {restaurant.cuisine}
                      </span>
                    </span>
                    <MichelinDistinction stars={restaurant.stars} variant="row" />
                  </a>
                </li>
              ))}

              {visible.refinements.map((refinement, index) => {
                const optionIndex = visible.restaurants.length + index;
                return (
                  <li key={refinement.key}>
                    <a
                      id={`f-${refinement.key}`}
                      role="option"
                      aria-selected={activeIndex === optionIndex}
                      href={refinement.href}
                      onClick={(event) => {
                        event.preventDefault();
                        go(refinement.href);
                      }}
                      onMouseEnter={() => setActiveIndex(optionIndex)}
                      className={`flex min-h-[56px] items-center justify-between gap-3 border-t border-dp-border px-5 py-3 no-underline ${
                        activeIndex === optionIndex ? "bg-dp-soft" : ""
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-sans text-[15px] font-medium text-dp-ink">
                          {refinement.label}
                        </span>
                        <span className="dp-meta block truncate text-dp-ink-muted">
                          {refinement.detail}
                        </span>
                      </span>
                      <span className="dp-meta shrink-0 text-dp-ink-muted">
                        {refinement.count}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="shrink-0 border-t border-dp-border px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
          <a
            href={exploreHref}
            onClick={(event) => {
              event.preventDefault();
              go(exploreHref);
            }}
            data-global-search-see-all
            className="flex min-h-11 items-center justify-between gap-3 font-sans text-[14px] font-semibold text-dp-primary no-underline"
          >
            <span>
              {settled && visible.totalRestaurants > 0
                ? `See all ${visible.totalRestaurants} results`
                : "Open Explore"}
            </span>
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </div>
  );

  return typeof document === "undefined"
    ? null
    : createPortal(overlay, document.body);
}
