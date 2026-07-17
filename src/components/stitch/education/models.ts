export type EducationStarCardModel = {
  stars: 1 | 2 | 3;
  title: string;
  summary: string;
  count: number;
  href: string;
  cta: string;
  featured?: boolean;
};

export type EducationPageViewModel = {
  title: string;
  introduction: string;
  independence: string;
  coverage: string;
  starCards: EducationStarCardModel[];
  beyond: Array<{
    id: string;
    title: string;
    body: string;
  }>;
  heroImageSrc: string;
};
