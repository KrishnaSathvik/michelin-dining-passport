import Link from "next/link";
import { Button } from "@/components/stitch/Button";

type CollectionDetailEmptyStateProps = {
  onAddRestaurants: () => void;
};

export function CollectionDetailEmptyState({
  onAddRestaurants,
}: CollectionDetailEmptyStateProps) {
  return (
    <section
      className="rounded-[var(--dp-radius-lg)] border border-dp-outline-variant bg-dp-surface-low px-6 py-12 text-center"
      data-collections-state="detail-empty"
      aria-labelledby="collection-detail-empty-heading"
    >
      <h2
        id="collection-detail-empty-heading"
        className="dp-headline-sm text-dp-primary-deep"
      >
        No restaurants in this collection
      </h2>
      <p className="mx-auto mt-3 max-w-md font-sans text-[15px] text-dp-ink-muted">
        Add restaurants from the full Michelin roster. Membership organizes your
        Passport — it does not change Saved, Planned, or Visited state.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button type="button" variant="primary" onClick={onAddRestaurants}>
          Add restaurants
        </Button>
        <Link
          href="/explore"
          className="inline-flex h-[var(--dp-control-height)] items-center justify-center rounded-[var(--dp-radius-lg)] border border-dp-outline-variant bg-dp-surface px-5 font-sans text-[14px] font-semibold text-dp-primary no-underline hover:bg-dp-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
        >
          Explore restaurants
        </Link>
        <Link
          href="/saved"
          className="inline-flex min-h-11 items-center font-sans text-[14px] font-medium text-dp-primary no-underline underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
        >
          View saved
        </Link>
      </div>
    </section>
  );
}
