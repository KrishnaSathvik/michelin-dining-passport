"use client";

/**
 * Root failure shell — must not depend on layout providers or Passport state.
 * Minimal independent styles that still read as Dining Passport.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 24px",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
          background: "#fcf9f8",
          color: "#1c1b1b",
          textAlign: "center",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#123b2f",
          }}
        >
          Dining Passport
        </p>
        <h1
          style={{
            margin: "24px 0 0",
            maxWidth: 28 * 16,
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 28,
            fontWeight: 500,
            lineHeight: 1.3,
            color: "#1c1b1b",
          }}
        >
          Something went wrong.
        </h1>
        <p
          style={{
            margin: "12px 0 0",
            maxWidth: 26 * 16,
            fontSize: 16,
            lineHeight: 1.5,
            color: "#414845",
          }}
        >
          The application could not recover from this error. Retry, or return
          home.
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            marginTop: 32,
            justifyContent: "center",
          }}
        >
          <button
            type="button"
            onClick={() => reset()}
            style={{
              height: 48,
              padding: "0 24px",
              border: "none",
              borderRadius: 8,
              background: "#123b2f",
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Retry
          </button>
          {/* Plain anchor: global-error must not depend on Next Link / layout providers. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              height: 48,
              padding: "0 24px",
              border: "1px solid #e5e7e4",
              borderRadius: 8,
              background: "#ffffff",
              color: "#123b2f",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Return home
          </a>
        </div>
      </body>
    </html>
  );
}