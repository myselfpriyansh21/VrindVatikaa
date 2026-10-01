"use client";

import Link from "next/link";
import { Phone, MessageCircle, CalendarCheck, UtensilsCrossed } from "lucide-react";
import { useSettings } from "@/lib/firebase/settings-context";
import { buildGeneralWhatsAppUrl } from "@/lib/whatsapp/message-builder";

/**
 * Fixed bottom action bar for mobile viewports only (Part 9 / Part 29).
 * - Dark glass surface, subtle gold border, gold icons, white labels.
 * - Safe-area aware for notch/gesture-bar devices.
 * - Hidden on /admin routes (separate authenticated app experience) via
 *   conditional mount in the layout that renders this, not here.
 * - Each target is a real navigation/tel/whatsapp link — never JS-only —
 *   so it still works if JS is slow to hydrate.
 */
export function MobileBottomBar({ onCheckAvailability }: { onCheckAvailability: () => void }) {
  const settings = useSettings();
  const whatsappHref = buildGeneralWhatsAppUrl(settings.whatsappNumber);

  const items = [
    {
      key: "call",
      label: "Call",
      icon: Phone,
      as: "a" as const,
      href: `tel:${settings.phone}`,
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      icon: MessageCircle,
      as: "a" as const,
      href: whatsappHref,
      external: true,
    },
    {
      key: "availability",
      label: "Availability",
      icon: CalendarCheck,
      as: "button" as const,
      onClick: onCheckAvailability,
      primary: true,
    },
    {
      key: "restaurant",
      label: "Restaurant",
      icon: UtensilsCrossed,
      as: "link" as const,
      href: "/restaurant",
    },
  ];

  return (
    <nav
      aria-label="Quick actions"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-vrind-white-border bg-vrind-black/95 backdrop-blur-md pb-safe md:hidden"
    >
      <ul className="grid grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          const content = (
            <span className="flex flex-col items-center justify-center gap-1 py-2.5 min-h-12">
              <Icon
                className={`size-5 ${item.primary ? "text-vrind-gold" : "text-vrind-text-secondary"}`}
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <span className={`text-[11px] font-medium ${item.primary ? "text-vrind-gold" : "text-vrind-text-secondary"}`}>
                {item.label}
              </span>
            </span>
          );

          return (
            <li key={item.key}>
              {item.as === "link" ? (
                <Link href={item.href} className="block text-center">
                  {content}
                </Link>
              ) : item.as === "a" ? (
                <a
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className="block text-center"
                >
                  {content}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="block w-full text-center"
                >
                  {content}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
