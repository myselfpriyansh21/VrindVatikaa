import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { SettingsProvider } from "@/lib/firebase/settings-context";

/**
 * FONT LOADING STRATEGY
 * ------------------------------------------------------------------
 * Playfair Display + Plus Jakarta Sans are loaded via a standard Google
 * Fonts <link> in <head> below rather than next/font/google.
 *
 * Why: next/font/google fetches font files at BUILD time from
 * fonts.googleapis.com. That works fine on Vercel (which has open
 * internet access) but will fail the build in any sandboxed/offline CI
 * environment without egress to Google's font CDN. A runtime <link> is
 * slightly less optimal (no self-hosted, zero-layout-shift guarantee)
 * but is more portable and builds everywhere.
 *
 * ⚠️ If your deployment environment has open internet access at build
 * time (Vercel does), you may switch back to next/font/google for the
 * small extra performance benefit — this is a deliberate, documented
 * trade-off, not an oversight.
 * ------------------------------------------------------------------
 */

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.seoKeywords],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteConfig.url,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [{ url: "/brand/og-image.jpg", width: 1200, height: 630, alt: siteConfig.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: ["/brand/og-image.jpg"],
  },
  alternates: {
    canonical: siteConfig.url,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-vrind-black text-vrind-text-primary">
        <SettingsProvider>{children}</SettingsProvider>
        <Toaster
          theme="dark"
          position="top-center"
          toastOptions={{
            style: {
              background: "var(--vrind-surface)",
              color: "var(--vrind-text-primary)",
              border: "1px solid var(--vrind-white-border)",
            },
          }}
        />
      </body>
    </html>
  );
}
