export type MenuContext = "restaurant" | "catering" | "both";
export type VegType = "veg" | "nonveg";

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  context: MenuContext;
  displayOrder: number;
  published: boolean;
}

/**
 * A single menu item.
 *
 * IMPORTANT (Part 11 / Part 32 / Part 35 of the spec):
 *   - Restaurant items (`context: "restaurant"` or `"both"`) MAY carry a
 *     `price` and it MUST be publicly displayed when present.
 *   - Catering-only items (`context: "catering"`) MUST NEVER display a
 *     price publicly, regardless of what is stored. Public rendering
 *     components enforce this — see components/menu/MenuItemCard.tsx.
 *
 * PRICING MODEL:
 *   - `price`: the single/full price — used for most items.
 *   - `priceHalf` / `priceFull`: used instead of `price` for dishes sold
 *     in Half/Full portions (common on Indian restaurant menus, e.g.
 *     "Paneer Butter Masala ₹140 | ₹220"). When both are present, the
 *     public card shows "₹140 / ₹220" and `price` is left null.
 *   - `priceNote`: free-text shown instead of a number, e.g. "MRP" for
 *     items like bottled water/soft drinks that aren't fixed-priced by
 *     the restaurant itself.
 */
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number | null;
  priceHalf: number | null;
  priceFull: number | null;
  priceNote: string | null;
  categoryId: string;
  context: MenuContext;
  vegType: VegType;
  imageUrl: string | null;
  featured: boolean;
  published: boolean;
  displayOrder: number;
}
