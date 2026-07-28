import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StitchFoundationClient } from "@/components/stitch/StitchFoundationClient";

export const metadata: Metadata = {
  title: "Stitch foundation (dev)",
  robots: { index: false, follow: false },
};

/**
 * Development-only Stitch component reference.
 * Unavailable in production. Not linked from site navigation.
 */
export default function StitchFoundationPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <StitchFoundationClient />;
}
