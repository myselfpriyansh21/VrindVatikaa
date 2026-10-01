import type { VenueInfo } from "@/types/venue";
import { siteConfig } from "@/config/site";

/**
 * Defaults to the exact copy that was previously hardcoded in
 * Hero.tsx / Pillars.tsx — so both the admin form and the public
 * server-rendered pages start from what's actually live, not blank,
 * until the owner saves real content via /admin/venue.
 *
 * Shared (no "use client"/"server-only" boundary) so it can be imported
 * from both lib/firebase/venue-info-client.ts (client CMS form) and
 * services/public-content.service.ts (server-rendered public pages)
 * without crossing a client/server module boundary either way.
 */
export const defaultVenueInfo: VenueInfo = {
  aboutText:
    `A banquet hall and lawn for weddings, ring ceremonies, birthdays and corporate gatherings — ${siteConfig.capacity}, with an in-house restaurant and event catering.`,
  banquetDescription:
    "An indoor hall for weddings, ring ceremonies, birthdays and corporate functions, seating small and medium-sized gatherings.",
  lawnDescription:
    "An outdoor lawn for sangeet, wedding functions, birthdays and family gatherings, with room for custom decor and staging.",
  capacityText: siteConfig.capacity,
  banquetAreaSqft: siteConfig.banquetAreaSqft,
  lawnAreaSqft: siteConfig.lawnAreaSqft,
  eventTypes: [],
};
