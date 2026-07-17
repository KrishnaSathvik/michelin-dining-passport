export type AccountSectionId =
  | "profile"
  | "security"
  | "sync"
  | "data"
  | "danger";

export type AccountNavItem = {
  id: AccountSectionId;
  label: string;
  href: string;
  destructive?: boolean;
};

export type AccountProfileModel = {
  email: string | null;
  displayName: string;
  homeCity: string;
  providers: string[];
  createdAt: string | null;
  hasPasswordProvider: boolean;
};

export type PassportSyncPresentation = {
  headline: string;
  detail: string;
  tone: "ok" | "pending" | "error";
};

export type AccountPageModel = {
  profile: AccountProfileModel;
  nav: AccountNavItem[];
  sync: PassportSyncPresentation;
  flash: { kind: "success" | "error"; message: string } | null;
};
