import type { VenueInfo } from "@/types/venue";
import { siteConfig } from "@/config/site";

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
  priceRangeText: "", // empty = nothing shown publicly until the owner sets one
};