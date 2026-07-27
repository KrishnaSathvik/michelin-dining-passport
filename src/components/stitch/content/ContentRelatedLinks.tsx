import Link from "next/link";

type RelatedLink = {
  href: string;
  label: string;
};

type ContentRelatedLinksProps = {
  links: RelatedLink[];
};

export function ContentRelatedLinks({ links }: ContentRelatedLinksProps) {
  return (
    <nav aria-label="Also useful" className="border-t border-dp-border pt-8">
      <p className="dp-meta font-medium text-dp-ink-muted">Also useful</p>
      <ul className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="dp-meta font-medium text-dp-primary underline underline-offset-4"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
