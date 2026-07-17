import type { CollectionProgressModel } from "./models";

type CollectionProgressProps = {
  progress: CollectionProgressModel;
  onAddRestaurants: () => void;
};

export function CollectionProgress({
  progress,
  onAddRestaurants,
}: CollectionProgressProps) {
  const valueText =
    progress.totalMembers === 0
      ? "No restaurants in this collection yet"
      : `${progress.visitedMembers} of ${progress.totalMembers} restaurants visited, ${progress.percent} percent complete`;

  return (
    <aside
      className="flex h-auto flex-col justify-between rounded-[var(--dp-radius-lg)] border border-dp-outline-variant bg-dp-surface-low p-8 lg:h-[400px]"
      data-collections-section="progress"
      aria-label="Collection progress"
    >
      <div>
        <h2 className="dp-headline-sm mb-6 text-dp-ink">Collection Progress</h2>
        <div className="mb-8">
          <div className="mb-2 flex items-end justify-between">
            <span className="dp-label-caps text-dp-ink-muted">
              Restaurants visited
            </span>
            <span className="dp-headline-sm text-dp-primary">
              {progress.visitedMembers}{" "}
              <span className="font-sans text-[16px] text-dp-ink-muted">
                / {progress.totalMembers}
              </span>
            </span>
          </div>
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-dp-surface-high"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress.percent}
            aria-valuetext={valueText}
          >
            <div
              className="h-full rounded-full bg-dp-primary transition-[width] duration-500"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>

        <div>
          <span className="dp-label-caps mb-4 block text-dp-ink-muted">
            Michelin accolades
          </span>
          <div className="flex items-center gap-3 rounded-[var(--dp-radius-lg)] border border-dp-outline-variant bg-dp-surface p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--dp-star-gold)_35%,white)] text-dp-ink">
              ★
            </div>
            <div>
              <div className="dp-headline-sm text-dp-ink">
                {progress.starsInCollection}
              </div>
              <div className="font-sans text-[14px] text-dp-ink-muted">
                Total stars in collection
              </div>
            </div>
          </div>
          {progress.statesRepresented > 0 ? (
            <p className="mt-4 font-sans text-[14px] text-dp-ink-muted">
              {progress.statesRepresented}{" "}
              {progress.statesRepresented === 1 ? "state" : "states"}
              {progress.stateLabels.length
                ? ` (${progress.stateLabels.join(", ")})`
                : ""}
            </p>
          ) : null}
          {progress.staleMemberCount > 0 ? (
            <p className="mt-2 font-sans text-[13px] text-dp-ink-muted">
              {progress.staleMemberCount} unavailable{" "}
              {progress.staleMemberCount === 1 ? "member" : "members"} omitted
              from progress.
            </p>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={onAddRestaurants}
        className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-dp-primary font-sans text-[16px] font-medium text-dp-on-primary transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
        data-collections-action="add-restaurants"
      >
        <span aria-hidden="true">+</span> Add restaurants
      </button>
    </aside>
  );
}
