import { Select } from "@/components/stitch/Select";
import { COLLECTION_SORT_OPTIONS, type CollectionSortId } from "./models";

type CollectionSortProps = {
  value: CollectionSortId;
  onChange: (value: CollectionSortId) => void;
};

export function CollectionSort({ value, onChange }: CollectionSortProps) {
  return (
    <div className="w-full sm:w-auto sm:min-w-[220px]" data-collections-control="sort">
      <Select
        aria-label="Sort collections"
        value={value}
        onChange={(event) => onChange(event.target.value as CollectionSortId)}
      >
        {COLLECTION_SORT_OPTIONS.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
