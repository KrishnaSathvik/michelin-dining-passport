import type { Metadata } from "next";
import { Suspense } from "react";
import {
  PassportLoadingState,
  PassportPersonalListPage,
} from "@/components/stitch/passport";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Visited",
  description: "Your dining history — restaurants marked visited in My Restaurants.",
  path: "/visited",
  noIndex: true,
});

type VisitedPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Visited list — Stitch personal-list composition (Phase 8).
 * H1: Visited · subtitle: Your dining history
 * Predicate: unique Passport records where visited === true.
 */
export default async function VisitedPage({ searchParams }: VisitedPageProps) {
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
      <PassportPersonalListPage mode="visited" proof={proof} />
    </Suspense>
  );
}
