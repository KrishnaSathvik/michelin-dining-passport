"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const RestaurantDetailMapClient = dynamic(
  () => import("./RestaurantDetailMapClient"),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-full animate-pulse bg-dp-surface-container"
        role="status"
        aria-label="Loading restaurant map"
      />
    ),
  },
);

type RestaurantDetailMapLazyProps = {
  name: string;
  stars: 1 | 2 | 3;
  latitude: number;
  longitude: number;
};

export function RestaurantDetailMapLazy(
  props: RestaurantDetailMapLazyProps,
) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [nearViewport, setNearViewport] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      const frame = window.requestAnimationFrame(() => setNearViewport(true));
      return () => window.cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: "320px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="h-[19rem] w-full overflow-hidden rounded-[var(--dp-radius-xl)] border border-dp-border bg-dp-surface-low md:h-[23rem] lg:h-[27rem]"
      data-restaurant-detail-map
    >
      {nearViewport ? (
        <RestaurantDetailMapClient {...props} />
      ) : (
        <div
          className="h-full animate-pulse bg-dp-surface-container"
          role="status"
          aria-label="Restaurant map ready to load"
        />
      )}
    </div>
  );
}
