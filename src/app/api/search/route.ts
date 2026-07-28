import { globalSearch } from "@/lib/data/search";

/** Longest query we will look at — the catalog has no meaningful longer terms. */
const MAX_QUERY_LENGTH = 120;

/**
 * Bounded search endpoint for the header's global search.
 *
 * Exists so the search dialog never has to ship the full catalog to the
 * client. Returns a small preview; the full result set is always an
 * Explore URL.
 */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  const results = globalSearch(q.slice(0, MAX_QUERY_LENGTH));

  return Response.json(results, {
    headers: {
      // Catalog is build-time static; a short shared cache is safe and keeps
      // repeated keystroke queries cheap.
      "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
