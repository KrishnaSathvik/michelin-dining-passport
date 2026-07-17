"use client";

import { signOutAction, updatePasswordFormAction } from "@/app/auth/actions";
import { Button } from "@/components/stitch/Button";
import { PasswordField } from "@/components/stitch/auth/PasswordField";
import { AccountSection } from "./AccountSection";

type SecuritySectionProps = {
  hasPasswordProvider: boolean;
};

export function SecuritySection({ hasPasswordProvider }: SecuritySectionProps) {
  return (
    <AccountSection
      id="security"
      title="Security"
      description="Password and session controls for this account."
    >
      <div className="flex flex-col gap-8" data-account-section-body="security">
        {hasPasswordProvider ? (
          <form
            action={updatePasswordFormAction}
            className="flex flex-col gap-5"
          >
            <PasswordField
              name="password"
              label="New password"
              required
              minLength={8}
              autoComplete="new-password"
              hint="At least 8 characters."
            />
            <div>
              <Button type="submit" variant="secondary">
                Update password
              </Button>
            </div>
          </form>
        ) : (
          <p className="font-sans text-[15px] text-dp-ink-muted">
            This account uses an external sign-in provider. Password updates are
            managed there.
          </p>
        )}

        <div className="border-t border-dp-border pt-6">
          <p className="mb-4 font-sans text-[15px] text-dp-ink-muted">
            Sign out clears your cloud session on this browser. Device-local
            Passport data is not deleted.
          </p>
          <form action={signOutAction}>
            <Button type="submit" variant="secondary">
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </AccountSection>
  );
}
