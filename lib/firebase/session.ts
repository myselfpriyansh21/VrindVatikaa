import "server-only";
import { getAdminAuth } from "@/lib/firebase/admin";

/**
 * ADMIN SESSION COOKIES
 * ------------------------------------------------------------------
 * Why session cookies rather than checking the Firebase ID token
 * directly on every request: ID tokens are short-lived (~1hr) and live
 * in client-side JS memory/localStorage, which Server Components can't
 * read. Firebase session cookies solve this properly — after the client
 * signs in and gets an ID token, we exchange it (server-side, via Admin
 * SDK) for a long-lived, httpOnly, Secure session cookie that:
 *   - JavaScript in the browser can never read (XSS-resistant)
 *   - Server Components CAN read (via next/headers cookies())
 *   - Can be cryptographically verified server-side on every request
 *
 * This is what makes /admin protection genuinely server-side rather
 * than "hidden in the frontend" (spec requirement, Part 16 / §6 of the
 * blueprint's three-layer model).
 * ------------------------------------------------------------------
 */

export const ADMIN_SESSION_COOKIE = "vv_admin_session";
export const SESSION_MAX_AGE_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

const ALLOWED_ROLES = ["owner", "admin", "staff"] as const;
export type AdminRole = (typeof ALLOWED_ROLES)[number];

export interface AdminSessionClaims {
  uid: string;
  email: string | undefined;
  role: AdminRole;
}

/**
 * Exchanges a freshly-obtained Firebase ID token for a session cookie
 * value. Verifies the token AND confirms the caller has an authorized
 * `role` custom claim before minting the cookie — an authenticated
 * Google account alone is not enough; it must be a specifically
 * authorized admin account (see scripts/set-admin-role.mjs).
 */
export async function createAdminSessionCookie(idToken: string): Promise<string> {
  const adminAuth = getAdminAuth();

  // Verify first so we never mint a session cookie for an unauthorized
  // (but otherwise valid) Google account.
  const decoded = await adminAuth.verifyIdToken(idToken);
  const role = decoded.role as string | undefined;
  if (!role || !ALLOWED_ROLES.includes(role as AdminRole)) {
    throw new Error("UNAUTHORIZED");
  }

  return adminAuth.createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_MS });
}

/**
 * Verifies a session cookie value server-side. Returns the decoded admin
 * claims if valid and authorized, or null otherwise. `checkRevoked: true`
 * ensures a revoked session (e.g. owner force-logged-out everywhere) is
 * rejected immediately rather than waiting for cookie expiry.
 */
export async function verifyAdminSession(
  cookieValue: string | undefined
): Promise<AdminSessionClaims | null> {
  if (!cookieValue) return null;

  try {
    const decoded = await getAdminAuth().verifySessionCookie(cookieValue, true);
    const role = decoded.role as string | undefined;
    if (!role || !ALLOWED_ROLES.includes(role as AdminRole)) {
      return null;
    }
    return { uid: decoded.uid, email: decoded.email, role: role as AdminRole };
  } catch {
    // Expired, malformed, or revoked — treat identically to "not logged in".
    return null;
  }
}
