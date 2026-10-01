import { ParkingCircle, Snowflake, Zap, Music4, UtensilsCrossed, Palette, Sparkles, Circle } from "lucide-react";

/**
 * Venue-information format — label + short description pairs, not a
 * SaaS feature grid of icon cards. Seed content drawn only from facts
 * explicitly provided (spec + visiting card) — used as the fallback
 * whenever Firestore `services`/`facilities` have no published entries
 * yet (e.g. before the owner has added any via /admin/venue).
 */
const seedItems = [
  { name: "AC", description: "Air-conditioned banquet space", icon: Snowflake, chargeable: false },
  { name: "Parking", description: "Guest parking available", icon: ParkingCircle, chargeable: false },
  { name: "Power Backup", description: "Generator/power backup", icon: Zap, chargeable: false },
  { name: "DJ", description: "DJ arrangements for your event", icon: Music4, chargeable: false },
  { name: "Catering", description: "In-house multi-cuisine catering", icon: UtensilsCrossed, chargeable: false },
  { name: "Decoration", description: "Custom decoration options", icon: Palette, chargeable: false },
  { name: "Bridal / Changing Room", description: "Available at an additional charge", icon: Sparkles, chargeable: true },
];

interface CmsService { id: string; name: string; description: string }
interface CmsFacility { id: string; name: string; note: string; chargeable: boolean }

export function FacilitiesServices({
  services,
  facilities,
}: {
  services?: CmsService[];
  facilities?: CmsFacility[];
}) {
  const hasCmsData = (services && services.length > 0) || (facilities && facilities.length > 0);

  const items = hasCmsData
    ? [
        ...(services ?? []).map((s) => ({ name: s.name, description: s.description, icon: Circle, chargeable: false })),
        ...(facilities ?? []).map((f) => ({ name: f.name, description: f.note, icon: Circle, chargeable: f.chargeable })),
      ]
    : seedItems;

  return (
    <section id="services" className="mx-auto max-w-7xl px-6 py-20 sm:px-8">
      <p className="text-xs font-medium tracking-[0.25em] text-vrind-text-muted uppercase">
        At the Venue
      </p>
      <h2 className="font-heading mt-2 max-w-md text-3xl text-vrind-text-primary">
        Services &amp; facilities
      </h2>

      <div className="mt-10 grid grid-cols-1 gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <div key={`${item.name}-${i}`} className="flex gap-3.5">
            <item.icon className="mt-0.5 size-5 shrink-0 text-vrind-gold" strokeWidth={1.5} aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-vrind-text-primary">
                {item.name}
                {item.chargeable && (
                  <span className="ml-2 text-[10px] font-normal tracking-wide text-vrind-text-muted uppercase">
                    Chargeable
                  </span>
                )}
              </p>
              {item.description && (
                <p className="mt-0.5 text-sm text-vrind-text-secondary">{item.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
