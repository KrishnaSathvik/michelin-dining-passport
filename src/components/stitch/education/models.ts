export type EducationStarCardModel = {
  stars: 1 | 2 | 3;
  title: string;
  /** Official Michelin tagline, e.g. "High-quality cooking, worth a stop." */
  summary: string;
  /** Plain-language explanation for travelers. */
  detail: string;
  count: number;
  href: string;
  cta: string;
  featured?: boolean;
};

export type EducationCriterion = {
  title: string;
  body: string;
};

export type EducationTimelineItem = {
  year: string;
  label: string;
};

export type EducationPageViewModel = {
  title: string;
  introduction: string;
  independence: string;
  coverage: string;
  heroImageSrc: string;
  primer: {
    heading: string;
    paragraphs: string[];
  };
  starCards: EducationStarCardModel[];
  awarding: {
    heading: string;
    intro: string;
    process: EducationCriterion[];
    criteriaHeading: string;
    criteria: string[];
  };
  timeline: EducationTimelineItem[];
  beyond: Array<{
    id: string;
    title: string;
    body: string;
  }>;
};
