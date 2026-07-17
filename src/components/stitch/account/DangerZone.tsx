"use client";

import { useState } from "react";
import { Button } from "@/components/stitch/Button";
import { AccountSection } from "./AccountSection";
import { DeleteAccountDialog } from "./DeleteAccountDialog";

type DangerZoneProps = {
  onError: (message: string) => void;
};

export function DangerZone({ onError }: DangerZoneProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AccountSection
        id="danger"
        title="Danger Zone"
        description="Irreversible account deletion."
        destructive
      >
        <div
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          data-account-section-body="danger"
        >
          <p className="max-w-xl font-sans text-[15px] text-dp-ink">
            Permanently delete your account and cloud dining records. This cannot
            be undone.
          </p>
          <Button
            type="button"
            variant="secondary"
            className="shrink-0 !border-dp-error/40 !text-dp-error hover:!bg-[color-mix(in_srgb,var(--dp-error)_8%,var(--dp-surface))]"
            onClick={() => setOpen(true)}
          >
            Delete Account
          </Button>
        </div>
      </AccountSection>
      <DeleteAccountDialog
        open={open}
        onClose={() => setOpen(false)}
        onError={onError}
      />
    </>
  );
}
