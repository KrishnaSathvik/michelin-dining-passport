import type { AccountNavItem, AccountSectionId } from "./models";

type AccountNavigationProps = {
  items: AccountNavItem[];
  activeId: AccountSectionId;
  onNavigate: (id: AccountSectionId) => void;
};

export function AccountNavigation({
  items,
  activeId,
  onNavigate,
}: AccountNavigationProps) {
  return (
    <nav
      aria-label="Account sections"
      className="hidden w-[240px] shrink-0 md:block"
      data-account-nav="desktop"
    >
      <div className="sticky top-[120px]">
        <p className="dp-label-caps mb-3 text-dp-ink-muted">Account</p>
        <ul className="flex flex-col gap-1">
          {items.map((item) => {
            const active = item.id === activeId;
            return (
              <li key={item.id}>
                <a
                  href={item.href}
                  aria-current={active ? "true" : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    onNavigate(item.id);
                    document
                      .getElementById(item.id)
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`flex min-h-11 items-center rounded-[var(--dp-radius-lg)] px-3 py-2.5 font-sans text-[14px] no-underline transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus ${
                    item.destructive
                      ? active
                        ? "bg-[color-mix(in_srgb,var(--dp-error)_12%,var(--dp-surface))] font-semibold text-dp-error"
                        : "text-dp-error hover:bg-[color-mix(in_srgb,var(--dp-error)_8%,var(--dp-surface))]"
                      : active
                        ? "bg-dp-soft font-semibold text-dp-primary"
                        : "text-dp-ink-secondary hover:bg-dp-soft hover:text-dp-primary"
                  }`}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
