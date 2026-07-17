import type { Metadata } from "next";
import { absoluteUrl, siteConfig } from "@/config/site";

type BuildMetadataInput = {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
};

export function buildPageMetadata({
  title,
  description,
  path,
  noIndex = false,
}: BuildMetadataInput): Metadata {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} · ${siteConfig.productName}`,
      description,
      url,
      siteName: siteConfig.productName,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary",
      title: `${title} · ${siteConfig.productName}`,
      description,
    },
    robots: noIndex ? { index: false, follow: false } : undefined,
  };
}
