export type AuthBannerKind = "info" | "success" | "error";

export type AuthBannerModel = {
  kind: AuthBannerKind;
  message: string;
};

export type AuthNavLink = {
  href: string;
  label: string;
};
