import type { InquirySubmission } from "@/types/inquiry";
import { format, parseISO } from "date-fns";

export function buildInquiryWhatsAppMessage(
  inquiry: InquirySubmission,
  inquiryId: string
): string {
  const prettyDate = format(parseISO(inquiry.eventDate), "d MMMM yyyy");
  const yn = (v: boolean) => (v ? "Yes" : "No");

  const lines = [
    inquiry.visitRequested
      ? "New Site Visit Request — Vrind Vatikaa"
      : "New Event Inquiry — Vrind Vatikaa",
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

  if (inquiry.visitRequested) {
    lines.push("", "This is a SITE VISIT request - please confirm a time to visit.");
  }

  if (inquiry.message?.trim()) {
    lines.push("", "Additional Message:", inquiry.message.trim());
  }

  lines.push("", `Inquiry ID: ${inquiryId}`);

  return lines.join("\n");
}

export function buildInquiryWhatsAppUrl(
  whatsappNumber: string,
  inquiry: InquirySubmission,
  inquiryId: string
): string {
  const digitsOnly = whatsappNumber.replace(/\D/g, "");
  const text = buildInquiryWhatsAppMessage(inquiry, inquiryId);
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(text)}`;
}

export function buildGeneralWhatsAppUrl(whatsappNumber: string, prefill?: string) {
  const digitsOnly = whatsappNumber.replace(/\D/g, "");
  const text = prefill ?? "Hi, I'd like to know more about Vrind Vatikaa.";
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(text)}`;
}

export function generateInquiryId(): string {
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `VV-${random}`;
}