export interface Review {
  id: string;
  reviewerName: string;
  rating: number; // 1-5
  reviewText: string;
  reviewDate: string; // ISO date
  source: "google" | "direct";
  sourceUrl: string | null;
  published: boolean;
  displayOrder: number;
}
