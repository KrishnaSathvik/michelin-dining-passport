import type { ExploreFacets, ExploreQuery } from "@/lib/data/explore";

type ExploreFilterFieldsProps = {
  query: ExploreQuery;
  facets: ExploreFacets;
  idPrefix?: string;
};

const selectClassName =
  "min-h-11 w-full border border-border bg-bg-elevated px-3 font-sans text-sm text-ink outline-none focus-visible:border-forest";

export function ExploreFilterFields({
  query,
  facets,
  idPrefix = "explore",
}: ExploreFilterFieldsProps) {
  return (
    <div className="space-y-5">
      <div>
        <label
          htmlFor={`${idPrefix}-q`}
          className="mb-2 block font-sans text-xs uppercase tracking-[0.16em] text-ink-muted"
        >
          Search
        </label>
        <input
          id={`${idPrefix}-q`}
          name="q"
          type="search"
          defaultValue={query.q}
          placeholder="Name, city, state, cuisine, address"
          className={selectClassName}
        />
      </div>

      <div>
        <label
          htmlFor={`${idPrefix}-stars`}
          className="mb-2 block font-sans text-xs uppercase tracking-[0.16em] text-ink-muted"
        >
          Stars
        </label>
        <select
          id={`${idPrefix}-stars`}
          name="stars"
          defaultValue={query.stars ?? ""}
          className={selectClassName}
        >
          <option value="">Any star level</option>
          {facets.stars.map((star) => (
            <option key={star.value} value={star.value}>
              {star.label} ({star.count})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor={`${idPrefix}-state`}
          className="mb-2 block font-sans text-xs uppercase tracking-[0.16em] text-ink-muted"
        >
          State
        </label>
        <select
          id={`${idPrefix}-state`}
          name="state"
          defaultValue={query.state}
          className={selectClassName}
        >
          <option value="">All states</option>
          {facets.states.map((state) => (
            <option key={state.value} value={state.value}>
              {state.label} ({state.count})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor={`${idPrefix}-city`}
          className="mb-2 block font-sans text-xs uppercase tracking-[0.16em] text-ink-muted"
        >
          City
        </label>
        <select
          id={`${idPrefix}-city`}
          name="city"
          defaultValue={query.city}
          className={selectClassName}
        >
          <option value="">All cities</option>
          {facets.cities.map((city) => (
            <option key={city.value} value={city.value}>
              {city.label}, {city.stateCode} ({city.count})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor={`${idPrefix}-cuisine`}
          className="mb-2 block font-sans text-xs uppercase tracking-[0.16em] text-ink-muted"
        >
          Cuisine
        </label>
        <select
          id={`${idPrefix}-cuisine`}
          name="cuisine"
          defaultValue={query.cuisine}
          className={selectClassName}
        >
          <option value="">All cuisines</option>
          {facets.cuisines.map((cuisine) => (
            <option key={cuisine.value} value={cuisine.value}>
              {cuisine.label} ({cuisine.count})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor={`${idPrefix}-price`}
          className="mb-2 block font-sans text-xs uppercase tracking-[0.16em] text-ink-muted"
        >
          Price
        </label>
        <select
          id={`${idPrefix}-price`}
          name="price"
          defaultValue={query.price}
          className={selectClassName}
        >
          <option value="">Any price</option>
          {facets.prices.map((price) => (
            <option key={price.value} value={price.value}>
              {price.label} ({price.count})
            </option>
          ))}
        </select>
      </div>

      <input type="hidden" name="sort" value={query.sort} />
      <input type="hidden" name="view" value={query.view} />
    </div>
  );
}
