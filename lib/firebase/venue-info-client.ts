"use client";

import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type { VenueInfo } from "@/types/venue";
import { defaultVenueInfo } from "@/lib/venue-defaults";

const DOC = "venueInfo/main";

export { defaultVenueInfo };

export async function getVenueInfo(): Promise<VenueInfo> {
  const snap = await getDoc(doc(getFirebaseDb(), DOC));
  return snap.exists() ? { ...defaultVenueInfo, ...(snap.data() as Partial<VenueInfo>) } : defaultVenueInfo;
}

export async function saveVenueInfo(data: VenueInfo): Promise<void> {
  await setDoc(doc(getFirebaseDb(), DOC), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}
