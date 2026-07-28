import type { Metadata } from "next";
import { Suspense } from "react";
import { PassportPersonalListPage } from "@/components/stitch/passport";
import { PassportLoadingState } from "@/components/stitch/passport";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Saved restaurants",
  description: "Restaurants saved in My Restaurants.",
  path: "/saved",
  noIndex: true,
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
  const proof =
    process.env.NODE_ENV !== "production"
      ? typeof params.proof === "string"
        ? (params.proof as
            | "loading"
            | "empty"
            | "sync-pending"
            | "sync-failed")
        : undefined
      : undefined;

  return (
    <Suspense fallback={<PassportLoadingState variant="list" />}>
      <PassportPersonalListPage mode="saved" proof={proof} />
    </Suspense>
  );
}
