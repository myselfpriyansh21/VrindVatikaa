import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import { serializeFirestoreData } from "@/lib/firebase/serialize";
import type { Faq } from "@/types/faq";
import { fallbackBusinessSettings, type BusinessSettings } from "@/config/site";
import type { Review } from "@/types/review";
import type { GalleryCategory, GalleryImage } from "@/types/gallery";
import type { VenueInfo } from "@/types/venue";
import { defaultVenueInfo } from "@/lib/venue-defaults";
import type { MenuCategory, MenuItem, MenuContext } from "@/types/menu";

/**
 * Server-side reads (Admin SDK, bypasses Security Rules by design — this
 * is trusted server code, not a public API) for the homepage's Server
 * Component. Falls back to an empty array on any error (e.g. Firebase
 * not configured in this environment) so the public site never crashes
 * — the components themselves have seed/fallback content for that case.
 */
export async function getPublishedFaqs(): Promise<(Faq & { id: string })[]> {
  try {
    const snap = await getAdminDb()
      .collection("faqs")
      .where("published", "==", true)
      .orderBy("displayOrder", "asc")
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...serializeFirestoreData(d.data() as Omit<Faq, "id">) }));
  } catch {
    return [];
  }
}

export async function getPublishedReviews(): Promise<(Review & { id: string })[]> {
  try {
    const snap = await getAdminDb()
      .collection("reviews")
      .where("published", "==", true)
      .orderBy("displayOrder", "asc")
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...serializeFirestoreData(d.data() as Omit<Review, "id">) }));
  } catch {
    return [];
  }
}

/**
 * Fetches published categories + items for a given menu context
 * (restaurant or catering). Categories with context "both" are included
 * in either fetch — matches the admin CategoryManager's filtering logic.
 * Falls back to empty arrays on any error so the public page never
 * crashes if Firebase isn't configured in a given environment.
 */
export async function getPublishedMenu(context: Exclude<MenuContext, "both">): Promise<{
  categories: (MenuCategory & { id: string })[];
  items: (MenuItem & { id: string })[];
}> {
  try {
    const db = getAdminDb();
    const [catsSnap, itemsSnap] = await Promise.all([
      db.collection("menuCategories").where("published", "==", true).get(),
      db
        .collection("menuItems")
        .where("context", "==", context)
        .where("published", "==", true)
        .get(),
    ]);

    const categories = catsSnap.docs
      .map((d) => ({ id: d.id, ...serializeFirestoreData(d.data() as Omit<MenuCategory, "id">) }))
      .filter((c) => c.context === context || c.context === "both")
      .sort((a, b) => a.displayOrder - b.displayOrder);

    const items = itemsSnap.docs
      .map((d) => ({ id: d.id, ...serializeFirestoreData(d.data() as Omit<MenuItem, "id">) }))
      .sort((a, b) => a.displayOrder - b.displayOrder);

    return { categories, items };
  } catch {
    return { categories: [], items: [] };
  }
}

/**
 * Fetches published gallery categories + images for the homepage gallery
 * section. Falls back to empty on error so the public page never crashes.
 */
export async function getPublishedGallery(): Promise<{
  categories: (GalleryCategory & { id: string })[];
  images: (GalleryImage & { id: string })[];
}> {
  try {
    const db = getAdminDb();
    const [catsSnap, imgsSnap] = await Promise.all([
      db.collection("galleryCategories").where("published", "==", true).get(),
      db.collection("galleryImages").where("published", "==", true).get(),
    ]);

    const categories = catsSnap.docs
      .map((d) => ({ id: d.id, ...serializeFirestoreData(d.data() as Omit<GalleryCategory, "id">) }))
      .sort((a, b) => a.displayOrder - b.displayOrder);

    const images = imgsSnap.docs
      .map((d) => ({ id: d.id, ...serializeFirestoreData(d.data() as Omit<GalleryImage, "id">) }))
      .sort((a, b) => a.displayOrder - b.displayOrder);

    return { categories, images };
  } catch {
    return { categories: [], images: [] };
  }
}

export async function getPublishedServices(): Promise<{ id: string; name: string; description: string; displayOrder: number }[]> {
  try {
    const snap = await getAdminDb().collection("services").where("published", "==", true).get();
    return snap.docs
      .map((d) => ({ id: d.id, ...serializeFirestoreData(d.data() as { name: string; description: string; displayOrder: number }) }))
      .sort((a, b) => a.displayOrder - b.displayOrder);
  } catch {
    return [];
  }
}

export async function getPublishedFacilities(): Promise<
  { id: string; name: string; note: string; chargeable: boolean; displayOrder: number }[]
> {
  try {
    const snap = await getAdminDb().collection("facilities").where("published", "==", true).get();
    return snap.docs
      .map((d) => ({ id: d.id, ...serializeFirestoreData(d.data() as { name: string; note: string; chargeable: boolean; displayOrder: number }) }))
      .sort((a, b) => a.displayOrder - b.displayOrder);
  } catch {
    return [];
  }
}

/**
 * Server-side read of the live Business Settings document, merged over
 * the fallback config so any field never yet saved by the owner still
 * has a sensible value. Used by server-rendered pages (restaurant,
 * privacy, JSON-LD) — client components use the SettingsProvider context
 * (lib/firebase/settings-context.tsx) instead, which reads the same
 * document via the client SDK.
 */
export async function getBusinessSettings(): Promise<BusinessSettings> {
  try {
    const snap = await getAdminDb().doc("settings/main").get();
    if (!snap.exists) return fallbackBusinessSettings;
    return { ...fallbackBusinessSettings, ...serializeFirestoreData(snap.data() as Partial<BusinessSettings>) };
  } catch {
    return fallbackBusinessSettings;
  }
}

/** Returns the virtual tour config only if it's genuinely usable; otherwise null (slot renders nothing). */
export async function getVirtualTour(): Promise<{ type: "youtube" | "video"; url: string } | null> {
  try {
    const snap = await getAdminDb().doc("virtualTour/main").get();
    if (!snap.exists) return null;
    const d = snap.data() as { active?: boolean; type?: string; url?: string };
    if (!d.active || !d.url || (d.type !== "youtube" && d.type !== "video")) return null;
    return { type: d.type, url: d.url };
  } catch {
    return null;
  }
}

/**
 * Server-side read of venueInfo/main, merged over the exact copy that
 * used to be hardcoded in Hero/Pillars — so the public site never
 * regresses to blank text if the document doesn't exist yet, and the
 * owner's /admin/venue edits take effect once it does.
 */
export async function getVenueInfo(): Promise<VenueInfo> {
  try {
    const snap = await getAdminDb().doc("venueInfo/main").get();
    if (!snap.exists) return defaultVenueInfo;
    return { ...defaultVenueInfo, ...serializeFirestoreData(snap.data() as Partial<VenueInfo>) };
  } catch {
    return defaultVenueInfo;
  }
}