import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { generateInquiryId } from "@/lib/whatsapp/message-builder";
import type { InquirySubmission } from "@/types/inquiry";

const COLLECTION = "inquiries";

/**
 * Very lightweight in-memory rate limiting, keyed by phone number, to
 * complement Firestore Security Rules (which can't easily express "no more
 * than N writes per M minutes"). This is intentionally simple — a small
 * local business does not need a distributed rate-limiter (e.g. Redis) for
 * V1; if the app ever runs across many serverless instances this becomes
 * best-effort rather than exact, which is an acceptable trade-off here.
 */
const recentSubmissions = new Map<string, number>();
const RATE_LIMIT_WINDOW_MS = 2 * 60 * 1000; // 2 minutes

export function isRateLimited(phone: string): boolean {
  const last = recentSubmissions.get(phone);
  const now = Date.now();
  if (last && now - last < RATE_LIMIT_WINDOW_MS) {
    return true;
  }
  recentSubmissions.set(phone, now);
  return false;
}

/**
 * Persists a new inquiry to Firestore. This write happens BEFORE the
 * WhatsApp redirect on the client (Part 14) — the lead is never lost even
 * if the customer abandons the WhatsApp step.
 */
export async function createInquiry(submission: InquirySubmission) {
  const inquiryId = generateInquiryId();

  await getAdminDb()
    .collection(COLLECTION)
    .doc(inquiryId)
    .set({
      ...submission,
      status: "NEW",
      adminNotes: "",
      contactLog: [],
      archived: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

  return inquiryId;
}
