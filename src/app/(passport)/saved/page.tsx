import type { Metadata } from "next";
import { PassportListPage } from "@/components/stitch/passport";
import { getRestaurants } from "@/lib/data/restaurants";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Saved restaurants",
  description: "Restaurants saved in your dining passport.",
  path: "/saved",
});

type SavedPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Saved list — Stitch personal-list composition (Phase 8).
 * Predicate: unique Passport records where saved === true.
 */
export default async function SavedPage({ searchParams }: SavedPageProps) {
  const params = await searchParams;
  const restaurants = getRestaurants();
  const proof =
    process.env.NODE_ENV !== "production"
      ? typeof params.proof === "string"
        ? (params.proof as "loading" | "empty")
        : undefined
      : undefined;

  return (
    <PassportListPage mode="saved" restaurants={restaurants} proof={proof} />
  );
}
