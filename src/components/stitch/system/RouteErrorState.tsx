"use client";

import { useEffect, useState } from "react";
import { SystemStateView } from "./SystemStateView";

type RouteErrorStateProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Generic route-level error boundary UI. Does not expose stack traces or
 * provider internals.
 */
export function RouteErrorState({ error, reset }: RouteErrorStateProps) {
  const [pending, setPending] = useState(false);

  useEffect(() => {
    // Keep digest available for support correlation without surfacing details.
    if (error.digest) {
      console.error("[route-error]", error.digest);
    } else {
      console.error("[route-error]", error.name);
    }
  }, [error]);

  return (
    <SystemStateView
      headingLevel={1}
      testId="route-error"
      title="Something went wrong."
      description="This page could not be loaded. Your passport data on this device is unchanged. Try again, or continue browsing elsewhere."
      primaryAction={{
        label: pending ? "Retrying…" : "Retry",
        onClick: () => {
          if (pending) return;
          setPending(true);
          reset();
        },
      }}
      secondaryAction={{ label: "Return home", href: "/" }}
    />
  );
}
