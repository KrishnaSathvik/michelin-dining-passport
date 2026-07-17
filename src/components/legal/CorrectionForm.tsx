"use client";

import { useState, useTransition } from "react";

type SubmitState =
  | { status: "idle" }
  | { status: "success"; id: string }
  | { status: "error"; message: string };

export function CorrectionForm() {
  const [state, setState] = useState<SubmitState>({ status: "idle" });
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      setState({ status: "idle" });
      try {
        const response = await fetch("/api/corrections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            restaurantSlug: String(formData.get("restaurantSlug") || "").trim(),
            restaurantName: String(formData.get("restaurantName") || "").trim(),
            field: String(formData.get("field") || "").trim(),
            currentValue: String(formData.get("currentValue") || "").trim(),
            suggestedValue: String(formData.get("suggestedValue") || "").trim(),
            details: String(formData.get("details") || "").trim(),
            contactEmail: String(formData.get("contactEmail") || "").trim(),
            website: String(formData.get("website") || "").trim(), // honeypot
          }),
        });
        const payload = (await response.json()) as {
          ok?: boolean;
          id?: string;
          error?: string;
        };
        if (!response.ok || !payload.ok) {
          setState({
            status: "error",
            message: payload.error || "Unable to submit right now.",
          });
          return;
        }
        setState({ status: "success", id: payload.id || "received" });
      } catch {
        setState({
          status: "error",
          message: "Network error. Please try again later.",
        });
      }
    });
  }

  if (state.status === "success") {
    return (
      <p className="rounded-sm border border-border bg-bg-deep px-4 py-3 text-sm text-ink">
        Thanks — correction request {state.id} was received for review.
      </p>
    );
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-ink">Restaurant name</span>
          <input
            name="restaurantName"
            required
            maxLength={200}
            className="mt-1 w-full border border-border bg-bg px-3 py-2 text-ink"
          />
        </label>
        <label className="block text-sm">
          <span className="text-ink">Slug (optional)</span>
          <input
            name="restaurantSlug"
            maxLength={200}
            placeholder="addison-san-diego-ca"
            className="mt-1 w-full border border-border bg-bg px-3 py-2 text-ink"
          />
        </label>
      </div>
      <label className="block text-sm">
        <span className="text-ink">Field</span>
        <select
          name="field"
          required
          className="mt-1 w-full border border-border bg-bg px-3 py-2 text-ink"
          defaultValue="address"
        >
          <option value="stars">Stars</option>
          <option value="address">Address</option>
          <option value="website">Website</option>
          <option value="reservation">Reservation link</option>
          <option value="coordinates">Coordinates</option>
          <option value="closed_or_renamed">Closed or renamed</option>
          <option value="other">Other</option>
        </select>
      </label>
      <label className="block text-sm">
        <span className="text-ink">Current value (optional)</span>
        <input
          name="currentValue"
          maxLength={500}
          className="mt-1 w-full border border-border bg-bg px-3 py-2 text-ink"
        />
      </label>
      <label className="block text-sm">
        <span className="text-ink">Suggested correction</span>
        <input
          name="suggestedValue"
          required
          maxLength={500}
          className="mt-1 w-full border border-border bg-bg px-3 py-2 text-ink"
        />
      </label>
      <label className="block text-sm">
        <span className="text-ink">Details</span>
        <textarea
          name="details"
          required
          maxLength={2000}
          rows={4}
          className="mt-1 w-full border border-border bg-bg px-3 py-2 text-ink"
        />
      </label>
      <label className="block text-sm">
        <span className="text-ink">Contact email (optional)</span>
        <input
          name="contactEmail"
          type="email"
          maxLength={200}
          className="mt-1 w-full border border-border bg-bg px-3 py-2 text-ink"
        />
      </label>
      {/* Honeypot for bots — leave empty */}
      <label className="hidden" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      {state.status === "error" ? (
        <p className="text-sm text-burgundy">{state.message}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="border border-ink bg-ink px-4 py-2 text-sm text-bg disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Submit correction"}
      </button>
    </form>
  );
}
