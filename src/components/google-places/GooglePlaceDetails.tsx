"use client";

import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { GooglePlaceErrorBoundary } from "@/components/google-places/GooglePlaceErrorBoundary";
import { GooglePlaceSkeleton } from "@/components/google-places/GooglePlaceSkeleton";
import { GooglePlaceUnavailable } from "@/components/google-places/GooglePlaceUnavailable";
import {
  GOOGLE_PLACES_UNAVAILABLE_MESSAGE,
  getGooglePlacesUiKitAvailability,
} from "@/lib/google-places/config";
import {
  loadGooglePlacesUiKit,
  type GooglePlacesLoaderState,
} from "@/lib/google-places/loader";
import { recordGooglePlacesQueryIntent } from "@/lib/google-places/query-intent";
import "@/components/google-places/google-places-ui-kit.css";

type SharedProps = {
  placeId: string | null | undefined;
  restaurantSlug: string;
  page: string;
  /** When false, mount immediately (caller already gated visibility). */
  lazy?: boolean;
  className?: string;
  style?: CSSProperties;
};

function useNearViewport(
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

function PlaceRequest({ placeId }: { placeId: string }) {
  // Ref callback sets the HTML attribute before the upgraded element requests data.
  // Do not pass `place` as a React prop — property setters are enum/object-sensitive.
  return (
    <gmp-place-details-place-request
      ref={(el) => {
        if (!el) return;
        if (el.getAttribute("place") !== placeId) {
          el.setAttribute("place", placeId);
        }
      }}
    />
  );
}

function PlaceMedia({ lightbox = false }: { lightbox?: boolean }) {
  return (
    <gmp-place-media
      ref={(el) => {
        if (!el) return;
        if (lightbox) el.setAttribute("lightbox-preferred", "");
        else el.removeAttribute("lightbox-preferred");
      }}
    />
  );
}

function PlaceAttribution() {
  return (
    <gmp-place-attribution
      ref={(el) => {
        if (!el) return;
        el.setAttribute("light-scheme-color", "gray");
        el.setAttribute("dark-scheme-color", "white");
      }}
    />
  );
}

function FullContentConfig() {
  return (
    <gmp-place-content-config>
      <PlaceMedia lightbox />
      <gmp-place-rating />
      <gmp-place-opening-hours />
      <gmp-place-phone-number />
      <gmp-place-website />
      <gmp-place-summary />
      <gmp-place-review-summary />
      <gmp-place-reviews />
      <PlaceAttribution />
    </gmp-place-content-config>
  );
}

function CompactContentConfig() {
  return (
    <gmp-place-content-config>
      <PlaceMedia />
      <gmp-place-rating />
      <gmp-place-type />
      <gmp-place-price />
      <gmp-place-open-now-status />
      <PlaceAttribution />
    </gmp-place-content-config>
  );
}

function resolveFallbackReason(
  availability: ReturnType<typeof getGooglePlacesUiKitAvailability>,
  loader: GooglePlacesLoaderState,
  placeId: string | null | undefined,
):
  | "disabled"
  | "missing_key"
  | "missing_place_id"
  | "timeout"
  | "load_error"
  | "error"
  | null {
  if (!placeId) return "missing_place_id";
  if (availability.status === "disabled") return "disabled";
  if (availability.status === "missing_key") return "missing_key";
  if (loader.status === "disabled") return "disabled";
  if (loader.status === "missing_key") return "missing_key";
  if (loader.status === "error") {
    if (loader.reason === "timeout") return "timeout";
    return "load_error";
  }
  return null;
}

function PlaceDetailsHost({
  placeId,
  restaurantSlug,
  page,
  componentType,
  children,
  className,
  style,
  onRequestError,
}: {
  placeId: string;
  restaurantSlug: string;
  page: string;
  componentType: "full" | "compact";
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onRequestError: () => void;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const recordedRef = useRef<string | null>(null);

  useEffect(() => {
    if (recordedRef.current === placeId) return;
    recordedRef.current = placeId;
    recordGooglePlacesQueryIntent({
      page,
      componentType,
      restaurantSlug,
      placeId,
    });
  }, [placeId, page, componentType, restaurantSlug]);

  const handleRequestError = useEffectEvent(onRequestError);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const details = host.querySelector(
      componentType === "full"
        ? "gmp-place-details"
        : "gmp-place-details-compact",
    );
    if (!details) return;

    const onError = () => handleRequestError();
    details.addEventListener("gmp-requesterror", onError);
    return () => details.removeEventListener("gmp-requesterror", onError);
  }, [componentType, placeId]);

  return (
    <div
      ref={hostRef}
      className={`mdp-google-places ${className ?? ""}`}
      style={style}
      data-google-places-component={componentType}
      data-restaurant-slug={restaurantSlug}
    >
      {children}
    </div>
  );
}

function CompactElement({
  placeId,
  orientation,
}: {
  placeId: string;
  orientation: "horizontal" | "vertical";
}) {
  return (
    <gmp-place-details-compact
      ref={(el) => {
        if (!el) return;
        // React property assignment rejects string enums; attributes work.
        if (el.getAttribute("orientation") !== orientation) {
          el.setAttribute("orientation", orientation);
        }
        if (!el.hasAttribute("truncation-preferred")) {
          el.setAttribute("truncation-preferred", "");
        }
      }}
      className="mdp-gmp-place-details-compact"
    >
      <PlaceRequest placeId={placeId} />
      <CompactContentConfig />
    </gmp-place-details-compact>
  );
}

export function GooglePlaceDetails({
  placeId,
  restaurantSlug,
  page,
  lazy = true,
  className = "",
  style,
}: SharedProps) {
  const availability = getGooglePlacesUiKitAvailability();
  const [shellRef, nearViewport] = useNearViewport(lazy);
  const [loader, setLoader] = useState<GooglePlacesLoaderState>({
    status: "idle",
  });
  const [requestFailed, setRequestFailed] = useState(false);

  useEffect(() => {
    if (!nearViewport) return;
    if (!placeId) return;
    if (availability.status !== "ready") return;
    let cancelled = false;
    void loadGooglePlacesUiKit().then((next) => {
      if (!cancelled) setLoader(next);
    });
    return () => {
      cancelled = true;
    };
  }, [nearViewport, placeId, availability.status]);

  const early = resolveFallbackReason(availability, loader, placeId);
  if (early === "missing_place_id" || early === "disabled" || early === "missing_key") {
    return (
      <div ref={shellRef}>
        <GooglePlaceUnavailable reason={early} className={className} />
      </div>
    );
  }

  if (!nearViewport) {
    return (
      <div ref={shellRef}>
        <GooglePlaceSkeleton variant="full" className={className} />
      </div>
    );
  }

  if (loader.status === "idle" || loader.status === "loading") {
    return (
      <div ref={shellRef}>
        <GooglePlaceSkeleton variant="full" className={className} />
      </div>
    );
  }

  if (early || requestFailed) {
    return (
      <div ref={shellRef}>
        <GooglePlaceUnavailable
          reason={requestFailed ? "error" : (early ?? "error")}
          className={className}
        />
      </div>
    );
  }

  if (!placeId) {
    return (
      <div ref={shellRef}>
        <GooglePlaceUnavailable reason="missing_place_id" className={className} />
      </div>
    );
  }

  return (
    <div ref={shellRef}>
      <GooglePlaceErrorBoundary>
        <PlaceDetailsHost
          placeId={placeId}
          restaurantSlug={restaurantSlug}
          page={page}
          componentType="full"
          className={className}
          style={{
            width: "100%",
            maxWidth: "400px",
            colorScheme: "light",
            ...style,
          }}
          onRequestError={() => setRequestFailed(true)}
        >
          <gmp-place-details className="mdp-gmp-place-details">
            <PlaceRequest placeId={placeId} />
            <FullContentConfig />
          </gmp-place-details>
        </PlaceDetailsHost>
      </GooglePlaceErrorBoundary>
      <p className="sr-only">{GOOGLE_PLACES_UNAVAILABLE_MESSAGE}</p>
    </div>
  );
}

export function GooglePlaceDetailsCompact({
  placeId,
  restaurantSlug,
  page,
  lazy = false,
  className = "",
  style,
  orientation = "horizontal",
}: SharedProps & { orientation?: "horizontal" | "vertical" }) {
  const availability = getGooglePlacesUiKitAvailability();
  const [shellRef, nearViewport] = useNearViewport(lazy);
  const [loader, setLoader] = useState<GooglePlacesLoaderState>({
    status: "idle",
  });
  const [requestFailed, setRequestFailed] = useState(false);

  useEffect(() => {
    if (!nearViewport) return;
    if (!placeId) return;
    if (availability.status !== "ready") return;
    let cancelled = false;
    void loadGooglePlacesUiKit().then((next) => {
      if (!cancelled) setLoader(next);
    });
    return () => {
      cancelled = true;
    };
  }, [nearViewport, placeId, availability.status]);

  const early = resolveFallbackReason(availability, loader, placeId);
  if (early === "missing_place_id" || early === "disabled" || early === "missing_key") {
    return (
      <div ref={shellRef}>
        <GooglePlaceUnavailable reason={early} className={className} />
      </div>
    );
  }

  if (!nearViewport || loader.status === "idle" || loader.status === "loading") {
    return (
      <div ref={shellRef}>
        <GooglePlaceSkeleton variant="compact" className={className} />
      </div>
    );
  }

  if (early || requestFailed || !placeId) {
    return (
      <div ref={shellRef}>
        <GooglePlaceUnavailable
          reason={
            !placeId
              ? "missing_place_id"
              : requestFailed
                ? "error"
                : (early ?? "error")
          }
          className={className}
        />
      </div>
    );
  }

  return (
    <div ref={shellRef}>
      <GooglePlaceErrorBoundary>
        <PlaceDetailsHost
          placeId={placeId}
          restaurantSlug={restaurantSlug}
          page={page}
          componentType="compact"
          className={className}
          style={{
            width: "100%",
            maxWidth: "500px",
            colorScheme: "light",
            ...style,
          }}
          onRequestError={() => setRequestFailed(true)}
        >
          <CompactElement placeId={placeId} orientation={orientation} />
        </PlaceDetailsHost>
      </GooglePlaceErrorBoundary>
    </div>
  );
}
