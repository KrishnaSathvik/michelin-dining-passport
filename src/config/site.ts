export const siteConfig = {
  /**
   * Independent product name (plain text only).
   * Do not add Michelin logo, flower mark, or official wordmark styling.
   */
  productName: "Orellin",
  /** Display form of the wordmark (header/footer). */
  wordmark: "ORELLIN",
  tagline: "The guide to remarkable dining.",
  description:
    "Discover Michelin-starred restaurants across the United States. Explore by city, cuisine, and distinction, and find official booking options.",
  /** Nav/personal-area label for the private tracking hub (`/passport`). */
  personalAreaName: "My Restaurants",
  dataUpdatedLabel: "Information current through July 2026",
  /** Footer product summary — the single plain-language description of the product. */
  footerDescription:
    "Discover Michelin-starred restaurants across the United States. Explore by city, cuisine, and distinction, learn what you need to know, and book directly.",
  /** The one disclaimer the footer renders. Longer legal context lives on /about and /sources. */
  footerDisclaimer:
    "Orellin is an independent discovery platform and is not affiliated with the Michelin Guide.",
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
    { href: "/about-michelin-stars", label: "Michelin Stars" },
    { href: "/passport", label: "My Restaurants" },
    { href: "/account", label: "Account" },
  ],
} as const;

export function absoluteUrl(path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.siteUrl}${normalized}`;
}
