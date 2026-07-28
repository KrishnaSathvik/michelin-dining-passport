"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CollectionMosaic } from "./CollectionMosaic";
import type { CollectionSummary } from "@/lib/passport/collections";
import type { LocalCollection } from "@/lib/passport/types";

type CollectionCardProps = {
  summary: CollectionSummary;
  collection: LocalCollection;
  onRename: (collection: LocalCollection) => void;
  onDelete: (collection: LocalCollection) => void;
};

export function CollectionCard({
  summary,
  collection,
  onRename,
  onDelete,
}: CollectionCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const countLabel = `${summary.restaurantCount} ${
    summary.restaurantCount === 1 ? "restaurant" : "restaurants"
  }`;

  return (
    <article
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[var(--dp-radius-lg)] border border-dp-outline-variant bg-dp-surface transition-shadow motion-safe:hover:shadow-[var(--dp-shadow-hover)]"
      data-collection-card="index"
      data-collection-slug={summary.slug}
    >
      <div className="relative min-w-0">
        <Link
          href={summary.href}
          aria-label={`Open ${summary.name}, ${countLabel}`}
          className="block min-w-0 overflow-hidden"
        >
          <div className="motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.02]">
            <CollectionMosaic
              thumbnails={summary.thumbnails}
              name={summary.name}
              seed={`${summary.id}:${summary.name}`}
              className="rounded-none"
            />
          </div>
        </Link>

        <div className="absolute right-3 top-3 z-10" ref={menuRef}>
          <button
            type="button"
            aria-label={`Actions for ${summary.name}`}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--dp-radius-md)] border border-dp-outline-variant bg-dp-surface/95 font-sans text-lg leading-none text-dp-ink-secondary backdrop-blur-sm hover:bg-dp-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dp-focus"
          >
            <span aria-hidden="true">⋯</span>
          </button>
          {menuOpen ? (
            <div
              role="menu"
              aria-label={`${summary.name} actions`}
              className="absolute right-0 mt-2 w-44 overflow-hidden rounded-[var(--dp-radius-md)] border border-dp-outline-variant bg-dp-surface shadow-[var(--dp-shadow-hover)]"
            >
              <button
                type="button"
                role="menuitem"
                className="block w-full px-4 py-3 text-left font-sans text-[14px] text-dp-ink hover:bg-dp-soft"
                onClick={() => {
                  setMenuOpen(false);
                  onRename(collection);
                }}
              >
                Rename
              </button>
              <button
                type="button"
                role="menuitem"
                className="block w-full px-4 py-3 text-left font-sans text-[14px] text-dp-error hover:bg-dp-soft"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(collection);
                }}
              >
                Delete
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-5">
        <h2 className="font-display text-2xl leading-tight text-dp-primary-deep">
          <Link href={summary.href} className="no-underline hover:text-dp-primary">
            {summary.name}
          </Link>
        </h2>
        {summary.description ? (
          <p className="mt-2 line-clamp-2 font-sans text-sm leading-relaxed text-dp-ink-muted">
            {summary.description}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-sm text-dp-ink-muted">
          <span className="font-medium text-dp-ink-secondary">{countLabel}</span>
          {summary.updatedLabel ? (
            <>
              <span aria-hidden="true">·</span>
              <span>{summary.updatedLabel}</span>
            </>
          ) : null}
        </div>

        <Link
          href={summary.href}
          className="mt-auto inline-flex min-h-11 items-center pt-4 font-sans text-sm font-semibold text-dp-primary hover:underline"
        >
          Open collection
        </Link>
      </div>
    </article>
  );
}
