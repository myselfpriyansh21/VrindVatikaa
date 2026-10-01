/**
 * FIREBASE ADMIN SDK — SERVER ONLY
 * ------------------------------------------------------------------
 * ⚠️ NEVER import this file from a Client Component, a file under
 * components/ that renders in the browser, or anywhere marked "use client".
 * It holds privileged service-account credentials via environment
 * variables that must never reach the browser bundle.
 *
 * Use this only inside:
 *   - app/api/**\/route.ts (Route Handlers)
 *   - Server Components / Server Actions that need privileged Firestore
 *     access or ID token verification.
 *
 * Responsible for:
 *   - Verifying Firebase ID tokens sent from the client (admin route
 *     protection, Part 6/16/33 of the spec).
 *   - Any Firestore write that must bypass/complement client Security
 *     Rules validation (e.g. the public inquiry submission route, which
 *     adds server-side rate limiting and spam checks Firestore Rules
 *     alone can't express).
 * ------------------------------------------------------------------
 */
import { getApps, initializeApp, cert, getApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getAdminApp(): App {
  if (getApps().length) return getApp();

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Private key is stored with literal "\n" sequences in env vars — must be
  // un-escaped before use.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin credentials. Set FIREBASE_PROJECT_ID, " +
        "FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY as server-only " +
        "environment variables (never NEXT_PUBLIC_)."
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

// Lazy accessors rather than top-level consts: Next.js evaluates route
// modules during build-time "page data collection" even for routes that
// are never called, which would otherwise throw if credentials aren't
// present yet (e.g. a local build without .env, or CI without secrets).
// Credentials are only required the first time these are actually used
// at runtime — call these functions, don't cache the result at module
// scope in consuming code.
let _adminAuth: ReturnType<typeof getAuth> | undefined;
let _adminDb: ReturnType<typeof getFirestore> | undefined;

export function getAdminAuth() {
  if (!_adminAuth) _adminAuth = getAuth(getAdminApp());
  return _adminAuth;
}

export function getAdminDb() {
  if (!_adminDb) _adminDb = getFirestore(getAdminApp());
  return _adminDb;
}

/**
 * Verifies a Firebase ID token sent from the client (e.g. via an
 * `Authorization: Bearer <token>` header) and confirms the caller is an
 * authorized admin via custom claims. Throws if invalid/unauthorized.
 *
 * This is the server-side half of the three-layer admin protection model
 * described in the blueprint (§6): client redirect + this check +
 * Firestore Security Rules.
 */
export async function requireAdmin(idToken: string | undefined) {
  if (!idToken) {
    throw new Error("UNAUTHENTICATED");
  }
  const decoded = await getAdminAuth().verifyIdToken(idToken);
  const role = decoded.role as string | undefined;
  if (!role || !["owner", "admin", "staff"].includes(role)) {
    throw new Error("UNAUTHORIZED");
  }
  return decoded;
}
