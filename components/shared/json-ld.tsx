import { siteConfig, type BusinessSettings } from "@/config/site";

/**
 * LocalBusiness structured data for the homepage. Deliberately omits
 * fields we don't have real data for (ratings, awards, priceRange,
 * opening hours for the venue itself) rather than guessing — per spec
 * Part 10/36: "Do not invent ratings, awards, pricing... capacity...
 * certifications." priceRange is intentionally never set, consistent
 * with the site's no-fixed-pricing positioning.
 *
 * Takes `settings` as a prop (fetched server-side via
 * services/public-content.service.ts#getBusinessSettings) rather than
 * importing the static fallback directly, so structured data reflects
 * whatever the owner has actually saved in /admin/settings.
 */
export function LocalBusinessJsonLd({ settings }: { settings: BusinessSettings }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "EventVenue",
    name: settings.businessName,
    description: siteConfig.description,
    url: siteConfig.url,
    telephone: settings.phone,
    email: settings.email,
    image: `${siteConfig.url}/brand/og-image.jpg`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "VIP Ring Road, Sarpotganj, Dwarakapuri, Telibagh",
      addressLocality: "Lucknow",
      addressRegion: "Uttar Pradesh",
      postalCode: "226002",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: settings.geo.lat,
      longitude: settings.geo.lng,
    },
    sameAs: [`https://instagram.com/${settings.instagram}`],
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Converts "9:00 AM" / "11:00 PM" to schema.org-valid 24h "09:00" / "23:00". */
function to24h(value: string): string | null {
  const m = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return null;
  let hours = parseInt(m[1], 10) % 12;
  if (m[3].toUpperCase() === "PM") hours += 12;
  return `${String(hours).padStart(2, "0")}:${m[2]}`;
}

/** Restaurant structured data for /restaurant — includes real opening hours. */
export function RestaurantJsonLd({ settings }: { settings: BusinessSettings }) {
  const [rawOpen, rawClose] = settings.restaurantHours.split("–");
  const opens = (rawOpen && to24h(rawOpen)) || "09:00";
  const closes = (rawClose && to24h(rawClose)) || "23:00";

  const data = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: settings.restaurantName,
    servesCuisine: ["North Indian", "Vegetarian"],
    menu: `${siteConfig.url}/restaurant`,
    telephone: settings.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: "VIP Ring Road, Sarpotganj, Dwarakapuri, Telibagh",
      addressLocality: "Lucknow",
      addressRegion: "Uttar Pradesh",
      postalCode: "226002",
      addressCountry: "IN",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
      ],
      opens,
      closes,
    },
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
