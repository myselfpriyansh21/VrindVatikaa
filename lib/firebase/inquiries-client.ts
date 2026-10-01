"use client";

import {
  collection,
  doc,
  getDocs,
  updateDoc,
  query,
  orderBy,
  arrayUnion,
  Timestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type { Inquiry, ContactLogEntry } from "@/types/inquiry";
import type { InquiryStatus } from "@/config/site";

/** Firestore stores createdAt/eventDate as Timestamps; this normalizes
 * them to ISO strings for the client-side Inquiry type. */
function normalize(id: string, data: Record<string, unknown>): Inquiry {
  const toIso = (v: unknown) =>
    v instanceof Timestamp ? v.toDate().toISOString() : (v as string) ?? "";

  return {
    id,
    name: (data.name as string) ?? "",
    phone: (data.phone as string) ?? "",
    eventType: (data.eventType as Inquiry["eventType"]) ?? "Other",
    eventDate: toIso(data.eventDate),
    guestCount: (data.guestCount as number) ?? 0,
    cateringRequired: !!data.cateringRequired,
    djRequired: !!data.djRequired,
    decorationRequired: !!data.decorationRequired,
    customStageRequired: !!data.customStageRequired,
    message: (data.message as string) ?? "",
    status: (data.status as Inquiry["status"]) ?? "NEW",
    adminNotes: (data.adminNotes as string) ?? "",
    contactLog: (data.contactLog as ContactLogEntry[]) ?? [],
    archived: !!data.archived,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

export async function listInquiries(): Promise<Inquiry[]> {
  const db = getFirebaseDb();
  const q = query(collection(db, "inquiries"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => normalize(d.id, d.data()));
}

export async function setInquiryStatus(id: string, status: InquiryStatus) {
  const db = getFirebaseDb();
  await updateDoc(doc(db, "inquiries", id), { status, updatedAt: Timestamp.now() });
}

export async function setInquiryArchived(id: string, archived: boolean) {
  const db = getFirebaseDb();
  await updateDoc(doc(db, "inquiries", id), { archived, updatedAt: Timestamp.now() });
}

/** Appends one simple contact-log entry — kept deliberately lightweight,
 * not a full CRM (spec Part 20). */
export async function addContactLogEntry(id: string, note: string, method: ContactLogEntry["method"]) {
  const db = getFirebaseDb();
  const entry: ContactLogEntry = { note, method, contactedAt: new Date().toISOString() };
  await updateDoc(doc(db, "inquiries", id), {
    contactLog: arrayUnion(entry),
    updatedAt: Timestamp.now(),
  });
}
