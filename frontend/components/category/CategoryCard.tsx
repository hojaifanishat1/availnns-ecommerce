"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Category } from "@/types/category";

interface Props {
  category: Category;
}

export default function CategoryCard({ category }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all duration-300 hover:shadow-xl">
      {/* CLICKABLE IMAGE / CARD HEADER TO TRIGGER DROPDOWN */}
      <div
        onClick={() => hasChildren && setIsOpen(!isOpen)}
        className="group relative h-48 w-full overflow-hidden bg-zinc-100 cursor-pointer"
      >
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            fill
            sizes="(max-width:768px) 100vw, 300px"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-400">
            No Image
          </div>
        )}
      </div>

      {/* CONTENT (CENTERED NAME & DESCRIPTION) */}
      <div className="p-5 text-center">
        <h2
          onClick={() => hasChildren && setIsOpen(!isOpen)}
          className="text-lg font-bold text-zinc-900 hover:text-black cursor-pointer transition-colors"
        >
          {category.name}
        </h2>

        {category.description && (
          <p className="mt-2 line-clamp-2 text-sm text-zinc-500">
            {category.description}
          </p>
        )}

        {hasChildren && (
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="mt-4 inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 cursor-pointer hover:bg-zinc-200 transition-colors"
          >
            {category.children.length} Subcategories
          </div>
        )}

        {/* SUB-CATEGORIES DROPDOWN LIST */}
        {hasChildren && isOpen && (
          <div className="mt-4 space-y-2 border-t border-zinc-100 pt-4 text-left animate-fadeIn">
            {category.children?.map((sub) => (
              <Link
                key={sub._id}
                href={`/categories/${sub.slug}`}
                className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-700 transition-all hover:bg-black hover:text-white"
              >
                <span>{sub.name}</span>
                <span className="text-xs font-bold text-zinc-400">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
