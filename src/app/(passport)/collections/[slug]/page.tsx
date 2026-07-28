import type { Metadata } from "next";
import {
  CollectionDetailView,
  readCollectionDetailProof,
} from "@/components/stitch/collections";
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
    description: "A private collection of saved restaurants.",
    path: `/collections/${slug}`,
    noIndex: true,
  });
}

/**
 * Collection detail. Collections live only in the client Passport store, so the
 * slug is resolved there rather than on the server.
 */
export default async function CollectionPage({
  params,
  searchParams,
}: CollectionPageProps) {
  const { slug } = await params;
  const query = await searchParams;

  // No Suspense wrapper: the view owns its own loading state.
  return (
    <CollectionDetailView
      slug={slug}
      proof={readCollectionDetailProof(query.proof)}
    />
  );
}
