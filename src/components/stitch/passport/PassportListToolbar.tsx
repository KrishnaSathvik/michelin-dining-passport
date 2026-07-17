import type { PersonalListFilters } from "./filters";
import type { PassportListMode } from "./models";
import { PersonalListSearch } from "./PersonalListSearch";
import { PersonalListSort } from "./PersonalListSort";
import { PersonalListViewToggle } from "./PersonalListViewToggle";

type PassportListToolbarProps = {
  mode: PassportListMode;
  count: number;
  filters: PersonalListFilters;
  onChange: (next: PersonalListFilters) => void;
  stateOptions: string[];
  cuisineOptions: string[];
  showViewToggle?: boolean;
};

export function PassportListToolbar({
  mode,
  count,
  filters,
  onChange,
  stateOptions,
  cuisineOptions,
  showViewToggle = false,
}: PassportListToolbarProps) {
  const searchPlaceholder =
    mode === "planned"
      ? "Filter planned…"
      : mode === "visited"
        ? "Search visited…"
        : "Search saved…";

  return (
    <div
      className="mb-8 flex flex-col gap-4 rounded-[var(--dp-radius-md)] border border-dp-outline-variant bg-dp-surface px-4 py-3 md:mb-10 lg:flex-row lg:items-center lg:justify-between"
      data-passport-list-toolbar={mode}
    >
      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
        <p className="font-sans text-[14px] text-dp-ink-muted" aria-live="polite">
          {count} {count === 1 ? "restaurant" : "restaurants"}
        </p>
        <div className="hidden h-5 w-px bg-dp-outline-variant md:block" aria-hidden="true" />
        <label className="sr-only" htmlFor={`stars-filter-${mode}`}>
          Michelin distinction
        </label>
        <select
          id={`stars-filter-${mode}`}
          value={filters.stars}
          onChange={(event) =>
            onChange({
              ...filters,
              stars: event.target.value as PersonalListFilters["stars"],
            })
          }
          className="h-10 rounded-full border border-dp-outline-variant bg-dp-surface px-3 font-sans text-[13px] text-dp-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
        >
          <option value="">All stars</option>
          <option value="1">1 star</option>
          <option value="2">2 stars</option>
          <option value="3">3 stars</option>
        </select>
        {stateOptions.length > 0 ? (
          <>
            <label className="sr-only" htmlFor={`state-filter-${mode}`}>
              State
            </label>
            <select
              id={`state-filter-${mode}`}
              value={filters.state}
              onChange={(event) =>
                onChange({ ...filters, state: event.target.value })
              }
              className="h-10 rounded-full border border-dp-outline-variant bg-dp-surface px-3 font-sans text-[13px] text-dp-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
            >
              <option value="">All states</option>
              {stateOptions.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </>
        ) : null}
        {cuisineOptions.length > 0 ? (
          <>
            <label className="sr-only" htmlFor={`cuisine-filter-${mode}`}>
              Cuisine
            </label>
            <select
              id={`cuisine-filter-${mode}`}
              value={filters.cuisine}
              onChange={(event) =>
                onChange({ ...filters, cuisine: event.target.value })
              }
              className="h-10 rounded-full border border-dp-outline-variant bg-dp-surface px-3 font-sans text-[13px] text-dp-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
            >
              <option value="">All cuisines</option>
              {cuisineOptions.map((cuisine) => (
                <option key={cuisine} value={cuisine}>
                  {cuisine}
                </option>
              ))}
            </select>
          </>
        ) : null}
        {mode === "visited" ? (
          <label className="inline-flex min-h-11 items-center gap-2 font-sans text-[13px] text-dp-ink-secondary">
            <input
              type="checkbox"
              checked={filters.favoriteOnly}
              onChange={(event) =>
                onChange({ ...filters, favoriteOnly: event.target.checked })
              }
              className="h-4 w-4 accent-dp-primary"
            />
            Favorites only
          </label>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 border-t border-dp-outline-variant pt-3 md:flex-row md:flex-wrap md:items-center md:border-0 md:pt-0">
        <PersonalListSearch
          value={filters.query}
          onChange={(query) => onChange({ ...filters, query })}
          placeholder={searchPlaceholder}
          id={`personal-list-search-${mode}`}
        />
        <PersonalListSort
          mode={mode}
          value={filters.sort}
          onChange={(sort) => onChange({ ...filters, sort })}
        />
        {showViewToggle ? (
          <PersonalListViewToggle
            value={filters.view}
            onChange={(view) => onChange({ ...filters, view })}
          />
        ) : null}
      </div>
    </div>
  );
}
