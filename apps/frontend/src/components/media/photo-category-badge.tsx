import { PhotoCategory } from "@/lib/types";

const categoryStyles: Record<PhotoCategory, string> = {
  BEFORE: "bg-amber-100 text-amber-800",
  AFTER: "bg-emerald-100 text-emerald-800",
  PROGRESS: "bg-sky-100 text-sky-800",
};

export function PhotoCategoryBadge({ category }: { category: PhotoCategory }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${categoryStyles[category]}`}
    >
      {category}
    </span>
  );
}
