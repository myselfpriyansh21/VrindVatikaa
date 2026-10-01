import type { EventType, InquiryStatus } from "@/config/site";

/** A single entry in an inquiry's simple contact log (Part 20 — kept intentionally simple, not a CRM). */
export interface ContactLogEntry {
  note: string;
  contactedAt: string; // ISO string on the client; Firestore Timestamp server-side
  method?: "call" | "whatsapp" | "other";
}

/** Full inquiry record as stored in Firestore `inquiries/{id}`. */
export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  eventType: EventType;
  eventDate: string; // ISO date string (yyyy-MM-dd)
  guestCount: number;
  cateringRequired: boolean;
  djRequired: boolean;
  decorationRequired: boolean;
  customStageRequired: boolean;
  preferredContactMethod?: "call" | "whatsapp" | "either";
  message: string;
  status: InquiryStatus;
  adminNotes: string;
  contactLog: ContactLogEntry[];
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Shape submitted by the public inquiry form — server assigns id/status/timestamps. */
export type InquirySubmission = Omit<
  Inquiry,
  | "id"
  | "status"
  | "adminNotes"
  | "contactLog"
  | "archived"
  | "createdAt"
  | "updatedAt"
>;
