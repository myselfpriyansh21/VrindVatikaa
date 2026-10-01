"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Eye, EyeOff, Star, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import {
  listCollection,
  createDoc,
  updateDocById,
  deleteDocById,
} from "@/lib/firebase/firestore-crud";
import { uploadToCloudinary } from "@/lib/cloudinary/upload-client";
import type { MenuCategory, MenuItem, MenuContext, VegType } from "@/types/menu";

const CATEGORY_COLLECTION = "menuCategories";
const ITEM_COLLECTION = "menuItems";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  priceHalf: "",
  priceFull: "",
  priceNote: "",
  categoryId: "",
  vegType: "veg" as VegType,
};

/**
 * Shared item CRUD UI for Restaurant and Catering.
 *
 * CRITICAL BUSINESS RULE, enforced here at the form level (not just at
 * public-render time in MenuItemCard): the price field only renders at
 * all when context === "restaurant". A catering item can never even be
 * given a price through this UI — there is no code path in this
 * component that writes a price to a catering-context document. This is
 * a second, independent enforcement of the same rule described in
 * types/menu.ts and components/menu/MenuItemCard.tsx.
 */
export function MenuItemManager({ context }: { context: Exclude<MenuContext, "both"> }) {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const relevantCategories = categories
    .filter((c) => c.context === context || c.context === "both")
    .sort((a, b) => a.displayOrder - b.displayOrder);
  const relevantItems = items
    .filter((i) => i.context === context)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  async function refresh() {
    setLoading(true);
    try {
      const [cats, its] = await Promise.all([
        listCollection<Omit<MenuCategory, "id">>(CATEGORY_COLLECTION),
        listCollection<Omit<MenuItem, "id">>(ITEM_COLLECTION),
      ]);
      setCategories(cats);
      setItems(its);
      setError(null);
    } catch {
      setError("Could not load menu data. Check Firebase credentials for this environment.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAdd() {
    if (!form.name.trim() || !form.categoryId) {
      toast.error("Name and category are required.");
      return;
    }
    setSaving(true);
    try {
      let imageUrl: string | null = null;
      if (imageFile) {
        const uploaded = await uploadToCloudinary(imageFile, `menu/${context}`);
        imageUrl = uploaded.secureUrl;
      }

      await createDoc(ITEM_COLLECTION, {
        name: form.name.trim(),
        description: form.description.trim(),
        // The price field literally does not exist in the payload for
        // catering items — not just hidden in the UI.
        price: context === "restaurant" && form.price ? Number(form.price) : null,
        priceHalf: context === "restaurant" && form.priceHalf ? Number(form.priceHalf) : null,
        priceFull: context === "restaurant" && form.priceFull ? Number(form.priceFull) : null,
        priceNote: context === "restaurant" && form.priceNote ? form.priceNote.trim() : null,
        categoryId: form.categoryId,
        context,
        vegType: form.vegType,
        imageUrl,
        featured: false,
        published: true,
        displayOrder: relevantItems.length,
      });

      setForm(emptyForm);
      setImageFile(null);
      await refresh();
      toast.success("Item added.");
    } catch {
      toast.error("Could not add item.");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(item: MenuItem) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, published: !i.published } : i)));
    try {
      await updateDocById(ITEM_COLLECTION, item.id, { published: !item.published });
    } catch {
      toast.error("Could not update item.");
      refresh();
    }
  }

  async function toggleFeatured(item: MenuItem) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, featured: !i.featured } : i)));
    try {
      await updateDocById(ITEM_COLLECTION, item.id, { featured: !item.featured });
    } catch {
      toast.error("Could not update item.");
      refresh();
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this menu item?")) return;
    try {
      await deleteDocById(ITEM_COLLECTION, id);
      refresh();
    } catch {
      toast.error("Could not delete item.");
    }
  }

  if (loading) return <Loader2 className="size-5 animate-spin text-vrind-text-muted" />;

  return (
    <div className="max-w-3xl">
      <h1 className="font-heading text-2xl text-vrind-text-primary capitalize">
        {context} Menu Items
      </h1>
      <p className="mt-1 text-sm text-vrind-text-muted">
        {context === "restaurant"
          ? "Prices entered here are shown publicly on the restaurant menu."
          : "Catering items never show a price publicly — pricing stays quotation-based."}
      </p>

      {error && (
        <p className="mt-6 rounded-md border border-vrind-gold-muted/40 bg-vrind-surface p-4 text-sm text-vrind-text-secondary">
          {error}
        </p>
      )}

      {!error && (
        <>
          {relevantCategories.length === 0 ? (
            <p className="mt-6 rounded-md border border-vrind-gold-muted/40 bg-vrind-surface p-4 text-sm text-vrind-text-secondary">
              Add a category first (see {context} Categories in the sidebar) before adding items.
            </p>
          ) : (
            <div className="mt-6 rounded-lg border border-vrind-white-border/60 bg-vrind-surface p-5">
              <p className="mb-3 text-xs font-medium tracking-[0.2em] text-vrind-gold uppercase">
                Add Item
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Item name"
                  className="rounded-md border border-vrind-white-border bg-vrind-black px-3 py-2.5 text-sm text-vrind-text-primary placeholder:text-vrind-text-muted focus:border-vrind-gold focus:outline-none min-h-11"
                />
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="rounded-md border border-vrind-white-border bg-vrind-black px-3 py-2.5 text-sm text-vrind-text-primary min-h-11"
                >
                  <option value="">Select category</option>
                  {relevantCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <select
                  value={form.vegType}
                  onChange={(e) => setForm({ ...form, vegType: e.target.value as VegType })}
                  className="rounded-md border border-vrind-white-border bg-vrind-black px-3 py-2.5 text-sm text-vrind-text-primary min-h-11"
                >
                  <option value="veg">Vegetarian</option>
                  <option value="nonveg">Non-Vegetarian</option>
                </select>
                {/* Price fields only exist in the DOM for restaurant items.
                    Fill EITHER "Price" alone, OR both Half + Full — not both
                    styles at once. "Price note" is for non-numeric cases
                    like "MRP" (e.g. bottled water). */}
                {context === "restaurant" && (
                  <>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="Price (₹) — for single-portion items"
                      className="sm:col-span-2 rounded-md border border-vrind-white-border bg-vrind-black px-3 py-2.5 text-sm text-vrind-text-primary placeholder:text-vrind-text-muted focus:border-vrind-gold focus:outline-none min-h-11"
                    />
                    <input
                      type="number"
                      value={form.priceHalf}
                      onChange={(e) => setForm({ ...form, priceHalf: e.target.value })}
                      placeholder="Half price (₹) — optional"
                      className="rounded-md border border-vrind-white-border bg-vrind-black px-3 py-2.5 text-sm text-vrind-text-primary placeholder:text-vrind-text-muted focus:border-vrind-gold focus:outline-none min-h-11"
                    />
                    <input
                      type="number"
                      value={form.priceFull}
                      onChange={(e) => setForm({ ...form, priceFull: e.target.value })}
                      placeholder="Full price (₹) — optional"
                      className="rounded-md border border-vrind-white-border bg-vrind-black px-3 py-2.5 text-sm text-vrind-text-primary placeholder:text-vrind-text-muted focus:border-vrind-gold focus:outline-none min-h-11"
                    />
                    <input
                      value={form.priceNote}
                      onChange={(e) => setForm({ ...form, priceNote: e.target.value })}
                      placeholder='Price note (e.g. "MRP") — optional'
                      className="sm:col-span-2 rounded-md border border-vrind-white-border bg-vrind-black px-3 py-2.5 text-sm text-vrind-text-primary placeholder:text-vrind-text-muted focus:border-vrind-gold focus:outline-none min-h-11"
                    />
                  </>
                )}
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Description (optional)"
                  rows={2}
                  className="sm:col-span-2 rounded-md border border-vrind-white-border bg-vrind-black px-3 py-2.5 text-sm text-vrind-text-primary placeholder:text-vrind-text-muted focus:border-vrind-gold focus:outline-none"
                />
                <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-vrind-white-border px-3 text-sm text-vrind-text-secondary hover:border-vrind-gold sm:col-span-2">
                  <ImagePlus className="size-4" />
                  {imageFile ? imageFile.name : "Add photo (optional)"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
              <button
                onClick={handleAdd}
                disabled={saving}
                className="mt-4 flex items-center gap-2 bg-vrind-gold px-4 py-2 text-sm font-semibold text-vrind-black hover:bg-vrind-gold-bright disabled:opacity-50"
              >
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                Add Item
              </button>
            </div>
          )}

          <ul className="mt-6 divide-y divide-vrind-white-border/60 border-t border-vrind-white-border/60">
            {relevantItems.map((item) => (
              <li key={item.id} className="flex items-center gap-4 py-3.5">
                <div
                  className="size-12 shrink-0 rounded-sm bg-vrind-surface bg-cover bg-center"
                  style={item.imageUrl ? { backgroundImage: `url(${item.imageUrl})` } : undefined}
                />
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${item.published ? "text-vrind-text-primary" : "text-vrind-text-muted line-through"}`}>
                    {item.name}
                    {item.context === "restaurant" && (
                      <span className="ml-2 text-vrind-gold">
                        {item.priceHalf != null && item.priceFull != null
                          ? `₹${item.priceHalf} / ₹${item.priceFull}`
                          : item.price != null
                            ? `₹${item.price}`
                            : item.priceNote ?? ""}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-vrind-text-muted">
                    {categories.find((c) => c.id === item.categoryId)?.name ?? "Uncategorized"}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => toggleFeatured(item)} className={item.featured ? "text-vrind-gold" : "text-vrind-text-muted hover:text-vrind-gold"} title="Feature" aria-label="Toggle featured">
                    <Star className="size-4" fill={item.featured ? "currentColor" : "none"} />
                  </button>
                  <button onClick={() => togglePublished(item)} className="text-vrind-text-muted hover:text-vrind-gold" title={item.published ? "Hide" : "Publish"} aria-label={item.published ? "Hide" : "Publish"}>
                    {item.published ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                  </button>
                  <button onClick={() => remove(item.id)} className="text-vrind-text-muted hover:text-vrind-error" title="Delete" aria-label="Delete item">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            ))}
            {relevantItems.length === 0 && (
              <p className="py-6 text-sm text-vrind-text-muted">No items yet.</p>
            )}
          </ul>
        </>
      )}
    </div>
  );
}
