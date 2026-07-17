"use client";

import { useState } from "react";
import { PageContainer } from "@/components/stitch/PageContainer";
import { readMigrationState } from "@/lib/personal-data/migration-state";
import { AccountMobileNavigation } from "./AccountMobileNavigation";
import { AccountNavigation } from "./AccountNavigation";
import { DangerZone } from "./DangerZone";
import { DataSection } from "./DataSection";
import { PassportSyncSection } from "./PassportSyncSection";
import { ProfileSection } from "./ProfileSection";
import { SecuritySection } from "./SecuritySection";
import { ACCOUNT_NAV, toSyncPresentation } from "./adapters";
import type { AccountProfileModel, AccountSectionId } from "./models";

type AccountPageViewProps = {
  profile: AccountProfileModel;
  flash: { kind: "success" | "error"; message: string } | null;
};

export function AccountPageView({ profile, flash }: AccountPageViewProps) {
  const [activeId, setActiveId] = useState<AccountSectionId>("profile");
  const [message, setMessage] = useState<string | null>(flash?.message ?? null);
  const [messageOk, setMessageOk] = useState(flash?.kind !== "error");
  const [migration] = useState(() => readMigrationState());

  const sync = toSyncPresentation(migration);

  return (
    <div data-account-page="true">
    <PageContainer className="py-10 sm:py-14">
      <header className="mb-8 max-w-3xl md:mb-12">
        <h1 className="font-display text-[36px] leading-tight text-dp-ink md:text-[48px]">
          Account settings
        </h1>
        <p className="mt-3 font-sans text-[16px] leading-relaxed text-dp-ink-muted">
          Manage your profile, security, Passport sync, and data export.
        </p>
      </header>

      {message ? (
        <p
          role="status"
          className={`mb-8 rounded-[var(--dp-radius-md)] border px-4 py-3 font-sans text-[14px] ${
            messageOk
              ? "border-dp-primary/20 text-dp-primary"
              : "border-dp-error/30 text-dp-error"
          }`}
        >
          {message}
        </p>
      ) : null}

      <div className="mb-8 md:hidden">
        <AccountMobileNavigation
          items={ACCOUNT_NAV}
          activeId={activeId}
          onNavigate={setActiveId}
        />
      </div>

      <div className="flex flex-col gap-10 md:flex-row md:gap-12 lg:gap-16">
        <AccountNavigation
          items={ACCOUNT_NAV}
          activeId={activeId}
          onNavigate={setActiveId}
        />

        <div className="min-w-0 flex-1 space-y-4">
          <ProfileSection
            profile={profile}
            onMessage={(text, ok) => {
              setMessage(text);
              setMessageOk(ok);
            }}
          />
          <SecuritySection hasPasswordProvider={profile.hasPasswordProvider} />
          <PassportSyncSection sync={sync} />
          <DataSection
            onMessage={(text, ok) => {
              setMessage(text);
              setMessageOk(ok);
            }}
          />
          <DangerZone
            onError={(text) => {
              setMessage(text);
              setMessageOk(false);
            }}
          />
        </div>
      </div>
    </PageContainer>
    </div>
  );
}
