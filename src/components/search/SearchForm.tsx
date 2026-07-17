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
      className="w-full"
    >
      <label htmlFor={inputId} className="sr-only">
        Search by restaurant, city, state, or cuisine
      </label>
      <div
        className={`flex flex-col gap-2 rounded-[var(--radius-lg)] border border-border bg-bg shadow-[0_1px_2px_rgba(18,18,18,0.04)] transition-[box-shadow,border-color] focus-within:border-forest focus-within:shadow-[0_0_0_3px_rgba(18,59,47,0.14)] sm:flex-row sm:items-stretch ${
          compact ? "p-1.5" : "p-2"
        }`}
      >
        <input
          id={inputId}
          name="q"
          type="search"
          defaultValue={defaultQuery}
          placeholder="Restaurant, city, state, or cuisine"
          autoComplete="off"
          className={`min-h-12 w-full flex-1 rounded-[var(--radius-md)] bg-transparent px-4 font-sans text-ink outline-none placeholder:text-ink-muted ${
            compact ? "text-base" : "text-base sm:min-h-14 sm:text-lg"
          }`}
        />
        <button
          type="submit"
          className="min-h-12 rounded-[var(--radius-md)] bg-forest px-6 font-sans text-[15px] font-medium tracking-wide text-white transition-colors hover:bg-forest-deep sm:min-h-14 sm:px-8"
        >
          Search
        </button>
      </div>
    </form>
  );
}
