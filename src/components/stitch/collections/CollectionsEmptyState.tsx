import Link from "next/link";
import { Button } from "@/components/stitch/Button";

type CollectionsEmptyStateProps = {
  onCreate: () => void;
};

export function CollectionsEmptyState({ onCreate }: CollectionsEmptyStateProps) {
  return (
    <section
      className="border-y border-dp-outline-variant py-14 text-center"
      data-collections-state="empty"
      aria-labelledby="collections-empty-heading"
    >
      <h2
        id="collections-empty-heading"
        className="dp-headline-sm text-dp-primary-deep"
      >
        Create your first collection
      </h2>
      <p className="mx-auto mt-3 max-w-lg font-sans text-[15px] leading-relaxed text-dp-ink-secondary">
        Collections organize the restaurants you have saved — a New York
        weekend, anniversary dinners, tasting menus to try. A restaurant can
        belong to as many collections as you like.
      </p>
      <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button type="button" variant="primary" onClick={onCreate}>
          Create collection
        </Button>
        <Link
          href="/explore"
          className="inline-flex h-[var(--dp-control-height)] min-h-11 items-center justify-center rounded-[var(--dp-radius-lg)] border border-dp-outline-variant bg-dp-surface px-5 font-sans text-[14px] font-semibold text-dp-primary no-underline transition-colors hover:bg-dp-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
        >
          Explore restaurants
        </Link>
      </div>
    </section>
  );
}
