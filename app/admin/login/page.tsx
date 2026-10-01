"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { signInWithPopup, signOut } from "firebase/auth";
import { Loader2 } from "lucide-react";
import { getFirebaseAuth, getGoogleAuthProvider } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/firebase/settings-context";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/admin";
  const settings = useSettings();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(getFirebaseAuth(), getGoogleAuthProvider());
      const idToken = await result.user.getIdToken();

      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        // Sign the (unauthorized) account back out client-side so a
        // retry doesn't silently reuse a rejected session.
        await signOut(getFirebaseAuth());
        setError(
          data.error ??
            "This account is not authorized to access the admin dashboard."
        );
        setLoading(false);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Sign-in was cancelled or failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-vrind-black px-6">
      <Image
        src={settings.logoMarkUrl}
        alt={settings.businessName}
        width={480}
        height={584}
        priority
        className="h-16 w-auto"
      />

      <h1 className="font-heading mt-6 text-xl text-vrind-text-primary">
        Owner Dashboard
      </h1>
      <p className="mt-1 text-sm text-vrind-text-muted">
        {settings.businessName} — authorized access only
      </p>

      <div className="mt-8 w-full max-w-xs">
        <Button
          onClick={handleGoogleSignIn}
          disabled={loading}
          size="lg"
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Signing in...
            </>
          ) : (
            "Sign in with Google"
          )}
        </Button>

        {error && (
          <p className="mt-4 text-center text-sm text-vrind-error">{error}</p>
        )}
      </div>

      <p className="mt-10 max-w-xs text-center text-xs text-vrind-text-muted">
        This dashboard is for Vrind Vatikaa staff only. If you believe you
        should have access, contact the site administrator.
      </p>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
