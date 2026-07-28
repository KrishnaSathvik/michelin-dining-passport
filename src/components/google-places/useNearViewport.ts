"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Defer expensive work (Google Places requests) until the element nears the
 * viewport. Shared by detail-page and grid-card Google media so both gate the
 * same way. When disabled, treats the element as always visible.
 */
export function useNearViewport(
  enabled: boolean,
  rootMargin = "240px 0px",
): [RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [intersected, setIntersected] = useState(false);
  const visible = !enabled || intersected;

  useEffect(() => {
    if (!enabled) return;
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      const frame = window.requestAnimationFrame(() => setIntersected(true));
      return () => window.cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIntersected(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, rootMargin]);

  return [ref, visible];
}
