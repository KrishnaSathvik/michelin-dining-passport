type ExploreSearchBarProps = {
  defaultQuery?: string;
  sort: string;
  view: string;
  stars?: number | null;
  state: string;
  city: string;
  cuisine: string;
  price: string;
};

export function ExploreSearchBar({
  defaultQuery = "",
  sort,
  view,
  stars,
  state,
  city,
  cuisine,
  price,
}: ExploreSearchBarProps) {
  return (
    <form action="/explore" method="get" role="search" className="w-full">
      <label htmlFor="explore-search" className="sr-only">
        Search by restaurant, city, state, or cuisine
      </label>
      <div className="flex flex-col gap-2 rounded-[var(--radius-lg)] border border-border bg-bg p-1.5 shadow-[0_1px_2px_rgba(18,18,18,0.04)] transition-[box-shadow,border-color] focus-within:border-forest focus-within:shadow-[0_0_0_3px_rgba(18,59,47,0.14)] sm:flex-row sm:items-stretch">
        <input
          id="explore-search"
          name="q"
          type="search"
          defaultValue={defaultQuery}
          placeholder="Restaurant, city, state, or cuisine"
          autoComplete="off"
          className="min-h-12 w-full flex-1 rounded-[var(--radius-md)] bg-transparent px-4 font-sans text-base text-ink outline-none placeholder:text-ink-muted"
        />
        {stars ? (
          <input type="hidden" name="stars" value={String(stars)} />
        ) : null}
        {state ? <input type="hidden" name="state" value={state} /> : null}
        {city ? <input type="hidden" name="city" value={city} /> : null}
        {cuisine ? (
          <input type="hidden" name="cuisine" value={cuisine} />
        ) : null}
        {price ? <input type="hidden" name="price" value={price} /> : null}
        <input type="hidden" name="sort" value={sort} />
        <input type="hidden" name="view" value={view} />
        <button
          type="submit"
          className="min-h-12 rounded-[var(--radius-md)] bg-forest px-6 font-sans text-[15px] font-medium text-white transition-colors hover:bg-forest-deep"
        >
          Search
        </button>
      </div>
    </form>
  );
}
