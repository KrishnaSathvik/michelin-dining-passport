import type { Metadata } from "next";
import {
  MichelinEducationPage,
  toEducationPageViewModel,
} from "@/components/stitch/education";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "How Michelin Stars Work",
  description:
    "An independent explanation of Michelin star levels, coverage limits, Bib Gourmand, Green Star, and how Dining Passport relates to the Michelin Guide.",
  path: "/about-michelin-stars",
});

export default function AboutMichelinStarsPage() {
  const model = toEducationPageViewModel();
  return <MichelinEducationPage model={model} />;
}
