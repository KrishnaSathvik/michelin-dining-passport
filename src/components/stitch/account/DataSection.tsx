"use client";

import { useTransition } from "react";
import { exportCloudAccountData } from "@/app/personal-data/actions";
import { Button } from "@/components/stitch/Button";
import { AccountSection } from "./AccountSection";

type DataSectionProps = {
  onMessage: (message: string, ok: boolean) => void;
};

/** Real export only — no import / fake local backup UI. */
export function DataSection({ onMessage }: DataSectionProps) {
  const [pending, startTransition] = useTransition();

  return (
    <AccountSection
      id="data"
      title="Data & Export"
      description="Download a JSON copy of your profile, personal restaurant records, and collections."
    >
      <div className="flex flex-col gap-4" data-account-section-body="data">
        <p className="font-sans text-[15px] text-dp-ink-muted">
          Export includes cloud Passport data for this account. Import is not
          available from Account settings.
        </p>
        <div>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                const result = await exportCloudAccountData();
                if (!result.ok || !result.payload) {
                  onMessage(result.message ?? "Export failed.", false);
                  return;
                }
                const blob = new Blob(
                  [JSON.stringify(result.payload, null, 2)],
                  { type: "application/json" },
                );
                const url = URL.createObjectURL(blob);
                const anchor = document.createElement("a");
                anchor.href = url;
                anchor.download = "dining-passport-export.json";
                anchor.click();
                URL.revokeObjectURL(url);
                onMessage("Export downloaded.", true);
              });
            }}
          >
            {pending ? "Preparing…" : "Download JSON export"}
          </Button>
        </div>
      </div>
    </AccountSection>
  );
}
