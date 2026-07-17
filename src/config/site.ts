export const siteConfig = {
  /**
   * Temporary independent product name (plain text only).
   * Do not add Michelin logo, flower mark, or official wordmark styling.
   */
  productName: "Michelin Dining Passport",
  tagline: "An independent atlas of Michelin-starred dining in the United States.",
  description:
    "Browse Michelin-starred restaurants across the United States. Independent and not affiliated with Michelin.",
  dataUpdatedLabel: "Dataset current through July 2026",
  independenceDisclaimer:
    "Independent platform. Not affiliated with, endorsed by, or connected to Michelin or the Michelin Guide.",
  googlePlacesDisclaimer:
    "When enabled, select pages show photos and live place information from Google inside Google’s Places UI Kit. That content remains Google’s; we do not independently verify Google reviews and do not imply Google sponsorship.",
  coverageNote:
    "Michelin does not currently inspect every U.S. state. Absence from this atlas does not mean a region has been reviewed and found without stars.",
  /**
   * Public site origin for canonical URLs, Open Graph, and sitemap.
   * Override with NEXT_PUBLIC_SITE_URL in deployment.
   */
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000",
  nav: [
    { href: "/explore", label: "Explore" },
    { href: "/map", label: "Map" },
    { href: "/about-michelin-stars", label: "Michelin Stars Explained" },
    { href: "/passport", label: "Passport" },
    { href: "/account", label: "Account" },
  ],
} as const;

export function absoluteUrl(path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.siteUrl}${normalized}`;
}
