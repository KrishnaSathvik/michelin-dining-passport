type SearchFormProps = {
  defaultQuery?: string;
  idPrefix?: string;
  compact?: boolean;
};

export function SearchForm({
  defaultQuery = "",
  idPrefix = "hero",
  compact = false,
}: SearchFormProps) {
  const inputId = `${idPrefix}-search`;

  return (
    <form
      action="/explore"
      method="get"
      role="search"
      className={compact ? "w-full" : "w-full"}
    >
      <label htmlFor={inputId} className="sr-only">
        Search by restaurant, city, state, or cuisine
      </label>
      <div
        className={`flex flex-col gap-3 border border-border bg-bg-elevated transition-[box-shadow,border-color] focus-within:border-forest focus-within:shadow-[0_0_0_3px_rgba(31,61,47,0.12)] sm:flex-row sm:items-stretch ${
          compact ? "p-2" : "p-2 sm:p-2.5"
        }`}
      >
        <input
          id={inputId}
          name="q"
          type="search"
          defaultValue={defaultQuery}
          placeholder="Restaurant, city, state, or cuisine"
          autoComplete="off"
          className={`min-h-12 w-full flex-1 bg-transparent px-3 font-sans text-ink outline-none placeholder:text-ink-muted/70 ${
            compact ? "text-base" : "text-base sm:text-lg"
          }`}
        />
        <button
          type="submit"
          className="min-h-12 bg-forest px-5 font-sans text-sm font-medium tracking-wide text-bg-elevated transition-colors hover:bg-forest-deep sm:px-6"
        >
          Search
        </button>
      </div>
    </form>
  );
}
