import Link from "next/link";
import { Button } from "@/components/stitch/Button";

type CollectionsEmptyStateProps = {
  onCreate: () => void;
};

export function CollectionsEmptyState({ onCreate }: CollectionsEmptyStateProps) {
  return (
    <section
      className="rounded-[var(--dp-radius-lg)] border border-dp-outline-variant bg-dp-surface-low px-6 py-14 text-center"
      data-collections-state="empty"
      aria-labelledby="collections-empty-heading"
    >
      <div
        className="mx-auto mb-8 flex h-28 w-full max-w-sm items-end justify-center gap-2"
        aria-hidden="true"
      >
        <div className="h-16 w-20 rounded-[var(--dp-radius-md)] bg-dp-surface-high" />
        <div className="h-24 w-24 rounded-[var(--dp-radius-md)] bg-dp-surface" />
        <div className="h-14 w-20 rounded-[var(--dp-radius-md)] bg-dp-surface-high" />
      </div>
      <h2
        id="collections-empty-heading"
        className="dp-headline-md text-dp-primary-deep"
      >
        No collections yet
      </h2>
      <p className="mx-auto mt-3 max-w-md font-sans text-[16px] text-dp-ink-muted">
        Organize restaurants into personal lists for trips, cities, or tasting
        themes. Collections stay private to your Passport.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button type="button" variant="primary" onClick={onCreate}>
          Create collection
        </Button>
        <Link
          href="/explore"
          className="inline-flex h-[var(--dp-control-height)] items-center justify-center rounded-[var(--dp-radius-lg)] border border-dp-outline-variant bg-dp-surface px-5 font-sans text-[14px] font-semibold text-dp-primary no-underline transition-colors hover:bg-dp-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
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
