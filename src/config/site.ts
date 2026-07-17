export const siteConfig = {
  productName: "Michelin Dining Passport",
  tagline: "An independent atlas of Michelin-starred dining in the United States.",
  description:
    "Browse Michelin-starred restaurants across the United States. Independent and not affiliated with Michelin.",
  dataUpdatedLabel: "Dataset current through July 2026",
  independenceDisclaimer:
    "Independent platform. Not affiliated with, endorsed by, or connected to Michelin or the Michelin Guide.",
  coverageNote:
    "Michelin does not currently inspect every U.S. state. Absence from this atlas does not mean a region has been reviewed and found without stars.",
  nav: [
    { href: "/explore", label: "Explore" },
    { href: "/map", label: "Map" },
    { href: "/#michelin-stars", label: "Michelin Stars Explained" },
    { href: "/#passport", label: "Passport" },
  ],
} as const;
