import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AccountPageView } from "@/components/stitch/account/AccountPageView";
import { AccountLoadingState } from "@/components/stitch/account/AccountLoadingState";

export const metadata: Metadata = {
  title: "Account preview (dev)",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * Development-only AccountPageView fixture for visual baselines.
 * Unavailable in production. Not linked from navigation.
 */
export default async function StitchAccountPreviewPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const params = await searchParams;
  if (params.state === "loading") {
    return <AccountLoadingState />;
  }

  return (
    <AccountPageView
      profile={{
        email: "diner@example.com",
        displayName: "Preview Diner",
        homeCity: "San Francisco",
        providers: ["email"],
        createdAt: "2025-06-01T12:00:00.000Z",
        hasPasswordProvider: true,
      }}
      flash={
        params.state === "error"
          ? { kind: "error", message: "Unable to update password." }
          : null
      }
    />
  );
}
