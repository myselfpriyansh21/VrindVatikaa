"use client";

import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type { VirtualTourConfig } from "@/types/venue";

const TOUR_DOC = "virtualTour/main";
export const defaultVirtualTour: VirtualTourConfig = { active: false, type: "none", url: "" };

export async function getVirtualTourConfig(): Promise<VirtualTourConfig> {
  const snap = await getDoc(doc(getFirebaseDb(), TOUR_DOC));
  return snap.exists() ? { ...defaultVirtualTour, ...(snap.data() as Partial<VirtualTourConfig>) } : defaultVirtualTour;
}

export async function saveVirtualTourConfig(data: VirtualTourConfig): Promise<void> {
  await setDoc(doc(getFirebaseDb(), TOUR_DOC), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}
