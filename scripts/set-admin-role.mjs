/**
 * scripts/set-admin-role.mjs
 * ------------------------------------------------------------------
 * Run this ONCE per new admin account, from a trusted machine (never
 * from the browser/client). It grants a Firebase Auth user the custom
 * claim { role: "owner" | "admin" | "staff" } that the entire admin
 * authorization system (Firestore Security Rules, session cookies,
 * app/admin layout) checks against.
 *
 * The account must already exist in Firebase Authentication — sign in
 * once at /admin/login first (it will be rejected as unauthorized),
 * then run this script to grant access, then sign in again.
 *
 * Usage:
 *   node scripts/set-admin-role.mjs owner@example.com owner
 *
 * Requires the same server-side env vars as the rest of the app
 * (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) —
 * load them from .env.local first, e.g.:
 *   node --env-file=.env.local scripts/set-admin-role.mjs owner@example.com owner
 * ------------------------------------------------------------------
 */
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const [, , email, roleArg] = process.argv;
const role = roleArg ?? "owner";
const ALLOWED_ROLES = ["owner", "admin", "staff"];

if (!email) {
  console.error("Usage: node scripts/set-admin-role.mjs <email> [role]");
  process.exit(1);
}
if (!ALLOWED_ROLES.includes(role)) {
  console.error(`Role must be one of: ${ALLOWED_ROLES.join(", ")}`);
  process.exit(1);
}

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error(
    "Missing FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY.\n" +
      "Run with: node --env-file=.env.local scripts/set-admin-role.mjs <email> [role]"
  );
  process.exit(1);
}

initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
const auth = getAuth();

const user = await auth.getUserByEmail(email);
await auth.setCustomUserClaims(user.uid, { role });

console.log(`Granted role "${role}" to ${email} (uid: ${user.uid}).`);
console.log("They must sign out and sign in again for the new claim to take effect.");
