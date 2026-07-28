import type { Metadata } from "next";
import {
  CollectionsPageView,
  readCollectionsProof,
} from "@/components/stitch/collections";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Collections",
  description:
    "Private groups for the Michelin-starred restaurants saved in My Restaurants.",
  path: "/collections",
  noIndex: true,
});

type CollectionsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Collections index. The catalog and store both come from PassportProvider,
 * so this route stays presentation-only.
 */
export default async function CollectionsPage({
  searchParams,
}: CollectionsPageProps) {
  const params = await searchParams;

  // No Suspense wrapper: the view owns its own loading state, and a second
  // fallback here would render the loading UI twice during SSR.
  return <CollectionsPageView proof={readCollectionsProof(params.proof)} />;
}
