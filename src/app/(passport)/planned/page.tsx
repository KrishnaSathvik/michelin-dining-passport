import type { Metadata } from "next";
import { Suspense } from "react";
import {
  PassportLoadingState,
  PassportPersonalListPage,
} from "@/components/stitch/passport";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Planned visits",
  description: "Restaurants marked planned in My Restaurants.",
  path: "/planned",
  noIndex: true,
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
    <Suspense fallback={<PassportLoadingState variant="planned" />}>
      <PassportPersonalListPage mode="planned" proof={proof} />
    </Suspense>
  );
}
