"use client";

import { useState } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { GalleryCategory, GalleryImage } from "@/types/gallery";

/**
 * Homepage gallery preview (blueprint §4, "Gallery preview" section).
 * Category tabs filter client-side (data is already fetched server-side
 * in app/page.tsx — small dataset, no need for per-filter refetching).
 * Honest empty state when no images have been published yet, rather
 * than fake placeholder photography.
 */
export function GallerySection({
  categories,
  images,
}: {
  categories: GalleryCategory[];
  images: GalleryImage[];
}) {
  const [activeCategory, setActiveCategory] = useState<string | "all">("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered =
    activeCategory === "all" ? images : images.filter((img) => img.categoryId === activeCategory);

  if (images.length === 0) {
    return (
      <section id="gallery" className="mx-auto max-w-7xl px-6 py-20 sm:px-8">
        <p className="text-xs font-medium tracking-[0.25em] text-vrind-text-muted uppercase">Gallery</p>
        <h2 className="font-heading mt-2 text-3xl text-vrind-text-primary">A closer look</h2>
        <p className="mt-6 text-sm text-vrind-text-muted">Photos will be added here shortly.</p>
      </section>
    );
  }

  return (
    <section id="gallery" className="mx-auto max-w-7xl px-6 py-20 sm:px-8">
      <p className="text-xs font-medium tracking-[0.25em] text-vrind-text-muted uppercase">Gallery</p>
      <h2 className="font-heading mt-2 text-3xl text-vrind-text-primary">A closer look</h2>

      {categories.length > 0 && (
        <div className="mt-6 flex gap-5 overflow-x-auto text-sm">
          <button
            onClick={() => setActiveCategory("all")}
            className={`shrink-0 border-b-2 pb-2 ${activeCategory === "all" ? "border-vrind-gold text-vrind-gold" : "border-transparent text-vrind-text-muted"}`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 border-b-2 pb-2 ${activeCategory === cat.id ? "border-vrind-gold text-vrind-gold" : "border-transparent text-vrind-text-muted"}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {filtered.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setLightboxIndex(i)}
            className="relative aspect-square overflow-hidden bg-vrind-surface"
          >
            <Image
              src={img.secureUrl}
              alt={img.altText || img.title}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="object-cover transition-transform hover:scale-105"
            />
          </button>
        ))}
      </div>

      <Dialog.Root open={lightboxIndex !== null} onOpenChange={(open) => !open && setLightboxIndex(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-90 bg-black/90" />
          <Dialog.Content className="fixed inset-0 z-90 flex flex-col items-center justify-center p-4">
            <Dialog.Title className="sr-only">Gallery image</Dialog.Title>
            <Dialog.Close className="absolute right-4 top-4 text-white/80 hover:text-white">
              <X className="size-6" />
            </Dialog.Close>
            {lightboxIndex !== null && filtered[lightboxIndex] && (
              <>
                <div className="relative h-[75vh] w-full max-w-3xl">
                  <Image
                    src={filtered[lightboxIndex].secureUrl}
                    alt={filtered[lightboxIndex].altText || filtered[lightboxIndex].title}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="mt-4 flex items-center gap-8">
                  <button
                    onClick={() => setLightboxIndex((i) => (i! > 0 ? i! - 1 : filtered.length - 1))}
                    className="text-white/70 hover:text-white"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="size-6" />
                  </button>
                  <span className="text-xs text-white/50">
                    {lightboxIndex + 1} / {filtered.length}
                  </span>
                  <button
                    onClick={() => setLightboxIndex((i) => (i! < filtered.length - 1 ? i! + 1 : 0))}
                    className="text-white/70 hover:text-white"
                    aria-label="Next image"
                  >
                    <ChevronRight className="size-6" />
                  </button>
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
