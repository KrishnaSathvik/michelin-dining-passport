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
        className={`flex flex-col gap-2 rounded-[var(--dp-radius-lg)] border border-dp-border bg-dp-surface shadow-[var(--dp-shadow-hover)] transition-[box-shadow,border-color] focus-within:border-dp-primary focus-within:shadow-[0_0_0_3px_rgba(18,59,47,0.14)] sm:flex-row sm:items-stretch ${
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
          className={`min-h-12 w-full flex-1 rounded-[var(--dp-radius-md)] bg-transparent px-4 font-sans text-dp-ink outline-none placeholder:text-dp-ink-muted ${
            compact ? "text-base" : "text-base sm:min-h-14 sm:text-lg"
          }`}
        />
        <button
          type="submit"
          className="min-h-12 rounded-[var(--dp-radius-md)] bg-dp-primary px-6 font-sans text-[15px] font-medium tracking-wide text-dp-on-primary transition-colors hover:bg-dp-primary-hover sm:min-h-14 sm:px-8"
        >
          Search
        </button>
      </div>
    </form>
  );
}
