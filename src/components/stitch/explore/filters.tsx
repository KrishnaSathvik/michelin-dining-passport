import type { ExploreQuery } from "@/lib/data/explore";

/**
 * Hidden GET fields that preserve the Explore URL contract across forms.
 * Callers omit fields they own as visible controls.
 */
export function explorePreservedFields(
  query: ExploreQuery,
  omit: ReadonlyArray<keyof ExploreQuery> = [],
): Array<{ name: string; value: string }> {
  const skip = new Set(omit);
  const fields: Array<{ name: string; value: string }> = [];

  if (!skip.has("q") && query.q) {
    fields.push({ name: "q", value: query.q });
  }
  if (!skip.has("stars") && query.stars !== null) {
    fields.push({ name: "stars", value: String(query.stars) });
  }
  if (!skip.has("state") && query.state) {
    fields.push({ name: "state", value: query.state });
  }
  if (!skip.has("city") && query.city) {
    fields.push({ name: "city", value: query.city });
  }
  if (!skip.has("cuisine") && query.cuisine) {
    fields.push({ name: "cuisine", value: query.cuisine });
  }
  if (!skip.has("price") && query.price) {
    fields.push({ name: "price", value: query.price });
  }
  if (!skip.has("sort")) {
    fields.push({ name: "sort", value: query.sort });
  }
  if (!skip.has("view")) {
    fields.push({ name: "view", value: query.view });
  }
  // page is intentionally never preserved — filter/search/sort/view reset to page 1

  return fields;
}

export function ExploreHiddenInputs({
  query,
  omit = [],
}: {
  query: ExploreQuery;
  omit?: ReadonlyArray<keyof ExploreQuery>;
}) {
  return (
    <>
      {explorePreservedFields(query, omit).map((field) => (
        <input
          key={field.name}
          type="hidden"
          name={field.name}
          value={field.value}
        />
      ))}
    </>
  );
}
