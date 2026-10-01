import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { cloudinary } from "@/lib/cloudinary/config";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/firebase/session";

/**
 * POST /api/cloudinary-sign
 *
 * Implements the signed-upload flow described in the blueprint (§8) and
 * spec Part 34:
 *   Admin picks a file (browser)
 *     -> POST here for a signature (server verifies admin session first)
 *     -> browser uploads the file DIRECTLY to Cloudinary using that
 *        signature (image bytes never pass through our own server —
 *        keeps this route fast and avoids Vercel payload limits)
 *     -> browser (or a follow-up call) saves the resulting secure_url /
 *        public_id into Firestore.
 *
 * The Cloudinary API secret never leaves this server-only module.
 */
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const claims = await verifyAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);

  if (!claims) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  // `folder` lets the gallery/menu/restaurant admin screens organize
  // uploads (e.g. "gallery", "menu/restaurant", "menu/catering") without
  // giving the client any control over signing parameters that matter
  // for security (timestamp is always server-generated below).
  const folder = typeof body.folder === "string" ? body.folder : "vrind-vatikaa";

  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = { timestamp, folder };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET as string
  );

  return NextResponse.json({
    signature,
    timestamp,
    folder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  });
}
