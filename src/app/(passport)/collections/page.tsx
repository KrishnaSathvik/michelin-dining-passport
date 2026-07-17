import type { Metadata } from "next";
import { CollectionsPageView } from "@/components/stitch/collections";
import { getRestaurants } from "@/lib/data/restaurants";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Collections",
  description:
    "Private curated collections of Michelin-starred restaurants in your dining passport.",
  path: "/collections",
});

type CollectionsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Collections index — full Stitch composition (Phase 9).
 * PassportProvider remains the single store; this page is presentation only.
 */
export default async function CollectionsPage({
  searchParams,
}: CollectionsPageProps) {
  const params = await searchParams;
  const restaurants = getRestaurants();
  const proof =
    process.env.NODE_ENV !== "production"
      ? typeof params.proof === "string"
        ? (params.proof as "loading" | "empty" | "active")
        : undefined
      : undefined;

  return <CollectionsPageView restaurants={restaurants} proof={proof} />;
}
