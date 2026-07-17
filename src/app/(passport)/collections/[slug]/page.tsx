import type { Metadata } from "next";
import { CollectionDetailView } from "@/components/stitch/collections";
import { getRestaurants } from "@/lib/data/restaurants";
import { buildPageMetadata } from "@/lib/seo/metadata";

type CollectionPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  return buildPageMetadata({
    title: "Collection",
    description: "A private local restaurant collection.",
    path: `/collections/${slug}`,
    noIndex: true,
  });
}

/**
 * Collection detail — full Stitch composition (Phase 9).
 * Lookup remains by slug; Passport store is unchanged.
 */
export default async function CollectionPage({
  params,
  searchParams,
}: CollectionPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const restaurants = getRestaurants();
  const proof =
    process.env.NODE_ENV !== "production"
      ? typeof query.proof === "string"
        ? (query.proof as "loading" | "empty" | "missing")
        : undefined
      : undefined;

  return (
    <CollectionDetailView
      slug={slug}
      restaurants={restaurants}
      proof={proof}
    />
  );
}
