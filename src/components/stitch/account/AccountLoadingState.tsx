export function AccountLoadingState() {
  return (
    <div
      className="mx-auto w-full max-w-[var(--dp-content-max)] px-[var(--dp-margin-mobile)] py-16 md:px-[var(--dp-margin-desktop)]"
      data-account-loading="true"
      role="status"
      aria-live="polite"
    >
      <div className="h-10 w-64 animate-pulse rounded bg-dp-soft" />
      <div className="mt-4 h-4 w-full max-w-md animate-pulse rounded bg-dp-soft" />
      <div className="mt-12 grid gap-8 md:grid-cols-[240px_minmax(0,1fr)]">
        <div className="hidden h-56 animate-pulse rounded-[var(--dp-radius-lg)] bg-dp-soft md:block" />
        <div className="space-y-6">
          <div className="h-40 animate-pulse rounded-[var(--dp-radius-xl)] bg-dp-soft" />
          <div className="h-40 animate-pulse rounded-[var(--dp-radius-xl)] bg-dp-soft" />
        </div>
      </div>
      <span className="sr-only">Loading account settings</span>
    </div>
  );
}
