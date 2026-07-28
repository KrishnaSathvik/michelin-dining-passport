"use client";

import {
  getGoogleMapsBrowserKey,
  getGooglePlacesUiKitAvailability,
  GOOGLE_PLACES_UI_KIT_LOAD_TIMEOUT_MS,
} from "./config";

export type GooglePlacesLoaderState =
  | { status: "idle" }
  | { status: "disabled" }
  | { status: "missing_key" }
  | { status: "loading" }
  | { status: "ready" }
  | { status: "error"; reason: "timeout" | "script_failure" | "ssr" | "unknown"; message: string };

type GoogleMapsBootstrap = {
  importLibrary: (library: string) => Promise<unknown>;
};

declare global {
  interface Window {
    google?: {
      maps?: GoogleMapsBootstrap;
    };
  }
}

const SCRIPT_ID = "mdp-google-maps-js-bootstrap";

let loadPromise: Promise<GooglePlacesLoaderState> | null = null;
let cachedState: GooglePlacesLoaderState = { status: "idle" };

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  onTimeout: () => T,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => resolve(onTimeout()), ms);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        window.clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function injectBootstrap(key: string): Promise<void> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.reject(new Error("SSR"));
  }

  if (window.google?.maps?.importLibrary) {
    return Promise.resolve();
  }

  const existing = document.getElementById(SCRIPT_ID);
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("script_failure")),
        { once: true },
      );
      // Already loaded and callback may have run
      if (window.google?.maps?.importLibrary) resolve();
    });
  }

  return new Promise((resolve, reject) => {
    const bootstrap = document.createElement("script");
    bootstrap.id = SCRIPT_ID;
    bootstrap.async = true;
    const nonce = document.querySelector("script[nonce]")?.getAttribute("nonce");
    if (nonce) bootstrap.nonce = nonce;

    // Official Maps JS dynamic library import bootstrap (Places UI Kit requirement).
    // Key is never logged.
    bootstrap.textContent = `(g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=\`https://maps.\${c}apis.com/maps/api/js?\`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({key:${JSON.stringify(key)},v:"weekly"});`;

    bootstrap.onerror = () => reject(new Error("script_failure"));
    document.head.append(bootstrap);

    // Bootstrap defines importLibrary immediately; maps/api/js loads on first importLibrary call.
    if (window.google?.maps?.importLibrary) {
      resolve();
      return;
    }
    reject(new Error("script_failure"));
  });
}

async function loadPlacesLibrary(): Promise<GooglePlacesLoaderState> {
  if (typeof window === "undefined") {
    return {
      status: "error",
      reason: "ssr",
      message: "Google Places UI Kit cannot load during SSR.",
    };
  }

  const availability = getGooglePlacesUiKitAvailability();
  if (availability.status === "disabled") return { status: "disabled" };
  if (availability.status === "missing_key") return { status: "missing_key" };

  const key = getGoogleMapsBrowserKey();
  if (!key) return { status: "missing_key" };

  try {
    await injectBootstrap(key);
    const maps = window.google?.maps;
    if (!maps?.importLibrary) {
      return {
        status: "error",
        reason: "script_failure",
        message: "Maps JavaScript bootstrap did not expose importLibrary.",
      };
    }

    await withTimeout(
      maps.importLibrary("places"),
      GOOGLE_PLACES_UI_KIT_LOAD_TIMEOUT_MS,
      () => {
        throw new Error("timeout");
      },
    );

    return { status: "ready" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    if (message === "timeout") {
      return {
        status: "error",
        reason: "timeout",
        message: "Timed out loading Places UI Kit.",
      };
    }
    if (message === "script_failure" || message.includes("could not load")) {
      return {
        status: "error",
        reason: "script_failure",
        message: "Failed to load the Maps JavaScript API script.",
      };
    }
    return {
      status: "error",
      reason: "unknown",
      message: "Places UI Kit failed to load.",
    };
  }
}

/**
 * Client-only singleton loader for Maps JS + Places UI Kit.
 * Concurrent callers share one in-flight promise; no duplicate script tags.
 */
export function loadGooglePlacesUiKit(): Promise<GooglePlacesLoaderState> {
  if (typeof window === "undefined") {
    return Promise.resolve({
      status: "error",
      reason: "ssr",
      message: "Google Places UI Kit cannot load during SSR.",
    });
  }

  if (cachedState.status === "ready") {
    return Promise.resolve(cachedState);
  }

  if (!loadPromise) {
    cachedState = { status: "loading" };
    loadPromise = loadPlacesLibrary().then((state) => {
      cachedState = state;
      if (state.status !== "ready") {
        // Allow retry after failure
        loadPromise = null;
      }
      return state;
    });
  }

  return loadPromise;
}

/** Test/reset helper — not for production UI. */
export function resetGooglePlacesUiKitLoaderForTests(): void {
  loadPromise = null;
  cachedState = { status: "idle" };
  if (typeof document !== "undefined") {
    document.getElementById(SCRIPT_ID)?.remove();
  }
}

export function getGooglePlacesUiKitLoaderState(): GooglePlacesLoaderState {
  return cachedState;
}
