"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Category } from "@/types/category";

interface Props {
  category: Category;
}

export default function CategorySidebar({ category }: Props) {
  const pathname = usePathname();

  return (
    <aside className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
      <h2 className="mb-4 text-base font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-3">
        {category.name}
      </h2>

      <div className="space-y-1">
        {category.children && category.children.length > 0 ? (
          category.children.map((item) => {
            const href = `/categories/${item.slug}`;
            const isActive = pathname === href;

            return (
              <Link
                key={item._id}
                href={href}
                className={`block rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-black text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-black"
                }`}
              >
                {item.name}
              </Link>
            );
          })
        ) : (
          <p className="py-2 text-sm text-gray-400">
            No subcategories available.
          </p>
        )}
      </div>
    </aside>
  );
}
