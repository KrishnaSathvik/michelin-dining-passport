type CollectionSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export function CollectionSearch({ value, onChange }: CollectionSearchProps) {
  return (
    <label className="relative block w-full max-w-md">
      <span className="sr-only">Search collections</span>
      <span
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-dp-ink-muted"
        aria-hidden="true"
      >
        ⌕
      </span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search collections"
        className="h-[var(--dp-control-height)] w-full rounded-[var(--dp-radius-lg)] border border-dp-outline-variant bg-dp-surface pl-12 pr-4 font-sans text-[16px] text-dp-ink placeholder:text-dp-ink-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
        data-collections-control="search"
      />
    </label>
  );
}
