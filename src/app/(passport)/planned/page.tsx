import type { Metadata } from "next";
import { PassportListPage } from "@/components/stitch/passport";
import { getRestaurants } from "@/lib/data/restaurants";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Planned visits",
  description: "Restaurants marked planned in your dining passport.",
  path: "/planned",
});

type PlannedPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Planned list — first-class sibling to /saved and /visited (OD-07).
 * View over existing Passport records where planned === true.
 * No new database entity or persistence format.
 */
export default async function PlannedPage({ searchParams }: PlannedPageProps) {
  const params = await searchParams;
  const restaurants = getRestaurants();
  const proof =
    process.env.NODE_ENV !== "production"
      ? typeof params.proof === "string"
        ? (params.proof as "loading" | "empty")
        : undefined
      : undefined;

  return (
    <PassportListPage mode="planned" restaurants={restaurants} proof={proof} />
  );
}
