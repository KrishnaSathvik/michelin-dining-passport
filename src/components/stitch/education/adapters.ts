import { siteConfig } from "@/config/site";
import { getTotals } from "@/lib/data/restaurants";
import { STAR_MEANINGS } from "@/components/stitch/taxonomy/models";
import type { EducationPageViewModel } from "./models";

export function toEducationPageViewModel(): EducationPageViewModel {
  const totals = getTotals();

  return {
    title: "How Michelin Stars Work",
    introduction:
      "What a Michelin star actually means, how the world's most influential restaurant guide decides who earns one, and what one, two, and three stars tell you before you book.",
    independence: siteConfig.independenceDisclaimer,
    coverage: `${siteConfig.coverageNote} This atlas currently lists ${totals.restaurants} starred restaurants in the United States roster.`,
    heroImageSrc: "/images/homepage-hero.jpg",

    primer: {
      heading: "What a Michelin star means",
      paragraphs: [
        "The Michelin Guide began in 1900 — not as a food magazine, but as a free handbook published by the French tyre company Michelin. Brothers André and Édouard Michelin gave it to early motorists with maps, tyre-repair tips, and directions to fuel, lodging, and a good meal, betting that more road trips would sell more tyres.",
        "It grew into the most influential restaurant guide in the world, and in 1926 it began awarding a star for exceptional cooking. Today a Michelin star is one of the highest honours a kitchen can receive.",
        "A star rewards just one thing: what is on the plate. Comfort, décor, and service are noted separately and never earn a star. And because the guide is republished every year, a restaurant can gain, hold, or lose a star from one edition to the next.",
      ],
    },

    starCards: [
      {
        stars: 1,
        title: "One Michelin Star",
        summary: `${STAR_MEANINGS[1]}.`,
        detail:
          "A very good restaurant in its category — cooking of a consistently high standard that's worth stopping for.",
        count: totals.oneStar,
        href: "/stars/1",
        cta: `Browse ${totals.oneStar} one-star restaurants`,
      },
      {
        stars: 2,
        title: "Two Michelin Stars",
        summary: `${STAR_MEANINGS[2]}.`,
        detail:
          "Refined, expertly crafted cooking of outstanding quality — skilled enough that it's worth going out of your way for.",
        count: totals.twoStar,
        href: "/stars/2",
        cta: `Browse ${totals.twoStar} two-star restaurants`,
      },
      {
        stars: 3,
        title: "Three Michelin Stars",
        summary: `${STAR_MEANINGS[3]}.`,
        detail:
          "The very best — the work of a chef at the peak of the craft, distinctive enough to justify a trip of its own. Only a handful exist in any country.",
        count: totals.threeStar,
        href: "/stars/3",
        cta: `Browse ${totals.threeStar} three-star restaurants`,
        featured: true,
      },
    ],

    awarding: {
      heading: "How a star is awarded",
      intro:
        "Michelin ratings come from full-time, anonymous inspectors — not critics, readers, or the restaurants themselves. The process is deliberately slow and consistent.",
      process: [
        {
          title: "Anonymous inspectors",
          body: "Trained inspectors dine unannounced, book under ordinary names, and always pay their own bill so no restaurant can treat them differently.",
        },
        {
          title: "Many meals, over time",
          body: "Each inspector eats 250+ meals a year, and a rating reflects repeat visits — not a single lucky night in the kitchen.",
        },
        {
          title: "Decided together",
          body: "Stars are agreed unanimously at 'star sessions' with the inspectors, the local editor, and the international director of the guide.",
        },
        {
          title: "Reviewed every year",
          body: "The selection is republished annually, so every starred restaurant is re-judged and stars can be earned, kept, or lost.",
        },
      ],
      criteriaHeading: "The five criteria",
      criteria: [
        "Quality of the ingredients",
        "Mastery of cooking techniques",
        "Harmony of flavours",
        "The personality of the chef, expressed in the cuisine",
        "Consistency — across the whole menu and between visits",
      ],
    },

    timeline: [
      { year: "1900", label: "First Michelin Guide published in France" },
      { year: "1926", label: "The first stars awarded for fine dining" },
      { year: "1931", label: "One-, two-, and three-star hierarchy introduced" },
      { year: "1936", label: "The star criteria are published" },
      { year: "2016", label: "The MICHELIN Plate recommendation added" },
      { year: "2020", label: "The Green Star for sustainability introduced" },
    ],

    beyond: [
      {
        id: "bib",
        title: "Bib Gourmand",
        body: "Good quality, good-value cooking — a great meal at a more moderate price. Named after Bibendum, the Michelin Man. It is not a star, and Orellin tracks starred restaurants only, so Bib Gourmand spots are not counted in the totals above.",
      },
      {
        id: "plate",
        title: "The MICHELIN Plate",
        body: "Simply a good meal: fresh ingredients, carefully prepared. The Plate marks restaurants the inspectors recommend but that don't (yet) hold a star or Bib Gourmand.",
      },
      {
        id: "green",
        title: "Michelin Green Star",
        body: "Highlights restaurants leading on sustainability. It measures a different dimension and can sit alongside culinary stars. This atlas does not yet model Green Star status as a filter or badge.",
      },
    ],
  };
}
