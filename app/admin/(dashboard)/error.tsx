"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

/**
 * Catches errors within the admin dashboard specifically. Deliberately
 * plain/functional rather than reusing the public site's branded error
 * page — matches the spec's instruction that admin should prioritize
 * usability over decoration.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin dashboard error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-start gap-3 rounded-md border border-vrind-gold-muted/40 bg-vrind-surface p-6">
      <p className="text-sm font-medium text-vrind-text-primary">
        This section failed to load.
      </p>
      <p className="text-xs text-vrind-text-muted">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        onClick={reset}
        className="flex min-h-10 items-center gap-2 border border-vrind-white-border px-4 text-sm text-vrind-text-secondary hover:border-vrind-gold hover:text-vrind-gold"
      >
        <RefreshCw className="size-3.5" /> Retry
      </button>
    </div>
  );
}
