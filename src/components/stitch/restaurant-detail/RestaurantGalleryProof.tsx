"use client";

import { useSearchParams } from "next/navigation";
import { RestaurantGallery } from "./RestaurantGallery";
import type {
  RestaurantDetailModel,
  RestaurantGalleryImage,
} from "./models";

/**
 * Fabricated media states for visual QA and e2e. Only mounted when a build
 * opted into proof fixtures, so production never pays for the client-side
 * search-param read (see UI_PROOFS_ENABLED).
 */
const PROOF_GALLERIES: Record<string, RestaurantGalleryImage[]> = {
  "one-image": [
    {
      id: "proof-primary",
      url: "/dev/approved-restaurant-demo.svg",
      alt: "Approved first-party restaurant media demonstration",
      kind: "verified",
    },
  ],
  representative: [
    {
      id: "proof-representative",
      url: "/images/homepage-hero.jpg",
      alt: "Atmospheric dining room",
      kind: "representative",
    },
  ],
  gallery: [
    {
      id: "proof-primary",
      url: "/dev/approved-restaurant-demo.svg",
      alt: "Approved first-party restaurant media demonstration",
      kind: "verified",
      objectPosition: "center",
    },
    {
      id: "proof-detail-left",
      url: "/dev/approved-restaurant-demo.svg#detail-left",
      alt: "Approved first-party restaurant media detail demonstration",
      kind: "verified",
      objectPosition: "left center",
    },
    {
      id: "proof-detail-right",
      url: "/dev/approved-restaurant-demo.svg#detail-right",
      alt: "Approved first-party restaurant media detail demonstration",
      kind: "verified",
      objectPosition: "right center",
    },
  ],
};

export function RestaurantGalleryProof({
  restaurant,
}: {
  restaurant: RestaurantDetailModel;
}) {
  const proof = useSearchParams().get("proof");
  const gallery = proof ? PROOF_GALLERIES[proof] : undefined;

  return (
    <RestaurantGallery
      restaurant={gallery ? { ...restaurant, gallery } : restaurant}
    />
  );
}
