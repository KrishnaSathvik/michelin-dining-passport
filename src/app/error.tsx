"use client";

import { RouteErrorState } from "@/components/stitch/system";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return <RouteErrorState error={error} reset={reset} />;
}
