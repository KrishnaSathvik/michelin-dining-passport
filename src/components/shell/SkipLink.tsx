export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[var(--z-skip)] focus:rounded-[var(--dp-radius-md)] focus:bg-dp-primary focus:px-4 focus:py-3 focus:font-sans focus:text-sm focus:font-semibold focus:text-dp-on-primary focus:outline-none"
    >
      Skip to main content
    </a>
  );
}
