import { Button } from "@/components/stitch/Button";

type CollectionsHeaderProps = {
  onCreate: () => void;
};

export function CollectionsHeader({ onCreate }: CollectionsHeaderProps) {
  return (
    <section
      className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end"
      data-collections-section="intro"
    >
      <div className="max-w-2xl">
        <h1 className="dp-display-lg mb-4 text-dp-primary max-md:dp-display-lg-mobile">
          Collections
        </h1>
        <p className="dp-body-lg text-dp-ink-muted">
          Organize your Michelin discoveries into curated personal lists for any
          occasion.
        </p>
      </div>
      <Button
        type="button"
        variant="primary"
        onClick={onCreate}
        className="shrink-0"
        data-collections-action="create"
      >
        <span aria-hidden="true">+</span>
        Create collection
      </Button>
    </section>
  );
}
