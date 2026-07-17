import type { DetailedHTMLProps, HTMLAttributes } from "react";

type GmpBaseProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;

type GmpPlaceRequestProps = GmpBaseProps & {
  place?: string;
};

type GmpCompactProps = GmpBaseProps & {
  orientation?: "horizontal" | "vertical";
  "truncation-preferred"?: boolean | "";
};

type GmpAttributionProps = GmpBaseProps & {
  "light-scheme-color"?: "black" | "white" | "gray";
  "dark-scheme-color"?: "black" | "white" | "gray";
};

type GmpMediaProps = GmpBaseProps & {
  "lightbox-preferred"?: boolean | "";
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "gmp-place-details": GmpBaseProps;
      "gmp-place-details-compact": GmpCompactProps;
      "gmp-place-details-place-request": GmpPlaceRequestProps;
      "gmp-place-content-config": GmpBaseProps;
      "gmp-place-all-content": GmpBaseProps;
      "gmp-place-standard-content": GmpBaseProps;
      "gmp-place-media": GmpMediaProps;
      "gmp-place-rating": GmpBaseProps;
      "gmp-place-opening-hours": GmpBaseProps;
      "gmp-place-open-now-status": GmpBaseProps;
      "gmp-place-phone-number": GmpBaseProps;
      "gmp-place-website": GmpBaseProps;
      "gmp-place-summary": GmpBaseProps;
      "gmp-place-review-summary": GmpBaseProps;
      "gmp-place-reviews": GmpBaseProps;
      "gmp-place-type": GmpBaseProps;
      "gmp-place-price": GmpBaseProps;
      "gmp-place-attribution": GmpAttributionProps;
      "gmp-place-accessible-entrance-icon": GmpBaseProps;
    }
  }
}

export {};
