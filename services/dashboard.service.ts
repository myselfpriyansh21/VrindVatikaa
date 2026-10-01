import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";

/**
 * Real counts only (spec Part 18 / Part 38: "No fake statistics").
 * Uses Firestore's count() aggregation query — cheap (a single
 * aggregation read, not N document reads) regardless of collection size.
 */
export async function getDashboardStats() {
  const db = getAdminDb();

  const [
    inquiriesTotal,
    inquiriesNew,
    galleryImages,
    restaurantItems,
    cateringItems,
    reviews,
    faqs,
  ] = await Promise.all([
    db.collection("inquiries").where("archived", "==", false).count().get(),
    db.collection("inquiries").where("status", "==", "NEW").count().get(),
    db.collection("galleryImages").count().get(),
    db.collection("menuItems").where("context", "in", ["restaurant", "both"]).count().get(),
    db.collection("menuItems").where("context", "==", "catering").count().get(),
    db.collection("reviews").where("published", "==", true).count().get(),
    db.collection("faqs").where("published", "==", true).count().get(),
  ]);

  return {
    totalInquiries: inquiriesTotal.data().count,
    newInquiries: inquiriesNew.data().count,
    galleryImages: galleryImages.data().count,
    restaurantItems: restaurantItems.data().count,
    cateringItems: cateringItems.data().count,
    publishedReviews: reviews.data().count,
    publishedFaqs: faqs.data().count,
  };
}

export type DashboardStats = Awaited<ReturnType<typeof getDashboardStats>>;
