import { Star } from "lucide-react";
import type { Review } from "@/types/review";

export function ReviewsSection({ reviews }: { reviews?: Review[] }) {
  const published = reviews ?? [];

  return (
    <section id="reviews" className="bg-vrind-black-secondary py-20">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <p className="text-xs font-medium tracking-[0.25em] text-vrind-text-muted uppercase">
          Guest Feedback
        </p>
        <h2 className="font-heading mt-2 text-3xl text-vrind-text-primary">
          What guests say
        </h2>

        {published.length === 0 ? (
          <p className="mt-8 text-sm text-vrind-text-muted">
            Reviews will be added here shortly.
          </p>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {published.map((review) => (
              <div
                key={review.id}
                className="border border-vrind-white-border/60 p-6"
              >
                <div className="flex gap-1" aria-label={`${review.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-4 ${
                        i < review.rating ? "fill-vrind-gold text-vrind-gold" : "text-vrind-text-muted"
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-4 text-sm text-vrind-text-secondary">&ldquo;{review.reviewText}&rdquo;</p>
                <p className="mt-4 text-sm font-medium text-vrind-text-primary">
                  {review.reviewerName}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
