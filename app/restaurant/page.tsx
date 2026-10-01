import type { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowLeft, Leaf } from "lucide-react";
import { siteConfig } from "@/config/site";
import { WhatsAppButton } from "@/components/shared/contact-actions";
import { MenuSection } from "@/components/menu/menu-section";
import { PageChrome } from "@/components/layout/page-chrome";
import { RestaurantJsonLd } from "@/components/shared/json-ld";
import { getPublishedMenu, getBusinessSettings } from "@/services/public-content.service";

/**
 * Incremental revalidation: the page is served statically (fast) but
 * regenerated in the background at most once a minute, so edits the
 * owner makes in /admin appear on the public site within ~60 seconds
 * without a redeploy.
 */
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Restaurant & Catering",
  description:
    "Ghar Ki Rasoi — pure vegetarian multi-cuisine restaurant and event catering at Vrind Vatikaa, Telibagh, Lucknow. Dine in, or request a custom catering quote for your event.",
  alternates: { canonical: `${siteConfig.url}/restaurant` },
};

export default async function RestaurantPage() {
  const [restaurant, catering, settings] = await Promise.all([
    getPublishedMenu("restaurant"),
    getPublishedMenu("catering"),
    getBusinessSettings(),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-vrind-black pb-20 md:pb-0">
      <RestaurantJsonLd settings={settings} />
      <PageChrome>
        <main className="flex-1">
          {/* Hero */}
          <section className="border-b border-vrind-white-border bg-vrind-black-secondary px-6 py-16 sm:px-8">
            <div className="mx-auto max-w-3xl">
              <p className="text-xs font-medium tracking-[0.25em] text-vrind-text-muted uppercase">
                {siteConfig.name} Presents
              </p>
              <h1 className="font-heading mt-3 text-4xl text-vrind-text-primary sm:text-5xl">
                {settings.restaurantName}
                <span className="mt-1 block text-xl text-vrind-gold">Restaurant &amp; Catering</span>
              </h1>
              <p className="mt-4 max-w-xl text-vrind-text-secondary">
                Home-style, 100% pure vegetarian multi-cuisine dining at Vrind
                Vatikaa, alongside a separate event catering service for your
                celebrations.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-vrind-text-secondary">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-vrind-gold" aria-hidden="true" />
                  Open {settings.restaurantHours}
                </div>
                <div className="flex items-center gap-1.5 border border-green-700 px-2 py-1 text-xs text-green-500">
                  <Leaf className="size-3.5" strokeWidth={2} aria-hidden="true" />
                  100% Pure Vegetarian
                </div>
              </div>
            </div>
          </section>

          {/* Restaurant Menu — prices shown */}
          <section className="mx-auto max-w-5xl px-6 py-16 sm:px-8">
            <p className="text-xs font-medium tracking-[0.25em] text-vrind-text-muted uppercase">
              Dine In
            </p>
            <h2 className="font-heading mt-2 text-3xl text-vrind-text-primary">
              Our Menu
            </h2>
            <p className="mt-2 max-w-xl text-sm text-vrind-text-muted">
              À la carte pricing shown below. Prices are subject to change.
            </p>
            <div className="mt-10">
              <MenuSection
                categories={restaurant.categories}
                items={restaurant.items}
                emptyMessage="Our full menu will be published here shortly."
              />
            </div>
          </section>

          {/* Catering — prices intentionally hidden */}
          <section id="catering" className="border-t border-vrind-white-border bg-vrind-black-secondary px-6 py-16 sm:px-8">
            <div className="mx-auto max-w-5xl">
              <p className="text-xs font-medium tracking-[0.25em] text-vrind-text-muted uppercase">
                Events
              </p>
              <h2 className="font-heading mt-2 text-3xl text-vrind-text-primary">
                Event Catering
              </h2>
              <p className="mt-2 max-w-xl text-sm text-vrind-text-muted">
                Multi-cuisine catering with live counters, customized to your
                event. Pricing is quotation-based.
              </p>
              <div className="mt-10">
                <MenuSection
                  categories={catering.categories}
                  items={catering.items}
                  emptyMessage="Our catering offerings will be published here shortly."
                />
              </div>
              <div className="mt-10">
                <WhatsAppButton
                  size="lg"
                  label="Request Catering Quote"
                  variant="primary"
                />
              </div>
            </div>
          </section>

          {/* Back to main site */}
          <section className="px-6 py-10 sm:px-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-vrind-text-secondary hover:text-vrind-gold"
            >
              <ArrowLeft className="size-4" /> Back to Vrind Vatikaa
            </Link>
          </section>
        </main>
      </PageChrome>
    </div>
  );
}
