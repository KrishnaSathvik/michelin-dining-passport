type JsonLdProps = {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
};

/** Renders JSON-LD from server-built objects only (never user HTML). */
export function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      // Trusted structured data from our loaders — not arbitrary HTML.
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
