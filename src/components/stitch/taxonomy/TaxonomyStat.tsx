import type { TaxonomyStatModel } from "./models";

type TaxonomyStatProps = {
  model: TaxonomyStatModel;
  emphasize?: boolean;
};

export function TaxonomyStat({ model, emphasize = false }: TaxonomyStatProps) {
  return (
    <div
      className={`rounded-[var(--dp-radius-lg)] border border-dp-border bg-dp-surface p-5 ${
        emphasize ? "ring-1 ring-[color-mix(in_srgb,var(--dp-star-gold)_40%,transparent)]" : ""
      }`}
    >
      <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.08em] text-dp-ink-muted">
        {model.label}
      </p>
      <p
        className={`mt-2 font-display text-[32px] leading-none tracking-tight ${
          emphasize ? "text-[var(--dp-star-gold)]" : "text-dp-primary"
        }`}
        aria-label={model.accessibleLabel}
      >
        {model.value}
      </p>
    </div>
  );
}
