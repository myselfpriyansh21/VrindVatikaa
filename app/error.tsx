"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

/**
 * Catches any uncaught rendering/data error in the public site (not
 * /admin, which has its own boundary) and shows a calm, branded fallback
 * instead of Next.js's default error screen or a blank page — per the
 * spec's "never silently fail" error-handling principle.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Public site error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-vrind-black px-6 text-center">
      <p className="font-heading text-2xl text-vrind-text-primary">Something went wrong</p>
      <p className="mt-2 max-w-sm text-sm text-vrind-text-secondary">
        We couldn&apos;t load this page. Please try again, or contact us directly
        if the problem continues.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={reset}
          className="flex min-h-12 items-center justify-center gap-2 bg-vrind-gold px-6 text-sm font-semibold text-vrind-black hover:bg-vrind-gold-bright"
        >
          <RefreshCw className="size-4" /> Try Again
        </button>
        <Link
          href="/"
          className="flex min-h-12 items-center justify-center border border-vrind-gold px-6 text-sm font-semibold text-vrind-gold hover:bg-vrind-gold/10"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
