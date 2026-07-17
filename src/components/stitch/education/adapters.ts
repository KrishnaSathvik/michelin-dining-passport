import { siteConfig } from "@/config/site";
import { getTotals } from "@/lib/data/restaurants";
import { STAR_MEANINGS } from "@/components/stitch/taxonomy/models";
import type { EducationPageViewModel } from "./models";

export function toEducationPageViewModel(): EducationPageViewModel {
  const totals = getTotals();

  return {
    title: "How Michelin Stars Work",
    introduction:
      "A plain-language guide to Michelin Guide star levels and related distinctions — written for Dining Passport travelers. This is an independent product and not an official Michelin publication.",
    independence: siteConfig.independenceDisclaimer,
    coverage: `${siteConfig.coverageNote} This atlas currently lists ${totals.restaurants} starred restaurants in the United States roster.`,
    heroImageSrc: "/images/homepage-hero.jpg",
    starCards: [
      {
        stars: 1,
        title: "One Michelin Star",
        summary: STAR_MEANINGS[1],
        count: totals.oneStar,
        href: "/stars/1",
        cta: `Browse ${totals.oneStar} one-star restaurants`,
      },
      {
        stars: 2,
        title: "Two Michelin Stars",
        summary: STAR_MEANINGS[2],
        count: totals.twoStar,
        href: "/stars/2",
        cta: `Browse ${totals.twoStar} two-star restaurants`,
      },
      {
        stars: 3,
        title: "Three Michelin Stars",
        summary: STAR_MEANINGS[3],
        count: totals.threeStar,
        href: "/stars/3",
        cta: `Browse ${totals.threeStar} three-star restaurants`,
        featured: true,
      },
    ],
    beyond: [
      {
        id: "bib",
        title: "Bib Gourmand",
        body: "Bib Gourmand is a separate Michelin Guide distinction for notably good food at a more moderate price point. It is not a star level. Dining Passport currently tracks Michelin-starred restaurants only — Bib Gourmand is not counted in the roster totals above.",
      },
      {
        id: "green",
        title: "Michelin Green Star",
        body: "The Michelin Green Star highlights restaurants with notable sustainable practices. It can appear alongside culinary stars but measures a different dimension. This atlas does not yet model Green Star status as a filter or badge on restaurant cards.",
      },
    ],
  };
}
