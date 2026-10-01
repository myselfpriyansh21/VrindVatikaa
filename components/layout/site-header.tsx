"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Phone, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/firebase/settings-context";
import { buildGeneralWhatsAppUrl } from "@/lib/whatsapp/message-builder";

const desktopLinks = [
  { label: "Banquet", href: "/#banquet" },
  { label: "Lawn", href: "/#lawn" },
  { label: "Services", href: "/#services" },
  { label: "Gallery", href: "/#gallery" },
  { label: "Restaurant", href: "/restaurant" },
  { label: "Reviews", href: "/#reviews" },
  { label: "Contact", href: "/#contact" },
];

/** Grouped structure for the mobile panel — matches how a guest actually
 * thinks about the site (explore the venue / dine / plan) rather than a
 * flat list of every anchor link. */
const mobileGroups = [
  {
    heading: "Explore",
    items: [
      { label: "Home", href: "/" },
      { label: "Banquet", href: "/#banquet" },
      { label: "Lawn", href: "/#lawn" },
      { label: "Services & Facilities", href: "/#services" },
      { label: "Gallery", href: "/#gallery" },
    ],
  },
  {
    heading: "Dine",
    items: [
      { label: "Restaurant", href: "/restaurant" },
      { label: "Catering", href: "/restaurant#catering" },
    ],
  },
];

export function SiteHeader({ onCheckAvailability }: { onCheckAvailability: () => void }) {
  const settings = useSettings();
  const [menuOpen, setMenuOpen] = useState(false);

  // Lock body scroll while the full-screen mobile panel is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const whatsappHref = buildGeneralWhatsAppUrl(settings.whatsappNumber);

  return (
    <header className="sticky top-0 z-50 border-b border-vrind-white-border/60 bg-vrind-black/90 backdrop-blur-md pt-safe">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label={`${settings.businessName} — home`}>
          <Image
            src={settings.logoMarkUrl}
            alt=""
            width={480}
            height={584}
            priority
            className="h-9 w-auto"
          />
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="font-heading text-base tracking-wide text-vrind-text-primary">
              {settings.businessName}
            </span>
            <span className="text-[10px] tracking-[0.2em] text-vrind-text-muted uppercase">
              {settings.tagline}
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {desktopLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-vrind-text-secondary transition-colors hover:text-vrind-gold"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Button size="sm" onClick={onCheckAvailability}>
            Check Availability
          </Button>
        </div>

        {/* Mobile: logo + hamburger only — the panel itself carries the CTA */}
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="flex size-11 items-center justify-center text-vrind-text-primary lg:hidden"
        >
          {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Full-screen mobile navigation panel */}
      {menuOpen && (
        <div className="fixed inset-0 top-16 z-40 flex flex-col overflow-y-auto bg-vrind-black pb-safe lg:hidden">
          <nav aria-label="Primary mobile" className="flex-1 px-6 pt-8">
            {mobileGroups.map((group) => (
              <div key={group.heading} className="mb-9">
                <p className="mb-3 text-[11px] font-medium tracking-[0.25em] text-vrind-gold uppercase">
                  {group.heading}
                </p>
                <ul className="space-y-0.5">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className="font-heading flex min-h-12 items-center text-xl text-vrind-text-primary transition-colors hover:text-vrind-gold"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="mb-9">
              <p className="mb-3 text-[11px] font-medium tracking-[0.25em] text-vrind-gold uppercase">
                Plan Your Event
              </p>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onCheckAvailability();
                }}
                className="flex min-h-12 w-full items-center justify-between text-xl text-vrind-text-primary transition-colors hover:text-vrind-gold"
              >
                Check Availability
                <ArrowRight className="size-5" />
              </button>
            </div>
          </nav>

          {/* Contact strip anchored to the bottom of the panel */}
          <div className="border-t border-vrind-white-border/60 px-6 py-6">
            <div className="flex items-center justify-between text-sm text-vrind-text-secondary">
              <a
                href={`tel:${settings.phone}`}
                className="flex items-center gap-2 hover:text-vrind-gold"
              >
                <Phone className="size-4" strokeWidth={1.75} /> Call
              </a>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-vrind-gold"
              >
                <MessageCircle className="size-4" strokeWidth={1.75} /> WhatsApp
              </a>
              <Link
                href="/#contact"
                onClick={() => setMenuOpen(false)}
                className="hover:text-vrind-gold"
              >
                Directions
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
