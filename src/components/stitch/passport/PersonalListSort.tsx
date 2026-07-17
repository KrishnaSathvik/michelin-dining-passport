import type { PassportListMode, PassportSortOption } from "./models";

type PersonalListSortProps = {
  mode: PassportListMode;
  value: PassportSortOption;
  onChange: (value: PassportSortOption) => void;
};

function optionsForMode(
  mode: PassportListMode,
): Array<{ value: PassportSortOption; label: string }> {
  switch (mode) {
    case "saved":
      return [
        { value: "date-saved-newest", label: "Date saved (newest)" },
        { value: "date-saved-oldest", label: "Date saved (oldest)" },
        { value: "name-asc", label: "Name A–Z" },
        { value: "name-desc", label: "Name Z–A" },
      ];
    case "planned":
      return [
        { value: "planned-upcoming", label: "Upcoming" },
        { value: "planned-furthest", label: "Furthest out" },
        { value: "name-asc", label: "Name A–Z" },
      ];
    case "visited":
      return [
        { value: "visit-newest", label: "Visit date (newest)" },
        { value: "visit-oldest", label: "Visit date (oldest)" },
        { value: "name-asc", label: "Name A–Z" },
      ];
    default: {
      const _exhaustive: never = mode;
      return _exhaustive;
    }
  }
}

export function PersonalListSort({
  mode,
  value,
  onChange,
}: PersonalListSortProps) {
  const options = optionsForMode(mode);
  return (
    <div className="flex min-h-11 items-center gap-2">
      <label
        htmlFor={`personal-list-sort-${mode}`}
        className="whitespace-nowrap font-sans text-[14px] text-dp-ink-muted"
      >
        Sort
      </label>
      <select
        id={`personal-list-sort-${mode}`}
        value={value}
        onChange={(event) =>
          onChange(event.target.value as PassportSortOption)
        }
        className="h-12 min-w-[11rem] rounded-[var(--dp-radius-md)] border border-dp-outline-variant bg-dp-surface px-3 font-sans text-[14px] text-dp-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
        aria-label="Sort personal list"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
