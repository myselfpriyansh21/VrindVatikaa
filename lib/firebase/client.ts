/**
 * FIREBASE CLIENT SDK
 * ------------------------------------------------------------------
 * Safe to import from Client Components. Config values are NEXT_PUBLIC_
 * (not secret — Firebase client config is not a security boundary;
 * Firestore Security Rules + Auth are). See lib/firebase/admin.ts for
 * the server-only privileged counterpart.
 *
 * Initialization is LAZY (only happens the first time getFirebaseAuth()/
 * getFirebaseDb() is actually called from the browser) rather than at
 * module scope. Two reasons:
 *   1. Next.js evaluates "use client" component modules during
 *      server-side prerendering too (to produce the static HTML shell).
 *      Eager initializeApp()/getAuth() at module scope would throw in
 *      any environment where NEXT_PUBLIC_FIREBASE_* isn't set at build
 *      time, crashing the build entirely rather than failing gracefully
 *      at runtime when actually used.
 *   2. It mirrors the same lazy pattern used in lib/firebase/admin.ts,
 *      for consistency.
 * ------------------------------------------------------------------
 */
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

function getFirebaseConfig(): FirebaseOptions {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

function getFirebaseApp() {
  return getApps().length ? getApp() : initializeApp(getFirebaseConfig());
}

let _auth: Auth | undefined;
let _db: Firestore | undefined;

export function getFirebaseAuth(): Auth {
  if (!_auth) _auth = getAuth(getFirebaseApp());
  return _auth;
}

export function getFirebaseDb(): Firestore {
  if (!_db) _db = getFirestore(getFirebaseApp());
  return _db;
}

export function getGoogleAuthProvider() {
  return new GoogleAuthProvider();
}
