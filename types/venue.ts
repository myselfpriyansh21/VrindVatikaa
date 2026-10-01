export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide-react icon name
  displayOrder: number;
  published: boolean;
}

export interface FacilityItem {
  id: string;
  name: string;
  chargeable: boolean;
  note: string; // e.g. "Available on request — additional charges apply."
  displayOrder: number;
  published: boolean;
}

export interface VenueInfo {
  aboutText: string;
  banquetDescription: string;
  lawnDescription: string;
  capacityText: string;
  banquetAreaSqft: number;
  lawnAreaSqft: number;
  eventTypes: string[];
}

export interface VirtualTourConfig {
  active: boolean;
  type: "youtube" | "video" | "none";
  url: string;
}
