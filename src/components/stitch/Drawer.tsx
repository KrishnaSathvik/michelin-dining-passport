"use client";

import {
  useEffect,
  useId,
  type ReactNode,
  type MouseEvent,
} from "react";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  side?: "right" | "left";
  footer?: ReactNode;
};

export function Drawer({
  open,
  onClose,
  title,
  children,
  side = "right",
  footer,
}: DrawerProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  const onBackdrop = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[var(--z-drawer-backdrop)] flex"
      style={{
        justifyContent: side === "right" ? "flex-end" : "flex-start",
      }}
      onClick={onBackdrop}
    >
      <div className="absolute inset-0 bg-dp-ink/40" aria-hidden="true" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-[var(--z-drawer)] flex h-full w-full max-w-[var(--dp-drawer-width)] flex-col bg-dp-surface shadow-[var(--dp-shadow-drawer)]"
      >
        <header className="flex h-[var(--dp-header-height)] items-center justify-between border-b border-dp-border px-6">
          <h2 id={titleId} className="dp-headline-sm text-dp-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="dp-meta font-medium text-dp-ink-secondary hover:text-dp-primary"
          >
            Close
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
        {footer ? (
          <footer className="border-t border-dp-border px-6 py-4">{footer}</footer>
        ) : null}
      </aside>
    </div>
  );
}
