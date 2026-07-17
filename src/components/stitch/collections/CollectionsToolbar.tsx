import { CollectionSearch } from "./CollectionSearch";
import { CollectionSort } from "./CollectionSort";
import type { CollectionSortId } from "./models";

type CollectionsToolbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  sort: CollectionSortId;
  onSortChange: (value: CollectionSortId) => void;
};

export function CollectionsToolbar({
  query,
  onQueryChange,
  sort,
  onSortChange,
}: CollectionsToolbarProps) {
  return (
    <section
      className="mb-8 flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center"
      data-collections-section="toolbar"
      aria-label="Search and sort collections"
    >
      <CollectionSearch value={query} onChange={onQueryChange} />
      <CollectionSort value={sort} onChange={onSortChange} />
    </section>
  );
}
