"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from "react";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  side?: "right" | "left";
  footer?: ReactNode;
  /** Element that opened the drawer — focus returns here on close. */
  returnFocusRef?: RefObject<HTMLElement | null>;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Drawer({
  open,
  onClose,
  title,
  children,
  side = "right",
  footer,
  returnFocusRef,
}: DrawerProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);

  const trapFocus = useCallback((event: KeyboardEvent) => {
    if (event.key !== "Tab" || !panelRef.current) return;
    const nodes = [
      ...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
    ].filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1);
    if (nodes.length === 0) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    const active = document.activeElement as HTMLElement | null;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      trapFocus(event);
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusReturn = returnFocusRef?.current ?? previouslyFocused;
    const closeButton = panelRef.current?.querySelector<HTMLElement>(
      "[data-drawer-close]",
    );
    closeButton?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      focusReturn?.focus?.();
    };
  }, [open, onClose, trapFocus, returnFocusRef]);

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
        ref={panelRef}
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
            data-drawer-close
            onClick={onClose}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-[var(--dp-radius-md)] dp-meta font-medium text-dp-ink-secondary hover:text-dp-primary"
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
