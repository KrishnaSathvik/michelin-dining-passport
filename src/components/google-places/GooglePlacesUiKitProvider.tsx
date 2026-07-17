"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  getGooglePlacesUiKitLoaderState,
  loadGooglePlacesUiKit,
  type GooglePlacesLoaderState,
} from "@/lib/google-places/loader";

type GooglePlacesUiKitContextValue = {
  state: GooglePlacesLoaderState;
};

const GooglePlacesUiKitContext =
  createContext<GooglePlacesUiKitContextValue | null>(null);

export function GooglePlacesUiKitProvider({
  children,
  eager = false,
}: {
  children: ReactNode;
  /** When true, begin loading immediately. Otherwise consumers trigger load. */
  eager?: boolean;
}) {
  const [state, setState] = useState<GooglePlacesLoaderState>(() =>
    getGooglePlacesUiKitLoaderState(),
  );

  useEffect(() => {
    if (!eager) return;
    let cancelled = false;
    void loadGooglePlacesUiKit().then((next) => {
      if (!cancelled) setState(next);
    });
    return () => {
      cancelled = true;
    };
  }, [eager]);

  return (
    <GooglePlacesUiKitContext.Provider value={{ state }}>
      {children}
    </GooglePlacesUiKitContext.Provider>
  );
}

export function useGooglePlacesUiKit(): GooglePlacesUiKitContextValue {
  const ctx = useContext(GooglePlacesUiKitContext);
  if (!ctx) {
    return { state: getGooglePlacesUiKitLoaderState() };
  }
  return ctx;
}
