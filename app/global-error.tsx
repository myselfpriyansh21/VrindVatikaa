"use client";

/**
 * Catches errors thrown by the root layout itself (rare — e.g. a font or
 * provider failing at the very top of the tree). Must render its own
 * <html>/<body> since app/layout.tsx is bypassed when this triggers.
 * Deliberately minimal/inline-styled — it cannot rely on globals.css
 * having loaded successfully.
 */
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0B0B0C",
          color: "#FFFFFF",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <p style={{ fontSize: "20px", marginBottom: "8px" }}>Something went wrong</p>
        <p style={{ fontSize: "14px", color: "#C4C4C7", marginBottom: "24px" }}>
          Please refresh the page, or try again shortly.
        </p>
        <button
          onClick={reset}
          style={{
            background: "#D4A72C",
            color: "#0B0B0C",
            border: "none",
            padding: "12px 24px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try Again
        </button>
      </body>
    </html>
  );
}
