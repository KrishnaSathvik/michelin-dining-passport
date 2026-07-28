"use client";

import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  closeDisabled?: boolean;
  size?: "default" | "wide" | "fullscreen";
};

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  closeDisabled = false,
  size = "default",
}: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    returnFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const dialog = dialogRef.current;
    const focusable =
      dialog?.querySelector<HTMLElement>("[data-dialog-initial-focus]") ??
      dialog?.querySelector<HTMLElement>(
        "input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])",
      );
    focusable?.focus();
    const overlay = overlayRef.current;
    const inerted = Array.from(document.body.children).filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement && element !== overlay,
    );
    const priorInert = inerted.map((element) => element.inert);
    inerted.forEach((element) => {
      element.inert = true;
    });

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !closeDisabled) onClose();
      if (event.key !== "Tab" || !dialog) return;
      const items = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          "input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])",
        ),
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
      inerted.forEach((element, index) => {
        element.inert = priorInert[index];
      });
      returnFocusRef.current?.focus();
    };
  }, [closeDisabled, open, onClose]);

  if (!open) return null;

  const onBackdrop = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !closeDisabled) onClose();
  };

  const dialog = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[var(--z-modal-backdrop)] flex min-w-0 items-end justify-center overflow-x-hidden p-0 sm:items-center sm:p-6"
      onClick={onBackdrop}
    >
      <div className="absolute inset-0 bg-dp-ink/40" aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={`relative z-[var(--z-modal)] flex min-w-0 w-full flex-col overflow-hidden bg-dp-surface shadow-[var(--dp-shadow-drawer)] ${
          size === "fullscreen"
            ? "h-[100dvh] max-h-[100dvh] max-w-none rounded-none sm:h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-2rem)] sm:w-[calc(100vw-2rem)] sm:rounded-[var(--dp-radius-lg)]"
            : size === "wide"
              ? "max-h-[min(92dvh,900px)] max-w-5xl rounded-t-[var(--dp-radius-xl)] sm:max-h-[90dvh] sm:rounded-[var(--dp-radius-lg)]"
              : "max-h-[min(92dvh,860px)] max-w-[var(--dp-modal-width)] rounded-t-[var(--dp-radius-xl)] sm:max-h-[90dvh] sm:rounded-[var(--dp-radius-lg)]"
        }`}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-dp-border px-5 py-4 sm:px-6">
          <div>
            <h2 id={titleId} className="dp-headline-sm text-dp-ink">
              {title}
            </h2>
            {description ? (
              <p
                id={descriptionId}
                className="mt-1 font-sans text-sm text-dp-ink-muted"
              >
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={closeDisabled}
            className="dp-meta inline-flex min-h-11 shrink-0 items-center px-2 font-medium text-dp-ink-secondary hover:text-dp-primary disabled:opacity-50"
          >
            Close
          </button>
        </header>
        <div className="min-w-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-6">
          {children}
        </div>
        {footer ? (
          <footer className="shrink-0 border-t border-dp-border bg-dp-surface px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-6">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  );

  return typeof document === "undefined"
    ? null
    : createPortal(dialog, document.body);
}
