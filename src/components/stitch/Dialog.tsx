"use client";

import {
  useEffect,
  useId,
  type ReactNode,
  type MouseEvent,
} from "react";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
}: DialogProps) {
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
      className="fixed inset-0 z-[var(--z-modal-backdrop)] flex items-end justify-center p-0 sm:items-center sm:p-6"
      onClick={onBackdrop}
    >
      <div className="absolute inset-0 bg-dp-ink/40" aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-[var(--z-modal)] flex max-h-[90vh] w-full max-w-[var(--dp-modal-width)] flex-col rounded-t-[var(--dp-radius-xl)] bg-dp-surface shadow-[var(--dp-shadow-drawer)] sm:rounded-[var(--dp-radius-lg)]"
      >
        <header className="flex items-center justify-between border-b border-dp-border px-6 py-4">
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
        <div className="overflow-y-auto px-6 py-6">{children}</div>
        {footer ? (
          <footer className="border-t border-dp-border px-6 py-4">{footer}</footer>
        ) : null}
      </div>
    </div>
  );
}
