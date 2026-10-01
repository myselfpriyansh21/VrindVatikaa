"use client";

import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc as fsUpdateDoc,
  deleteDoc as fsDeleteDoc,
  query,
  orderBy as fsOrderBy,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";

/**
 * Generic Firestore CRUD helpers for the admin CMS screens.
 *
 * These run CLIENT-SIDE, authenticated via the Firebase client SDK's
 * persisted sign-in from /admin/login (Google Sign-In). They are NOT the
 * security boundary — Firestore Security Rules (firestore.rules) are:
 * every write here is only actually permitted if the signed-in user's ID
 * token carries an authorized `role` custom claim, which Firestore
 * verifies server-side regardless of what this client code does. Page
 * *access* is separately gated by the session-cookie check in
 * app/admin/(dashboard)/layout.tsx.
 *
 * Kept intentionally generic (not one bespoke file per collection) so
 * each CMS module (Reviews, FAQs, Menu Items, ...) stays small — see
 * app/admin/(dashboard)/reviews/page.tsx for a usage example.
 */
export async function listCollection<T>(
  collectionName: string,
  orderByField = "displayOrder"
): Promise<(T & { id: string })[]> {
  const db = getFirebaseDb();
  const q = query(collection(db, collectionName), fsOrderBy(orderByField, "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as T) }));
}

export async function createDoc<T extends object>(
  collectionName: string,
  data: T
): Promise<string> {
  const db = getFirebaseDb();
  const ref = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateDocById<T extends object>(
  collectionName: string,
  id: string,
  data: Partial<T>
): Promise<void> {
  const db = getFirebaseDb();
  await fsUpdateDoc(doc(db, collectionName, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteDocById(collectionName: string, id: string): Promise<void> {
  const db = getFirebaseDb();
  await fsDeleteDoc(doc(db, collectionName, id));
}
