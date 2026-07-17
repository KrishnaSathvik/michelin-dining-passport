import type { Metadata } from "next";
import { PassportPageView } from "@/components/stitch/passport";
import { siteConfig } from "@/config/site";
import {
  getRegionCount,
  getRestaurants,
  getTotals,
} from "@/lib/data/restaurants";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Passport",
  description: `Track Michelin-starred restaurants you have saved and visited on ${siteConfig.productName}. Sign in to sync across devices, or keep a private device-only passport.`,
  path: "/passport",
});

type PassportPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Passport hub — full Stitch composition (Phase 8).
 * PassportProvider remains the single store; this page is presentation only.
 */
export default async function PassportPage({ searchParams }: PassportPageProps) {
  const params = await searchParams;
  const restaurants = getRestaurants();
  const totals = getTotals();
  const denominators = {
    oneStar: totals.oneStar,
    twoStar: totals.twoStar,
    threeStar: totals.threeStar,
    states: getRegionCount(),
  };

  const proof =
    process.env.NODE_ENV !== "production"
      ? typeof params.proof === "string"
        ? (params.proof as "loading" | "empty" | "active")
        : undefined
      : undefined;

  return (
    <PassportPageView
      restaurants={restaurants}
      denominators={denominators}
      proof={proof}
    />
  );
}
