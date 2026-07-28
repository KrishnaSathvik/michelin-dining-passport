type IconProps = { className?: string };

const base = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  "aria-hidden": true as const,
};

const stroke = {
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Website / globe. */
export function GlobeIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9" {...stroke} />
      <path d="M3 12h18" {...stroke} />
      <path d="M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18" {...stroke} />
    </svg>
  );
}

/** Directions / navigate arrow. */
export function DirectionsIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3 11l18-8-8 18-2.2-7.8L3 11z" {...stroke} />
    </svg>
  );
}

/** Bookmark (outline). */
export function BookmarkIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6 4h12v16l-6-3.5L6 20V4z" {...stroke} />
    </svg>
  );
}

/** Bookmark (filled) with a check — saved state. */
export function BookmarkCheckIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6 4h12v16l-6-3.5L6 20V4z" fill="currentColor" {...stroke} />
      <path d="M9 9.5l2 2 4-4" stroke="var(--dp-on-primary,#fff)" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/** Calendar. */
export function CalendarIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="4" y="5" width="16" height="15" rx="2" {...stroke} />
      <path d="M4 9h16M8 3v4M16 3v4" {...stroke} />
    </svg>
  );
}

/** Check inside a circle — record/confirm a visit. */
export function CheckCircleIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9" {...stroke} />
      <path d="M8.5 12.5l2.4 2.4 4.6-5.4" {...stroke} />
    </svg>
  );
}
