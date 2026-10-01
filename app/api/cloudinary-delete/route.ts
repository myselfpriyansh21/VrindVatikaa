import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { cloudinary } from "@/lib/cloudinary/config";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/firebase/session";

/**
 * POST /api/cloudinary-delete
 * Body: { publicId: string }
 *
 * Keeps Cloudinary and Firestore in sync when an admin deletes a gallery
 * image — without this, deleting the Firestore record would silently
 * leave the file orphaned in Cloudinary storage (and counting against
 * the free-tier quota) forever.
 */
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const claims = await verifyAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
  if (!claims) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const publicId = body?.publicId as string | undefined;
  if (!publicId) {
    return NextResponse.json({ error: "Missing publicId." }, { status: 400 });
  }

  try {
    await cloudinary.uploader.destroy(publicId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Cloudinary delete failed:", error);
    // Non-fatal from the admin's perspective — the Firestore record can
    // still be removed even if the Cloudinary cleanup call fails.
    return NextResponse.json({ error: "Cloudinary cleanup failed." }, { status: 500 });
  }
}
