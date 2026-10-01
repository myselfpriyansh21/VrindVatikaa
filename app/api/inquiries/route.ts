import { NextRequest, NextResponse } from "next/server";
import { inquirySchema } from "@/lib/validation/inquiry.schema";
import { createInquiry, isRateLimited } from "@/services/inquiries.service";

/**
 * POST /api/inquiries
 *
 * Public endpoint (no auth required — anyone must be able to submit an
 * inquiry). Security here relies on:
 *   1. Server-side Zod re-validation (never trust client validation alone).
 *   2. Honeypot field check (bots that fill every field get silently
 *      rejected without revealing why, per copy in Part 33).
 *   3. Lightweight per-phone-number rate limiting.
 *   4. Firestore Security Rules as the final backstop, restricting what a
 *      write of this shape is even allowed to contain.
 *
 * This intentionally does NOT expose read/update/delete on inquiries —
 * those exist only in the authenticated admin surface.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const { companyWebsite, ...submission } = parsed.data;

  // Honeypot: a real visitor never sees or fills this field. If it's
  // populated, treat as spam but respond success-shaped so bots don't
  // learn to adapt (silent drop rather than revealing detection).
  if (companyWebsite && companyWebsite.length > 0) {
    return NextResponse.json({ inquiryId: "VV-0000" }, { status: 200 });
  }

  if (isRateLimited(submission.phone)) {
    return NextResponse.json(
      {
        error:
          "We've already received a request from this number recently. Please wait a couple of minutes before submitting again, or reach us directly on WhatsApp.",
      },
      { status: 429 }
    );
  }

  try {
    const inquiryId = await createInquiry(submission);
    return NextResponse.json({ inquiryId }, { status: 201 });
  } catch (error) {
    console.error("Failed to save inquiry:", error);
    return NextResponse.json(
      {
        error:
          "We couldn't save your inquiry right now. Please try again, or contact us directly on WhatsApp/call.",
      },
      { status: 500 }
    );
  }
}
