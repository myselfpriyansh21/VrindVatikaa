import type { MenuCategory, MenuItem } from "@/types/menu";
import { MenuItemCard } from "./menu-item-card";

interface MenuSectionProps {
  categories: MenuCategory[];
  items: MenuItem[];
  emptyMessage: string;
}

/**
 * Renders published categories with their published items, sorted by
 * displayOrder. Used for BOTH restaurant and catering — the visual
 * presentation is intentionally similar (same brand system) but the two
 * are always fed separate, distinctly-labelled data arrays and rendered
 * under separate headings, per Part 12: "Do NOT merge the public
 * restaurant menu and catering menu into one visual experience."
 */
export function MenuSection({ categories, items, emptyMessage }: MenuSectionProps) {
  const publishedCategories = categories
    .filter((c) => c.published)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  if (publishedCategories.length === 0) {
    return <p className="text-center text-sm text-vrind-text-muted">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-10">
      {publishedCategories.map((category) => {
        const categoryItems = items
          .filter((i) => i.categoryId === category.id && i.published)
          .sort((a, b) => a.displayOrder - b.displayOrder);

        if (categoryItems.length === 0) return null;

        return (
          <div key={category.id}>
            <h3 className="font-heading mb-4 text-xl text-vrind-gold">{category.name}</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {categoryItems.map((item) => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
