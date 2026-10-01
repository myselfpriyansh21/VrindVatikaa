import type { MenuItem } from "@/types/menu";

/**
 * CRITICAL BUSINESS RULE (Spec Part 11/12/32/35):
 *   Restaurant items ("restaurant" | "both") show price when present.
 *   Catering-only items ("catering") NEVER show price publicly, even if
 *   a price value happens to exist in the data — this component is the
 *   single enforcement point so the rule can't be violated by a stray
 *   page forgetting to check `context` itself. This applies identically
 *   to every pricing shape below (single, half/full, or a note like
 *   "MRP") — none of them render for a catering-context item.
 */
function formatPrice(item: MenuItem): string | null {
  if (item.context === "catering") return null;
  if (item.priceHalf != null && item.priceFull != null) {
    return `₹${item.priceHalf} / ₹${item.priceFull}`;
  }
  if (item.price != null) return `₹${item.price}`;
  if (item.priceNote) return item.priceNote;
  return null;
}

export function MenuItemCard({ item }: { item: MenuItem }) {
  const priceLabel = formatPrice(item);

  return (
    <div className="flex gap-4 rounded-lg border border-vrind-white-border bg-vrind-surface p-4">
      <div
        className="size-16 shrink-0 rounded-md bg-vrind-black-secondary bg-cover bg-center"
        style={item.imageUrl ? { backgroundImage: `url(${item.imageUrl})` } : undefined}
        aria-hidden="true"
      />
      <div className="flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <VegBadge vegType={item.vegType} />
            <h4 className="text-sm font-medium text-vrind-text-primary">{item.name}</h4>
          </div>
          {priceLabel && (
            <span className="shrink-0 text-sm font-semibold text-vrind-gold">
              {priceLabel}
              {item.priceHalf != null && item.priceFull != null && (
                <span className="ml-1 text-[10px] font-normal text-vrind-text-muted">
                  half/full
                </span>
              )}
            </span>
          )}
        </div>
        {item.description && (
          <p className="mt-1 text-xs text-vrind-text-secondary">{item.description}</p>
        )}
      </div>
    </div>
  );
}

function VegBadge({ vegType }: { vegType: MenuItem["vegType"] }) {
  const isVeg = vegType === "veg";
  return (
    <span
      className={`flex size-3.5 shrink-0 items-center justify-center border ${
        isVeg ? "border-green-600" : "border-red-700"
      }`}
      aria-label={isVeg ? "Vegetarian" : "Non-vegetarian"}
      title={isVeg ? "Vegetarian" : "Non-vegetarian"}
    >
      <span className={`size-1.5 rounded-full ${isVeg ? "bg-green-600" : "bg-red-700"}`} />
    </span>
  );
}
