"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Eye, EyeOff, Star } from "lucide-react";
import { toast } from "sonner";
import {
  listCollection,
  createDoc,
  updateDocById,
  deleteDocById,
} from "@/lib/firebase/firestore-crud";
import type { Review } from "@/types/review";

const COLLECTION = "reviews";

export default function ReviewsAdminPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ reviewerName: "", rating: 5, reviewText: "" });
  const [adding, setAdding] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      setReviews(await listCollection<Omit<Review, "id">>(COLLECTION));
      setError(null);
    } catch {
      setError("Could not load reviews. Check Firebase credentials for this environment.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleAdd() {
    if (!form.reviewerName.trim() || !form.reviewText.trim()) return;
    setAdding(true);
    try {
      await createDoc(COLLECTION, {
        reviewerName: form.reviewerName.trim(),
        rating: form.rating,
        reviewText: form.reviewText.trim(),
        reviewDate: new Date().toISOString(),
        source: "direct",
        sourceUrl: null,
        published: true,
        displayOrder: reviews.length,
      });
      setForm({ reviewerName: "", rating: 5, reviewText: "" });
      await refresh();
      toast.success("Review added.");
    } catch {
      toast.error("Could not add review.");
    } finally {
      setAdding(false);
    }
  }

  async function togglePublished(review: Review) {
    setReviews((prev) => prev.map((r) => (r.id === review.id ? { ...r, published: !r.published } : r)));
    try {
      await updateDocById(COLLECTION, review.id, { published: !review.published });
    } catch {
      toast.error("Could not update review.");
      refresh();
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this review?")) return;
    try {
      await deleteDocById(COLLECTION, id);
      refresh();
    } catch {
      toast.error("Could not delete review.");
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-2xl text-vrind-text-primary">Reviews</h1>
      <p className="mt-1 text-sm text-vrind-text-muted">
        Manually curated testimonials shown on the homepage. Only add reviews
        actually given by real customers.
      </p>

      {error && (
        <p className="mt-6 rounded-md border border-vrind-gold-muted/40 bg-vrind-surface p-4 text-sm text-vrind-text-secondary">
          {error}
        </p>
      )}

      {!error && (
        <>
          <div className="mt-8 rounded-lg border border-vrind-white-border/60 bg-vrind-surface p-5">
            <p className="mb-3 text-xs font-medium tracking-[0.2em] text-vrind-gold uppercase">
              Add Review
            </p>
            <div className="mb-3 flex gap-3">
              <input
                value={form.reviewerName}
                onChange={(e) => setForm({ ...form, reviewerName: e.target.value })}
                placeholder="Reviewer name"
                className="flex-1 rounded-md border border-vrind-white-border bg-vrind-black px-3 py-2.5 text-sm text-vrind-text-primary placeholder:text-vrind-text-muted focus:border-vrind-gold focus:outline-none min-h-11"
              />
              <select
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                className="rounded-md border border-vrind-white-border bg-vrind-black px-3 py-2.5 text-sm text-vrind-text-primary min-h-11"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>{n} star{n !== 1 ? "s" : ""}</option>
                ))}
              </select>
            </div>
            <textarea
              value={form.reviewText}
              onChange={(e) => setForm({ ...form, reviewText: e.target.value })}
              placeholder="Review text"
              rows={2}
              className="mb-3 w-full rounded-md border border-vrind-white-border bg-vrind-black px-3 py-2.5 text-sm text-vrind-text-primary placeholder:text-vrind-text-muted focus:border-vrind-gold focus:outline-none"
            />
            <button
              onClick={handleAdd}
              disabled={adding}
              className="flex items-center gap-2 bg-vrind-gold px-4 py-2 text-sm font-semibold text-vrind-black hover:bg-vrind-gold-bright disabled:opacity-50"
            >
              {adding ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Add
            </button>
          </div>

          {loading ? (
            <Loader2 className="mt-8 size-5 animate-spin text-vrind-text-muted" />
          ) : (
            <ul className="mt-6 divide-y divide-vrind-white-border/60 border-t border-vrind-white-border/60">
              {reviews.map((review) => (
                <li key={review.id} className="flex items-start justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium ${review.published ? "text-vrind-text-primary" : "text-vrind-text-muted line-through"}`}>
                        {review.reviewerName}
                      </p>
                      <span className="flex items-center gap-0.5">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="size-3 fill-vrind-gold text-vrind-gold" />
                        ))}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-vrind-text-secondary">{review.reviewText}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button onClick={() => togglePublished(review)} className="text-vrind-text-muted hover:text-vrind-gold" title={review.published ? "Hide" : "Publish"} aria-label={review.published ? "Hide" : "Publish"}>
                      {review.published ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                    </button>
                    <button onClick={() => remove(review.id)} className="text-vrind-text-muted hover:text-vrind-error" title="Delete">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </li>
              ))}
              {reviews.length === 0 && (
                <p className="py-6 text-sm text-vrind-text-muted">No reviews yet — add one above.</p>
              )}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
