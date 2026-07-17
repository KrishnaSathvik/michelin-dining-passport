import type { PassportViewMode } from "./models";

type PersonalListViewToggleProps = {
  value: PassportViewMode;
  onChange: (value: PassportViewMode) => void;
};

export function PersonalListViewToggle({
  value,
  onChange,
}: PersonalListViewToggleProps) {
  return (
    <div
      className="inline-flex rounded-[var(--dp-radius-md)] border border-dp-outline-variant bg-dp-surface-low p-0.5"
      role="group"
      aria-label="View mode"
    >
      <button
        type="button"
        className={`inline-flex h-11 min-w-11 items-center justify-center rounded-[var(--dp-radius-sm)] px-3 font-sans text-[13px] font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus ${
          value === "grid"
            ? "bg-dp-surface text-dp-primary-deep shadow-sm"
            : "text-dp-ink-muted"
        }`}
        aria-pressed={value === "grid"}
        onClick={() => onChange("grid")}
      >
        Grid
      </button>
      <button
        type="button"
        className={`inline-flex h-11 min-w-11 items-center justify-center rounded-[var(--dp-radius-sm)] px-3 font-sans text-[13px] font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus ${
          value === "list"
            ? "bg-dp-surface text-dp-primary-deep shadow-sm"
            : "text-dp-ink-muted"
        }`}
        aria-pressed={value === "list"}
        onClick={() => onChange("list")}
      >
        List
      </button>
    </div>
  );
}
