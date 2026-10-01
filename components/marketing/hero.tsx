"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/shared/contact-actions";
import { useSettings } from "@/lib/firebase/settings-context";
import { defaultVenueInfo } from "@/lib/venue-defaults";

/**
 * Editorial, bottom-weighted hero — the composition of a hospitality
 * brochure cover rather than a centered SaaS-landing block. Content sits
 * in the lower third over a restrained dark textured panel (fine vertical
 * linework, evoking drapery/mandap staging at very low opacity — not a
 * decorative gradient standing in for a photo).
 *
 * TODO: this component is built to take a real photograph directly —
 * once venue photography is supplied, replace the <div className="hero-texture">
 * background with a full-bleed <Image> (fill) of the actual venue and
 * keep the same dark-overlay + bottom-aligned content structure. No
 * fabricated photography is used here in the meantime.
 */
export function Hero({
  onCheckAvailability,
  aboutText = defaultVenueInfo.aboutText,
}: {
  onCheckAvailability: () => void;
  aboutText?: string;
}) {
  const settings = useSettings();
  return (
    <section className="relative flex min-h-[88vh] flex-col overflow-hidden border-b border-vrind-white-border/60 bg-vrind-black">
      {/* Restrained textured backdrop — fine vertical linework fading
          toward the edges, standing in for photography without faking it */}
      <div className="absolute inset-0" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(100deg, var(--vrind-gold) 0px, var(--vrind-gold) 1px, transparent 1px, transparent 64px)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(212,167,44,0.05), transparent 70%)",
          }}
        />
      </div>

      {/* Brand mark — small, corner-anchored, not a giant centerpiece */}
      <div className="relative mx-auto w-full max-w-7xl px-6 pt-8 sm:px-8">
        <Image
          src={settings.logoMarkUrl}
          alt=""
          width={480}
          height={584}
          priority
          className="h-10 w-auto opacity-90"
        />
      </div>

      {/* Content anchored to the lower third */}
      <div className="relative mx-auto mt-auto w-full max-w-7xl px-6 pb-16 sm:px-8 sm:pb-20">
        <p className="text-xs font-medium tracking-[0.3em] text-vrind-text-muted uppercase">
          Telibagh, Lucknow
        </p>

        <h1 className="font-heading mt-4 max-w-xl text-5xl leading-[1.05] text-vrind-text-primary sm:text-6xl">
          {settings.businessName}
          <span className="block text-vrind-gold">{settings.tagline}</span>
        </h1>

        <p className="mt-5 max-w-md text-base leading-relaxed text-vrind-text-secondary">
          {aboutText}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" onClick={onCheckAvailability}>
            Check Availability
          </Button>
          <WhatsAppButton variant="secondary" size="lg" label="WhatsApp" />
        </div>
      </div>
    </section>
  );
}
