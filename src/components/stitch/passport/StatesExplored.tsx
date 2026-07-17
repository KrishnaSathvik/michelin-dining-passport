import Link from "next/link";
import type { StatesExploredModel } from "./models";

type StatesExploredProps = {
  model: StatesExploredModel;
};

export function StatesExplored({ model }: StatesExploredProps) {
  const pct =
    model.total > 0
      ? Math.min(100, Math.round((model.explored / model.total) * 100))
      : 0;

  return (
    <section
      className="rounded-[var(--dp-radius-lg)] border border-dp-outline-variant bg-dp-surface p-6"
      data-passport-section="states-explored"
      aria-labelledby="states-explored-heading"
    >
      <h2
        id="states-explored-heading"
        className="dp-headline-sm mb-2 text-dp-primary-deep"
      >
        States Explored
      </h2>
      <p className="mb-6 font-sans text-sm text-dp-ink-muted">
        Unique U.S. states and districts with at least one visited restaurant
      </p>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="dp-body-md text-dp-ink">Progress</span>
        <span className="dp-body-md text-dp-ink-muted">
          {model.explored}/{model.total}
        </span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-[var(--dp-radius-xl)] bg-dp-surface-highest"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={model.total}
        aria-valuenow={model.explored}
        aria-label={`${model.explored} of ${model.total} states explored`}
      >
        <div
          className="h-2 rounded-[var(--dp-radius-xl)] bg-dp-secondary"
          style={{ width: `${pct}%` }}
        />
      </div>
      {model.stateLabels.length > 0 ? (
        <p className="mt-4 font-sans text-[13px] leading-relaxed text-dp-ink-secondary">
          {model.stateLabels.join(" · ")}
        </p>
      ) : null}
      <div className="mt-8 text-center">
        <Link
          href="/map?visited=1"
          className="inline-flex min-h-11 items-center justify-center font-sans text-[14px] text-dp-ink-muted no-underline underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
        >
          Explore map for more
        </Link>
      </div>
    </section>
  );
}
