import type { InquirySubmission } from "@/types/inquiry";
import { format, parseISO } from "date-fns";

/**
 * Builds the exact structured WhatsApp message text for a new event
 * inquiry (Part 15 of the spec). This is the ONLY place this format
 * should be defined — every WhatsApp CTA in the app must go through
 * buildInquiryWhatsAppUrl() below rather than constructing its own text.
 */
export function buildInquiryWhatsAppMessage(
  inquiry: InquirySubmission,
  inquiryId: string
): string {
  const prettyDate = format(parseISO(inquiry.eventDate), "d MMMM yyyy");
  const yn = (v: boolean) => (v ? "Yes" : "No");

  const lines = [
    "New Event Inquiry — Vrind Vatikaa",
    "",
    `Name: ${inquiry.name}`,
    `Phone: ${inquiry.phone}`,
    `Event: ${inquiry.eventType}`,
    `Date: ${prettyDate}`,
    `Guests: ${inquiry.guestCount}`,
    `Catering: ${yn(inquiry.cateringRequired)}`,
    `DJ: ${yn(inquiry.djRequired)}`,
    `Decoration: ${yn(inquiry.decorationRequired)}`,
    `Custom Stage: ${yn(inquiry.customStageRequired)}`,
  ];

  if (inquiry.message?.trim()) {
    lines.push("", "Additional Message:", inquiry.message.trim());
  }

  lines.push("", `Inquiry ID: ${inquiryId}`);

  return lines.join("\n");
}

/**
 * Builds a wa.me deep link that opens the CUSTOMER's own WhatsApp app,
 * addressed to the business's WhatsApp number (read from centralized
 * Business Settings — never hardcoded), with the message pre-filled.
 * The customer still has to tap Send themselves (Part 10/14).
 */
export function buildInquiryWhatsAppUrl(
  whatsappNumber: string,
  inquiry: InquirySubmission,
  inquiryId: string
): string {
  const digitsOnly = whatsappNumber.replace(/\D/g, "");
  const text = buildInquiryWhatsAppMessage(inquiry, inquiryId);
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(text)}`;
}

/** Generic "just chat with us" WhatsApp link — used by header/hero/bottom-bar
 * secondary CTAs where no inquiry has been submitted yet. */
export function buildGeneralWhatsAppUrl(whatsappNumber: string, prefill?: string) {
  const digitsOnly = whatsappNumber.replace(/\D/g, "");
  const text = prefill ?? "Hi, I'd like to know more about Vrind Vatikaa.";
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(text)}`;
}

/** Generates a short, human-friendly inquiry ID, e.g. VV-7K2Q. */
export function generateInquiryId(): string {
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `VV-${random}`;
}
