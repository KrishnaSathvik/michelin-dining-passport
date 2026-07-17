import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { GooglePlacesSpikeClient } from "@/components/google-places/GooglePlacesSpikeClient";

export const metadata: Metadata = {
  title: "Places UI Kit spike (dev)",
  robots: { index: false, follow: false },
};

export default function GooglePlacesSpikePage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <Container className="py-10">
      <p className="font-sans text-xs uppercase tracking-[0.18em] text-ink-muted">
        Development only
      </p>
      <h1 className="mt-2 font-display text-4xl text-ink">
        Google Places UI Kit spike
      </h1>
      <p className="mt-3 max-w-2xl font-sans text-sm leading-relaxed text-ink-secondary">
        Technical spike for five representative restaurants. MapLibre stays the
        map. Google content remains inside Places UI Kit components. This route
        is not linked from production navigation.
      </p>
      <div className="mt-10">
        <GooglePlacesSpikeClient />
      </div>
    </Container>
  );
}
