import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/firebase/session";

/**
 * This middleware does a CHEAP presence check only (does the session
 * cookie exist?) — it deliberately does NOT cryptographically verify the
 * cookie, because Firebase Admin SDK's crypto operations are not
 * reliably supported in the Edge runtime middleware typically runs in.
 *
 * The REAL, authoritative verification (signature check, expiry, revocation,
 * role claim check) happens server-side in
 * app/admin/(dashboard)/layout.tsx, which is a Server Component running
 * in the Node.js runtime where the Admin SDK works fully.
 *
 * This middleware exists purely so an unauthenticated visitor gets
 * redirected to /admin/login immediately, without even the dashboard
 * layout's server code executing — a fast, cheap first layer. Treat this
 * as UX polish, not the security boundary; the layout + Firestore
 * Security Rules are the actual boundary (three-layer model, blueprint §6).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";
  if (!isAdminRoute) return NextResponse.next();

  const hasSessionCookie = request.cookies.has(ADMIN_SESSION_COOKIE);
  if (!hasSessionCookie) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
