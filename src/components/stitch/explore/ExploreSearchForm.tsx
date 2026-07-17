import { SearchInput } from "@/components/stitch/SearchInput";
import { Button } from "@/components/stitch/Button";
import type { ExploreQuery } from "@/lib/data/explore";
import { ExploreHiddenInputs } from "./filters";

type ExploreSearchFormProps = {
  query: ExploreQuery;
};

export function ExploreSearchForm({ query }: ExploreSearchFormProps) {
  return (
    <form
      action="/explore"
      method="get"
      role="search"
      className="flex w-full flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-4"
    >
      <div className="min-w-0 flex-1">
        <SearchInput
          id="explore-search"
          name="q"
          defaultValue={query.q}
          label="Search restaurants by name, city, state, or cuisine"
          placeholder="Search restaurant, city, state, or cuisine"
          autoComplete="off"
          className="rounded-[var(--dp-radius-lg)]"
        />
      </div>
      <ExploreHiddenInputs query={query} omit={["q", "page"]} />
      <Button type="submit" className="shrink-0 px-8 sm:self-stretch">
        Search
      </Button>
    </form>
  );
}
