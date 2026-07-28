"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { GooglePlaceUnavailable } from "@/components/google-places/GooglePlaceUnavailable";

type Props = {
  children: ReactNode;
  fallbackReason?: "error" | "load_error";
};

type State = {
  hasError: boolean;
};

/**
 * Isolates Places UI Kit web-component runtime failures so the rest of the
 * restaurant/map UI keeps working.
 */
export class GooglePlaceErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (process.env.NODE_ENV === "development") {
      console.info("[google-places-ui-kit] component error boundary", {
        message: error.message,
        componentStack: info.componentStack?.slice(0, 400),
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <GooglePlaceUnavailable
          reason={this.props.fallbackReason ?? "error"}
        />
      );
    }
    return this.props.children;
  }
}
