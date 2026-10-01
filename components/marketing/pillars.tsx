import Link from "next/link";
import { Building2, Trees, UtensilsCrossed, ArrowRight } from "lucide-react";
import { defaultVenueInfo } from "@/lib/venue-defaults";
import type { VenueInfo } from "@/types/venue";

interface Pillar {
  id: string;
  title: string;
  meta: string;
  description: string;
  icon: typeof Building2;
  cta: { label: string; href: string };
}

function buildPillars(info: VenueInfo): Pillar[] {
  return [
    {
      id: "banquet",
      title: "The Royal Banquet",
      meta: `~${info.banquetAreaSqft} sq ft, air conditioned`,
      description: info.banquetDescription,
      icon: Building2,
      cta: { label: "Enquire about the banquet", href: "/#contact" },
    },
    {
      id: "lawn",
      title: "The Vrind Lawn",
      meta: `~${info.lawnAreaSqft} sq ft, open air`,
      description: info.lawnDescription,
      icon: Trees,
      cta: { label: "Enquire about the lawn", href: "/#contact" },
    },
    {
      id: "restaurant",
      title: "Restaurant & Catering",
      meta: "Pure vegetarian · Multi-cuisine",
      description:
        "Ghar Ki Rasoi, our in-house pure vegetarian restaurant, alongside a separate event catering service with menus customized to your celebration.",
      icon: UtensilsCrossed,
      cta: { label: "View the restaurant", href: "/restaurant" },
    },
  ];
}

/**
 * Borderless editorial layout — numbered entries separated by a single
 * hairline divider rather than a bordered card grid. Each pillar reads
 * like a page in a brochure rather than a SaaS feature tile.
 *
 * TODO: once real venue photography is available, add it alongside each
 * entry (e.g. a photo on one side, copy on the other) — the structure
 * here is already asymmetric-ready for that.
 */
export function Pillars({ venueInfo = defaultVenueInfo }: { venueInfo?: VenueInfo }) {
  const pillars = buildPillars(venueInfo);
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8">
      <p className="text-xs font-medium tracking-[0.25em] text-vrind-text-muted uppercase">
        What We Offer
      </p>
      <h2 className="font-heading mt-2 max-w-md text-3xl text-vrind-text-primary">
        Three ways to hold your celebration
      </h2>

      <div className="mt-12 divide-y divide-vrind-white-border/60 border-t border-vrind-white-border/60">
        {pillars.map((pillar, i) => (
          <Link
            key={pillar.id}
            href={pillar.cta.href}
            id={pillar.id}
            className="group grid grid-cols-1 items-start gap-4 py-9 transition-colors sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-10"
          >
            <span className="font-heading text-sm text-vrind-text-muted sm:w-10">
              0{i + 1}
            </span>

            <div>
              <div className="flex items-center gap-3">
                <pillar.icon className="size-5 text-vrind-gold" strokeWidth={1.5} aria-hidden="true" />
                <h3 className="font-heading text-2xl text-vrind-text-primary">
                  {pillar.title}
                </h3>
              </div>
              <p className="mt-1 text-xs tracking-wide text-vrind-text-muted">{pillar.meta}</p>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-vrind-text-secondary">
                {pillar.description}
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-vrind-text-secondary group-hover:text-vrind-gold sm:justify-self-end">
              {pillar.cta.label}
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
