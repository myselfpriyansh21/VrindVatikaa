"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { siteConfig } from "@/config/site";
import type { Faq } from "@/types/faq";

/**
 * Seed FAQ content (Spec Part 23) — every answer here is derived directly
 * from facts already confirmed elsewhere in the spec (capacity, facilities,
 * chargeable bridal room, no-fixed-pricing model). Nothing invented.
 * Used as the fallback whenever Firestore `faqs` has no published entries
 * yet (e.g. before the owner has added any via /admin/faqs) — real data
 * from Firestore takes priority once it exists.
 */
const seedFaqs: { q: string; a: string }[] = [
  {
    q: "What is the maximum capacity?",
    a: `Vrind Vatikaa comfortably accommodates ${siteConfig.capacity} across the banquet hall and lawn, making it well suited to intimate and mid-sized celebrations.`,
  },
  {
    q: "What types of events are hosted?",
    a: "Weddings, ring ceremonies, birthday parties, corporate events, mundan ceremonies, kitty parties, decor parties and other family functions.",
  },
  {
    q: "Is catering available?",
    a: "Yes — we offer multi-cuisine event catering, including live counters, alongside our in-house restaurant.",
  },
  {
    q: "Is DJ available?",
    a: "Yes, DJ services can be arranged as part of your event.",
  },
  {
    q: "Can the stage be customized?",
    a: "Yes, custom stage setups are available based on your event's theme and requirements.",
  },
  {
    q: "Is decoration customizable?",
    a: "Yes, decoration is fully customizable to match your celebration's theme.",
  },
  {
    q: "Is parking available?",
    a: "Yes, parking is available on the premises.",
  },
  {
    q: "Is the venue air conditioned?",
    a: "The indoor banquet hall is air conditioned. The lawn is an open-air outdoor space.",
  },
  {
    q: "Is power backup available?",
    a: "Yes, generator/power backup is available.",
  },
  {
    q: "Is the bridal/changing room available?",
    a: "Yes, a bridal/changing room is available on request.",
  },
  {
    q: "Is the bridal/changing room chargeable?",
    a: "Yes — the bridal/changing room is available on request with an additional charge.",
  },
  {
    q: "How can I get event pricing?",
    a: 'We don\u2019t publish fixed prices, since every event is customized to your needs and budget. Use "Check Availability & Get a Quote" and we\u2019ll share pricing based on your specific requirements.',
  },
  {
    q: "How do I check availability?",
    a: 'Tap "Check Availability & Get a Quote" anywhere on the site, share your event date and details, and our team will confirm availability and pricing with you directly.',
  },
];

export function FaqAccordion({ faqs: cmsFaqs }: { faqs?: Faq[] }) {
  const faqs =
    cmsFaqs && cmsFaqs.length > 0
      ? cmsFaqs.map((f) => ({ q: f.question, a: f.answer }))
      : seedFaqs;

  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-20 sm:px-8">
      <p className="text-xs font-medium tracking-[0.25em] text-vrind-text-muted uppercase">
        Good to Know
      </p>
      <h2 className="font-heading mt-2 text-3xl text-vrind-text-primary">
        Frequently asked questions
      </h2>

      <Accordion.Root type="single" collapsible className="mt-10 divide-y divide-vrind-white-border/60 border-t border-vrind-white-border/60">
        {faqs.map((item, idx) => (
          <Accordion.Item key={idx} value={`item-${idx}`}>
            <Accordion.Header>
              <Accordion.Trigger className="group flex w-full min-h-14 items-center justify-between gap-4 py-4 text-left text-base text-vrind-text-primary">
                {item.q}
                <ChevronDown className="size-4 shrink-0 text-vrind-gold transition-transform group-data-[state=open]:rotate-180" />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="pb-5 pr-8 text-sm leading-relaxed text-vrind-text-secondary">
              {item.a}
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </section>
  );
}
