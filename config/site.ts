/**
 * CENTRALIZED SITE CONFIGURATION
 * ------------------------------------------------------------------
 * This is the fallback/reference layer for business information.
 *
 * The AUTHORITATIVE, owner-editable copy of this data lives in Firestore
 * at settings/main (see services/settings.service.ts). This file exists so:
 *   1. Server-rendered metadata (SEO) has a value even before the first
 *      Firestore read resolves / during static generation.
 *   2. TypeScript has a single typed shape (BusinessSettings) that both
 *      the fallback and the live Firestore data must conform to.
 *
 * NEVER hardcode phone numbers, WhatsApp numbers, addresses, or social
 * links anywhere else in the codebase — always read from here or from
 * the live settings service, per Part 7 / Part 24 of the spec.
 *
 * Contact details below are sourced directly from the owner's physical
 * visiting card (Puneet Agarwal). mapsUrl/mapsEmbedUrl/geo are sourced
 * directly from the owner's real Google Maps share link and embed code.
 * ------------------------------------------------------------------
 */

export interface BusinessSettings {
  businessName: string;
  tagline: string;
  description: string;
  phone: string;
  secondaryPhone: string;
  whatsappNumber: string; // digits only, with country code, e.g. "91XXXXXXXXXX" — required by wa.me
  email: string;
  address: string;
  mapsUrl: string;
  mapsEmbedUrl: string;
  geo: { lat: number; lng: number };
  instagram: string;
  facebook: string;
  logoUrl: string;
  logoMarkUrl: string;
  restaurantHours: string; // e.g. "9:00 AM – 11:00 PM"
  restaurantName: string; // the in-house restaurant's own brand name
}

export const fallbackBusinessSettings: BusinessSettings = {
  businessName: "Vrind Vatikaa",
  tagline: "Banquet & Lawn",
  description:
    "Banquet hall and outdoor lawn in Telibagh, Lucknow, for weddings, ring ceremonies, birthdays, corporate and family gatherings — with in-house restaurant and event catering.",
  phone: "+91 91299 06754",
  secondaryPhone: "+91 80094 99135",
  whatsappNumber: "919129906754",
  email: "vrindvatikaa@gmail.com",
  address:
    "VIP Ring Road, Sarpotganj, Dwarakapuri, Telibagh, Lucknow, Uttar Pradesh – 226002",
  mapsUrl: "https://maps.app.goo.gl/8TZKYCvkHBJ8eGXG8?g_st=aw",
  mapsEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d222.61445867487222!2d80.93769035633414!3d26.781645719266773!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399bfb0041a20e21%3A0x2cad35febdbba657!2sVrind%20Vatikaa!5e0!3m2!1sen!2sin!4v1790702592170!5m2!1sen!2sin",
  geo: { lat: 26.781645719266773, lng: 80.93769035633414 }, // Exact — extracted from the owner's Google Maps embed link
  instagram: "vrind_vatikaa",
  facebook: "vrind vatikaa",
  logoUrl: "/brand/logo-full.png",
  logoMarkUrl: "/brand/logo-mark.png",
  restaurantHours: "9:00 AM – 11:00 PM",
  restaurantName: "Ghar Ki Rasoi", // from the owner's printed restaurant menu
};

export const siteConfig = {
  name: fallbackBusinessSettings.businessName,
  tagline: fallbackBusinessSettings.tagline,
  description: fallbackBusinessSettings.description,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.vrindvatikaa.example",
  seoKeywords: [
    "banquet hall in Lucknow",
    "banquet hall Telibagh",
    "wedding venue in Lucknow",
    "lawn for wedding in Lucknow",
    "birthday party venue Lucknow",
    "small event venue Lucknow",
    "party hall Telibagh",
    "event venue Telibagh",
    "restaurant Telibagh",
    "catering Lucknow",
  ],
  capacity: "300–350 guests",
  banquetAreaSqft: 1000,
  lawnAreaSqft: 1500,
} as const;

export const eventTypes = [
  "Wedding",
  "Ring Ceremony",
  "Birthday Party",
  "Corporate Event",
  "Mundan Ceremony",
  "Kitty Party",
  "Decor Party",
  "Other",
] as const;

export type EventType = (typeof eventTypes)[number];

export const inquiryStatuses = [
  "NEW",
  "CONTACTED",
  "FOLLOW_UP",
  "CONFIRMED",
  "CANCELLED",
] as const;

export type InquiryStatus = (typeof inquiryStatuses)[number];
