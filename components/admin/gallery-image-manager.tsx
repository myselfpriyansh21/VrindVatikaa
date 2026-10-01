"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, ImagePlus, Trash2, Eye, EyeOff, Star, GripVertical } from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  listCollection,
  createDoc,
  updateDocById,
  deleteDocById,
} from "@/lib/firebase/firestore-crud";
import { uploadToCloudinary } from "@/lib/cloudinary/upload-client";
import type { GalleryCategory, GalleryImage } from "@/types/gallery";

const IMAGE_COLLECTION = "galleryImages";
const CATEGORY_COLLECTION = "galleryCategories";

function SortableImageCard({
  image,
  categories,
  onTogglePublished,
  onToggleFeatured,
  onDelete,
  onSaveAlt,
  onChangeCategory,
}: {
  image: GalleryImage;
  categories: GalleryCategory[];
  onTogglePublished: () => void;
  onToggleFeatured: () => void;
  onDelete: () => void;
  onSaveAlt: (alt: string) => void;
  onChangeCategory: (categoryId: string) => void;
}) {
  const [alt, setAlt] = useState(image.altText ?? "");
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="group relative overflow-hidden border border-vrind-white-border/60 bg-vrind-surface"
    >
      <div className="relative aspect-square">
        <Image src={image.secureUrl} alt={image.altText || image.title} fill className="object-cover" />
        <button
          {...attributes}
          {...listeners}
          className="absolute left-1.5 top-1.5 flex size-7 items-center justify-center rounded-sm bg-black/60 text-white opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical className="size-4" />
        </button>
        {!image.published && (
          <span className="absolute right-1.5 top-1.5 rounded-sm bg-black/70 px-1.5 py-0.5 text-[10px] text-vrind-text-muted">
            Hidden
          </span>
        )}
      </div>
      <div className="space-y-1.5 p-2">
        <input
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          onBlur={() => alt !== (image.altText ?? "") && onSaveAlt(alt)}
          placeholder="Alt text (describe the photo)"
          aria-label="Alt text"
          className="w-full border-0 border-b border-vrind-white-border bg-transparent py-1 text-[11px] text-vrind-text-primary placeholder:text-vrind-text-muted focus:border-vrind-gold focus:outline-none"
        />
        <select
          value={image.categoryId}
          onChange={(e) => onChangeCategory(e.target.value)}
          aria-label="Category"
          className="w-full bg-vrind-black py-1 text-[11px] text-vrind-text-secondary"
        >
          {!categories.some((c) => c.id === image.categoryId) && (
            <option value={image.categoryId}>Uncategorized</option>
          )}
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center justify-end gap-2 px-2 pb-2">
        <div className="flex shrink-0 gap-1.5">
          <button onClick={onToggleFeatured} className={image.featured ? "text-vrind-gold" : "text-vrind-text-muted hover:text-vrind-gold"} title="Feature" aria-label="Toggle featured">
            <Star className="size-3.5" fill={image.featured ? "currentColor" : "none"} />
          </button>
          <button onClick={onTogglePublished} className="text-vrind-text-muted hover:text-vrind-gold" title={image.published ? "Hide" : "Publish"} aria-label={image.published ? "Hide" : "Publish"}>
            {image.published ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
          </button>
          <button onClick={onDelete} className="text-vrind-text-muted hover:text-vrind-error" title="Delete" aria-label="Delete image">
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function GalleryImageManager() {
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadCategoryId, setUploadCategoryId] = useState("");
  const [uploading, setUploading] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const sorted = [...images].sort((a, b) => a.displayOrder - b.displayOrder);

  async function refresh() {
    setLoading(true);
    try {
      const [cats, imgs] = await Promise.all([
        listCollection<Omit<GalleryCategory, "id">>(CATEGORY_COLLECTION),
        listCollection<Omit<GalleryImage, "id">>(IMAGE_COLLECTION),
      ]);
      setCategories(cats);
      setImages(imgs);
      setError(null);
    } catch {
      setError("Could not load gallery. Check Firebase credentials for this environment.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (!uploadCategoryId) {
      toast.error("Choose a category before uploading.");
      return;
    }
    setUploading(true);
    try {
      let order = images.length;
      for (const file of Array.from(files)) {
        const uploaded = await uploadToCloudinary(file, "gallery");
        await createDoc(IMAGE_COLLECTION, {
          cloudinaryPublicId: uploaded.publicId,
          secureUrl: uploaded.secureUrl,
          thumbnailUrl: uploaded.secureUrl,
          categoryId: uploadCategoryId,
          title: file.name.replace(/\.[^.]+$/, ""),
          altText: "",
          displayOrder: order++,
          featured: false,
          published: true,
        });
      }
      await refresh();
      toast.success("Image(s) uploaded.");
    } catch {
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function togglePublished(img: GalleryImage) {
    setImages((prev) => prev.map((i) => (i.id === img.id ? { ...i, published: !i.published } : i)));
    updateDocById(IMAGE_COLLECTION, img.id, { published: !img.published }).catch(() => {
      toast.error("Could not update.");
      refresh();
    });
  }

  async function toggleFeatured(img: GalleryImage) {
    setImages((prev) => prev.map((i) => (i.id === img.id ? { ...i, featured: !i.featured } : i)));
    updateDocById(IMAGE_COLLECTION, img.id, { featured: !img.featured }).catch(() => {
      toast.error("Could not update.");
      refresh();
    });
  }

  function saveAlt(img: GalleryImage, altText: string) {
    setImages((prev) => prev.map((i) => (i.id === img.id ? { ...i, altText } : i)));
    updateDocById(IMAGE_COLLECTION, img.id, { altText }).catch(() => {
      toast.error("Could not save alt text.");
      refresh();
    });
  }

  function changeCategory(img: GalleryImage, categoryId: string) {
    setImages((prev) => prev.map((i) => (i.id === img.id ? { ...i, categoryId } : i)));
    updateDocById(IMAGE_COLLECTION, img.id, { categoryId }).catch(() => {
      toast.error("Could not change category.");
      refresh();
    });
  }

  async function remove(img: GalleryImage) {
    if (!confirm("Delete this image? This also removes it from Cloudinary.")) return;
    try {
      await deleteDocById(IMAGE_COLLECTION, img.id);
      await fetch("/api/cloudinary-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: img.cloudinaryPublicId }),
      }).catch(() => {});
      refresh();
    } catch {
      toast.error("Could not delete image.");
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sorted.findIndex((i) => i.id === active.id);
    const newIndex = sorted.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(sorted, oldIndex, newIndex);

    setImages(reordered.map((img, idx) => ({ ...img, displayOrder: idx })));
    try {
      await Promise.all(
        reordered.map((img, idx) => updateDocById(IMAGE_COLLECTION, img.id, { displayOrder: idx }))
      );
    } catch {
      toast.error("Could not save new order.");
      refresh();
    }
  }

  if (loading) return <Loader2 className="size-5 animate-spin text-vrind-text-muted" />;

  return (
    <div>
      <h1 className="font-heading text-2xl text-vrind-text-primary">Gallery</h1>
      <p className="mt-1 text-sm text-vrind-text-muted">
        Drag images to reorder. Add categories first under Gallery Categories.
      </p>

      {error && (
        <p className="mt-6 rounded-md border border-vrind-gold-muted/40 bg-vrind-surface p-4 text-sm text-vrind-text-secondary">
          {error}
        </p>
      )}

      {!error && (
        <>
          <div className="mt-6 flex flex-col gap-3 rounded-lg border border-vrind-white-border/60 bg-vrind-surface p-5 sm:flex-row sm:items-center">
            <select
              value={uploadCategoryId}
              onChange={(e) => setUploadCategoryId(e.target.value)}
              className="rounded-md border border-vrind-white-border bg-vrind-black px-3 py-2.5 text-sm text-vrind-text-primary min-h-11"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <label className="flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-vrind-white-border px-4 text-sm text-vrind-text-secondary hover:border-vrind-gold">
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
              {uploading ? "Uploading..." : "Upload image(s)"}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={uploading}
                onChange={(e) => handleUpload(e.target.files)}
              />
            </label>
          </div>

          {sorted.length === 0 ? (
            <p className="mt-8 text-sm text-vrind-text-muted">No images yet — upload above.</p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sorted.map((i) => i.id)} strategy={rectSortingStrategy}>
                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {sorted.map((img) => (
                    <SortableImageCard
                      key={img.id}
                      image={img}
                      categories={categories}
                      onSaveAlt={(alt) => saveAlt(img, alt)}
                      onChangeCategory={(id) => changeCategory(img, id)}
                      onTogglePublished={() => togglePublished(img)}
                      onToggleFeatured={() => toggleFeatured(img)}
                      onDelete={() => remove(img)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </>
      )}
    </div>
  );
}
