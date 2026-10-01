"use client";

import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { fallbackBusinessSettings, type BusinessSettings } from "@/config/site";

const SETTINGS_DOC = "settings/main";

export async function getSettings(): Promise<BusinessSettings> {
  const db = getFirebaseDb();
  const snap = await getDoc(doc(db, SETTINGS_DOC));
  if (!snap.exists()) return fallbackBusinessSettings;
  // Merge over the fallback so any field never yet saved still has a
  // sensible value rather than being undefined in the form.
  return { ...fallbackBusinessSettings, ...(snap.data() as Partial<BusinessSettings>) };
}

export async function saveSettings(data: BusinessSettings): Promise<void> {
  const db = getFirebaseDb();
  await setDoc(doc(db, SETTINGS_DOC), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}
