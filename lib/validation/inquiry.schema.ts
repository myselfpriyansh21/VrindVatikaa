import { z } from "zod";
import { eventTypes } from "@/config/site";

/**
 * Single source of truth for inquiry validation.
 * Used by the client form (React Hook Form + zodResolver) AND re-run
 * server-side in the /api/inquiries Route Handler — the client can
 * always be bypassed, so the server never trusts it (Part 14 / Part 33).
 */

// Basic Indian mobile number check: optional +91/91 prefix, then a 10-digit
// number starting 6-9. Intentionally permissive about formatting/spacing.
const indianPhoneRegex = /^(?:\+?91[-\s]?)?[6-9]\d{9}$/;

function isNotPastDate(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateStr);
  return date >= today;
}

export const inquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your full name.")
    .max(100, "Name is too long."),

  phone: z
    .string()
    .trim()
    .regex(indianPhoneRegex, "Please enter a valid 10-digit mobile number."),

  eventType: z.enum(eventTypes, {
    message: "Please select an event type.",
  }),

  eventDate: z
    .string()
    .min(1, "Please select an event date.")
    .refine(isNotPastDate, "Event date cannot be in the past."),

  guestCount: z.coerce
    .number({ message: "Please enter the approximate number of guests." })
    .int()
    .min(1, "Guest count must be at least 1.")
    .max(5000, "Please contact us directly for very large guest counts."),

  cateringRequired: z.boolean(),
  djRequired: z.boolean(),
  decorationRequired: z.boolean(),
  customStageRequired: z.boolean(),

  preferredContactMethod: z.enum(["call", "whatsapp", "either"]).optional(),

  message: z
    .string()
    .trim()
    .max(1000, "Message is too long — please keep it under 1000 characters.")
    .optional()
    .default(""),

  // Honeypot field — real users never fill this (it's visually hidden).
  // If populated, the submission is silently treated as spam (Part 33).
  companyWebsite: z.string().max(0, "Spam detected.").optional().default(""),
});

export type InquiryFormValues = z.infer<typeof inquirySchema>;
