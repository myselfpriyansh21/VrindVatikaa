"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/shared/contact-actions";
import { useSettings } from "@/lib/firebase/settings-context";
import { defaultVenueInfo } from "@/lib/venue-defaults";

const MAX_SLIDES = 6;
const SLIDE_MS = 5500;

/**
 * Hero with an optional photo slideshow behind the text.
 * `backgroundImages` = URLs of gallery photos the owner starred (featured) in
 * /admin/gallery. With 0 images it falls back to the plain textured backdrop;
 * with 1 it shows a still photo; with 2+ it cross-fades. Users who prefer
 * reduced motion get a still first photo.
 */
export function Hero({
  onCheckAvailability,
  aboutText = defaultVenueInfo.aboutText,
  priceRangeText = defaultVenueInfo.priceRangeText,
  backgroundImages = [],
}: {
  onCheckAvailability: () => void;
  aboutText?: string;
  priceRangeText?: string;
  backgroundImages?: string[];
}) {
  const settings = useSettings();
  const slides = backgroundImages.slice(0, MAX_SLIDES);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setActive((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <section className="relative flex min-h-[88vh] flex-col overflow-hidden border-b border-vrind-white-border/60 bg-vrind-black">
      <div className="absolute inset-0" aria-hidden="true">
        {slides.length > 0 ? (
          <>
            {slides.map((src, i) => (
              <Image
                key={src}
                src={src}
                alt=""
                fill
                sizes="100vw"
                priority={i === 0}
                className={`object-cover transition-opacity duration-[1400ms] ease-in-out ${
                  i === active ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
            {/* Dark overlay so the text stays readable over any photo */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, #0B0B0C 0%, rgba(11,11,12,0.7) 45%, rgba(11,11,12,0.4) 100%)",
              }}
            />
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

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

      <div className="relative mx-auto mt-auto w-full max-w-7xl px-6 pb-16 sm:px-8 sm:pb-20">
        <p className="text-xs font-medium tracking-[0.3em] text-vrind-text-secondary uppercase">
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

        {priceRangeText && <p className="mt-4 text-sm text-vrind-gold">{priceRangeText}</p>}
      </div>
    </section>
  );
}