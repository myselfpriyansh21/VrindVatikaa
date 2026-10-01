export interface GalleryCategory {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
  published: boolean;
}

export interface GalleryImage {
  id: string;
  cloudinaryPublicId: string;
  secureUrl: string;
  thumbnailUrl: string;
  categoryId: string;
  title: string;
  altText: string;
  displayOrder: number;
  featured: boolean;
  published: boolean;
  createdAt: string;
}
