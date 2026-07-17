import type { ReservationProvider } from "./types";

const PROVIDER_HOSTS: Array<{
  provider: Exclude<ReservationProvider, "none" | "restaurant_direct" | "other">;
  hosts: string[];
}> = [
  { provider: "resy", hosts: ["resy.com", "www.resy.com"] },
  {
    provider: "tock",
    hosts: ["exploretock.com", "www.exploretock.com", "tock.tock.com"],
  },
  {
    provider: "opentable",
    hosts: ["opentable.com", "www.opentable.com"],
  },
  {
    provider: "sevenrooms",
    hosts: ["sevenrooms.com", "www.sevenrooms.com"],
  },
  {
    provider: "michelin",
    hosts: ["guide.michelin.com", "www.guide.michelin.com"],
  },
];

const DIRECT_PATH_HINTS = [
  "/reservations",
  "/reservation",
  "/reserve",
  "/book",
  "/booking",
  "/tickets",
  "/experiences",
  "/experience",
  "/dining",
];

export function classifyProviderFromUrl(
  url: string | null | undefined,
): ReservationProvider {
  if (!url) return "none";
  let hostname = "";
  let pathname = "";
  try {
    const parsed = new URL(url);
    hostname = parsed.hostname.toLowerCase();
    pathname = parsed.pathname.toLowerCase();
  } catch {
    return "none";
  }

  for (const entry of PROVIDER_HOSTS) {
    if (
      entry.hosts.some(
        (host) => hostname === host || hostname.endsWith(`.${host}`),
      )
    ) {
      return entry.provider;
    }
  }

  if (DIRECT_PATH_HINTS.some((hint) => pathname.includes(hint))) {
    return "restaurant_direct";
  }

  return "other";
}

export function providerDisplayLabel(
  provider: ReservationProvider,
): string | null {
  switch (provider) {
    case "resy":
      return "via Resy";
    case "tock":
      return "via Tock";
    case "opentable":
      return "via OpenTable";
    case "sevenrooms":
      return "via SevenRooms";
    case "restaurant_direct":
      return "via restaurant";
    case "michelin":
      return "Michelin Guide";
    case "other":
      return "via booking partner";
    case "none":
      return null;
    default: {
      const _exhaustive: never = provider;
      return _exhaustive;
    }
  }
}

export function isKnownBookingProvider(
  provider: ReservationProvider,
): boolean {
  return (
    provider === "resy" ||
    provider === "tock" ||
    provider === "opentable" ||
    provider === "sevenrooms" ||
    provider === "restaurant_direct" ||
    provider === "other"
  );
}

export function isProviderHomepage(url: string): boolean {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/\/+$/, "") || "/";
    const host = parsed.hostname.toLowerCase();
    if (host.includes("resy.com") && (path === "/" || path === "/cities")) {
      return true;
    }
    if (
      (host.includes("exploretock.com") || host.includes("opentable.com")) &&
      path === "/"
    ) {
      return true;
    }
    if (host.includes("sevenrooms.com") && path === "/") {
      return true;
    }
    return false;
  } catch {
    return true;
  }
}
