"use client";

import { useState, useTransition } from "react";
import { updateProfileAction } from "@/app/personal-data/actions";
import { Button } from "@/components/stitch/Button";
import { Input } from "@/components/stitch/Input";
import { AccountSection } from "./AccountSection";
import type { AccountProfileModel } from "./models";

type ProfileSectionProps = {
  profile: AccountProfileModel;
  onMessage: (message: string, ok: boolean) => void;
};

export function ProfileSection({ profile, onMessage }: ProfileSectionProps) {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [homeCity, setHomeCity] = useState(profile.homeCity);
  const [pending, startTransition] = useTransition();

  return (
    <AccountSection
      id="profile"
      title="Profile"
      description="Your account identity. Email cannot be changed here."
    >
      <div className="flex flex-col gap-6" data-account-section-body="profile">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="dp-label-caps text-dp-ink-muted">Email</dt>
            <dd className="mt-2 break-all font-sans text-[16px] text-dp-ink">
              {profile.email ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="dp-label-caps text-dp-ink-muted">Sign-in methods</dt>
            <dd className="mt-2 font-sans text-[16px] text-dp-ink">
              {profile.providers.length
                ? profile.providers.join(", ")
                : "email"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="dp-label-caps text-dp-ink-muted">Member since</dt>
            <dd className="mt-2 font-sans text-[16px] text-dp-ink">
              {profile.createdAt
                ? new Date(profile.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "—"}
            </dd>
          </div>
        </dl>

        <Input
          label="Display name"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          autoComplete="nickname"
        />
        <Input
          label="Home city"
          value={homeCity}
          onChange={(event) => setHomeCity(event.target.value)}
          autoComplete="address-level2"
        />

        <div>
          <Button
            type="button"
            variant="primary"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                const result = await updateProfileAction({
                  displayName,
                  homeCity,
                });
                onMessage(
                  result.ok
                    ? "Profile updated."
                    : (result.message ?? "Update failed."),
                  result.ok,
                );
              });
            }}
          >
            {pending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>
    </AccountSection>
  );
}
