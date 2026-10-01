"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import {
  listCollection,
  createDoc,
  updateDocById,
  deleteDocById,
} from "@/lib/firebase/firestore-crud";
import type { MenuCategory, MenuContext } from "@/types/menu";

const COLLECTION = "menuCategories";

function slugify(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/**
 * Shared category CRUD UI for both Restaurant and Catering — the two are
 * kept visually and conceptually separate (spec Part 12: "Do NOT merge
 * the public restaurant menu and catering menu into one visual
 * experience") by always filtering to one `context` per screen, even
 * though they share this one component and Firestore collection.
 *
 * Reordering uses simple up/down swaps rather than full drag-and-drop —
 * a pragmatic choice for a handful of categories per section; @dnd-kit
 * is already a project dependency if this needs to become drag-based
 * later (see the Gallery module, which will use it for a longer list).
 */
export function CategoryManager({ context }: { context: MenuContext }) {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);

  const relevant = categories
    .filter((c) => c.context === context || c.context === "both")
    .sort((a, b) => a.displayOrder - b.displayOrder);

  async function refresh() {
    setLoading(true);
    try {
      setCategories(await listCollection<Omit<MenuCategory, "id">>(COLLECTION));
      setError(null);
    } catch {
      setError("Could not load categories. Check Firebase credentials for this environment.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAdd() {
    if (!name.trim()) return;
    setAdding(true);
    try {
      await createDoc(COLLECTION, {
        name: name.trim(),
        slug: slugify(name),
        context,
        published: true,
        displayOrder: relevant.length,
      });
      setName("");
      await refresh();
      toast.success("Category added.");
    } catch {
      toast.error("Could not add category.");
    } finally {
      setAdding(false);
    }
  }

  async function togglePublished(cat: MenuCategory) {
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? { ...c, published: !c.published } : c)));
    try {
      await updateDocById(COLLECTION, cat.id, { published: !cat.published });
    } catch {
      toast.error("Could not update category.");
      refresh();
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this category? Items inside it will remain but become uncategorized.")) return;
    try {
      await deleteDocById(COLLECTION, id);
      refresh();
    } catch {
      toast.error("Could not delete category.");
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= relevant.length) return;
    const a = relevant[index];
    const b = relevant[target];
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id === a.id) return { ...c, displayOrder: b.displayOrder };
        if (c.id === b.id) return { ...c, displayOrder: a.displayOrder };
        return c;
      })
    );
    try {
      await Promise.all([
        updateDocById(COLLECTION, a.id, { displayOrder: b.displayOrder }),
        updateDocById(COLLECTION, b.id, { displayOrder: a.displayOrder }),
      ]);
    } catch {
      toast.error("Could not reorder.");
      refresh();
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-heading text-2xl text-vrind-text-primary capitalize">
        {context} Categories
      </h1>
      <p className="mt-1 text-sm text-vrind-text-muted">
        Organizes the {context} menu on the public site.
      </p>

      {error && (
        <p className="mt-6 rounded-md border border-vrind-gold-muted/40 bg-vrind-surface p-4 text-sm text-vrind-text-secondary">
          {error}
        </p>
      )}

      {!error && (
        <>
          <div className="mt-6 flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Starters"
              className="flex-1 rounded-md border border-vrind-white-border bg-vrind-surface px-3 py-2.5 text-sm text-vrind-text-primary placeholder:text-vrind-text-muted focus:border-vrind-gold focus:outline-none min-h-11"
            />
            <button
              onClick={handleAdd}
              disabled={adding}
              className="flex items-center gap-1.5 bg-vrind-gold px-4 text-sm font-semibold text-vrind-black hover:bg-vrind-gold-bright disabled:opacity-50"
            >
              {adding ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Add
            </button>
          </div>

          {loading ? (
            <Loader2 className="mt-8 size-5 animate-spin text-vrind-text-muted" />
          ) : (
            <ul className="mt-6 divide-y divide-vrind-white-border/60 border-t border-vrind-white-border/60">
              {relevant.map((cat, i) => (
                <li key={cat.id} className="flex items-center justify-between gap-3 py-3">
                  <span className={`text-sm ${cat.published ? "text-vrind-text-primary" : "text-vrind-text-muted line-through"}`}>
                    {cat.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="text-vrind-text-muted hover:text-vrind-gold disabled:opacity-30">
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button onClick={() => move(i, 1)} disabled={i === relevant.length - 1} aria-label="Move down" className="text-vrind-text-muted hover:text-vrind-gold disabled:opacity-30">
                      <ArrowDown className="size-3.5" />
                    </button>
                    <button onClick={() => togglePublished(cat)} className="text-vrind-text-muted hover:text-vrind-gold" title={cat.published ? "Hide" : "Publish"} aria-label={cat.published ? "Hide" : "Publish"}>
                      {cat.published ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                    </button>
                    <button onClick={() => remove(cat.id)} className="text-vrind-text-muted hover:text-vrind-error" title="Delete" aria-label="Delete category">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </li>
              ))}
              {relevant.length === 0 && (
                <p className="py-6 text-sm text-vrind-text-muted">No categories yet — add one above.</p>
              )}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
