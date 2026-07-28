import { SystemStateView } from "./SystemStateView";

const tableIcon = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M4 7h16M4 12h16M4 17h16M8 7v10M16 7v10"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Global / route not-found presentation — Stitch EmptyState language.
 */
export function NotFoundState() {
  return (
    <SystemStateView
      headingLevel={1}
      testId="not-found"
      title="This table could not be found."
      description="The page, restaurant, collection, or destination you requested may no longer exist or the link may be incorrect."
      icon={tableIcon}
      primaryAction={{ label: "Explore restaurants", href: "/explore" }}
      secondaryAction={{ label: "Return home", href: "/" }}
    />
  );
}
