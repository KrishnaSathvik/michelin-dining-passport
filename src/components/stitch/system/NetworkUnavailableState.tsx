"use client";

import { SystemStateView } from "./SystemStateView";

type NetworkUnavailableStateProps = {
  onRetry?: () => void;
  title?: string;
  description?: string;
};

/**
 * Application data fetch failure — distinct from Google provider unavailable
 * and HTTP not-found.
 */
export function NetworkUnavailableState({
  onRetry,
  title = "We could not reach Dining Passport.",
  description = "Required data could not be loaded. Check your connection, then try again.",
}: NetworkUnavailableStateProps) {
  return (
    <SystemStateView
      headingLevel={1}
      testId="network-unavailable"
      title={title}
      description={description}
      primaryAction={
        onRetry
          ? { label: "Retry", onClick: onRetry }
          : { label: "Explore restaurants", href: "/explore" }
      }
      secondaryAction={{ label: "Return home", href: "/" }}
    />
  );
}
