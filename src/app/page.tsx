import type { Metadata } from "next";
import {
  HomepageView,
  toHomepageViewModel,
} from "@/components/stitch/home";
import { homepageConfig } from "@/config/homepage";
import { absoluteUrl, siteConfig } from "@/config/site";
import {
  getRestaurantsBySlugs,
  getTotals,
} from "@/lib/data/restaurants";

export const metadata: Metadata = {
  title: {
    absolute: `${siteConfig.productName} · Michelin-starred restaurants in the United States`,
  },
  description: siteConfig.description,
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    title: siteConfig.productName,
    description: siteConfig.description,
    url: absoluteUrl("/"),
    siteName: siteConfig.productName,
    type: "website",
    locale: "en_US",
  },
};

type HomePageProps = {
  searchParams?: Promise<{ proof?: string }>;
};

/**
 * Homepage — strict Stitch explore_feed composition (OD-08).
 * Old multi-section homepage stack removed in Phase 4.
 */
export default async function HomePage({ searchParams }: HomePageProps) {
  const totals = getTotals();
  const featuredSlugs = homepageConfig.featuredRestaurantSlugs.slice(0, 3);
  const featuredRestaurants = getRestaurantsBySlugs(featuredSlugs);

  if (
    process.env.NODE_ENV === "development" &&
    featuredRestaurants.length < featuredSlugs.length
  ) {
    const found = new Set(featuredRestaurants.map((r) => r.slug));
    for (const slug of featuredSlugs) {
      if (!found.has(slug)) {
        console.warn(`[homepage] featured slug unavailable: ${slug}`);
      }
    }
  }

  const model = toHomepageViewModel({
    totals: {
      restaurants: totals.restaurants,
      oneStar: totals.oneStar,
      twoStar: totals.twoStar,
      threeStar: totals.threeStar,
    },
    featuredRestaurants,
  });

  // Dev-only visual QA states for Phase 4 baselines — unavailable in production.
  const params = searchParams ? await searchParams : undefined;
  const proof =
    process.env.NODE_ENV !== "production" ? params?.proof : undefined;

  if (proof === "loading") {
    return <HomepageView model={model} featuredLoading />;
  }

  if (proof === "empty") {
    return (
      <HomepageView
        model={{
          ...model,
          featured: { ...model.featured, restaurants: [] },
        }}
      />
    );
  }

  return <HomepageView model={model} />;
}
