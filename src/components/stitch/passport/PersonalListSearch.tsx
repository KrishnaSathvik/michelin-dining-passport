type PersonalListSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  id?: string;
};

export function PersonalListSearch({
  value,
  onChange,
  placeholder,
  id = "personal-list-search",
}: PersonalListSearchProps) {
  return (
    <div className="w-full lg:w-64">
      <label htmlFor={id} className="sr-only">
        Search
      </label>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-[var(--dp-radius-md)] border border-dp-outline-variant bg-dp-surface px-3 font-sans text-[14px] text-dp-ink placeholder:text-dp-ink-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
      />
    </div>
  );
}
