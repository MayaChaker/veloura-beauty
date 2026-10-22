"use client";

/**
 * Shown only when the root layout itself fails (for example, the catalogue cannot be read).
 * It replaces the whole document, so it brings its own <html>, <body> and styles: the site's
 * stylesheet and fonts are not loaded here.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          display: "grid",
          placeItems: "center",
          minHeight: "100vh",
          margin: 0,
          padding: 24,
          background: "#f6f2eb",
          color: "#2a231e",
          font: "15px/1.6 'Helvetica Neue', Arial, sans-serif",
        }}
      >
        <title>Something went wrong | Veloura Beauty</title>
        <main style={{ maxWidth: 440 }}>
          <p style={{ letterSpacing: "0.3em", fontFamily: "Georgia, serif" }}>VELOURA</p>
          <h1 style={{ margin: "24px 0 8px", fontFamily: "Georgia, serif", fontWeight: 300 }}>
            The site didn’t load.
          </h1>
          <p style={{ color: "#7d7165" }}>
            The problem is on our side. Please try again in a few minutes.
            {error.digest && ` Reference ${error.digest}.`}
          </p>
          <button
            type="button"
            onClick={retry}
            style={{
              marginTop: 24,
              padding: "14px 28px",
              border: 0,
              background: "#2a231e",
              color: "#fff",
              font: "inherit",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
