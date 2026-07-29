"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCategoryTree } from "@/services/category.service";

type Category = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  img?: string;
  children?: Category[];
};

export default function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getCategoryTree();
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load category tree:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const toggleAccordion = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 rounded-3xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-12 text-center shadow-xs">
        <p className="text-sm text-gray-500">No categories found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {categories.map((category) => {
        const hasChildren = category.children && category.children.length > 0;
        const isOpen = openId === category._id;
        const imageUrl = category.image || category.img;

        // ড্রপডাউনে সর্বোচ্চ ৪টি সাব-ক্যাটেগরি দেখানোর জন্য
        const visibleSubCategories = category.children?.slice(0, 4) || [];

        return (
          <div key={category._id} className="p-1">
            {/* MAIN CATEGORY IMAGE CARD */}
            <div
              onClick={() => hasChildren && toggleAccordion(category._id)}
              className={`group relative mx-auto flex h-36 w-36 items-center justify-center overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 ${
                isOpen
                  ? "translate-y-1.5 ring-4 ring-black/80 shadow-inner scale-95"
                  : "shadow-md hover:shadow-xl hover:-translate-y-1"
              }`}
            >
              {imageUrl ? (
                <>
                  <img
                    src={imageUrl}
                    alt={category.name}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  <div className={`absolute inset-0 bg-black/10 transition-opacity duration-300 ${isOpen ? "opacity-30" : "opacity-0 group-hover:opacity-100"}`} />
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-2xl bg-gray-100 text-xs text-gray-400">
                  No Image
                </div>
              )}
            </div>

            {/* CATEGORY TITLE */}
            <div className="mt-2 text-center">
              <h3
                onClick={() => hasChildren && toggleAccordion(category._id)}
                className={`text-sm font-bold cursor-pointer transition-colors ${
                  isOpen ? "text-black underline underline-offset-4" : "text-gray-900 hover:text-black"
                }`}
              >
                {category.name}
              </h3>
            </div>

            {/* EXPANDABLE SUB-CATEGORIES & VIEW ALL DROPDOWN */}
            <div
              className={`grid overflow-hidden transition-all duration-500 ease-in-out ${
                isOpen ? "grid-rows-[1fr] opacity-100 mt-3 pt-3 border-t border-gray-200/60" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden space-y-2">
                {visibleSubCategories.map((sub) => {
                  const subImageUrl = sub.image || sub.img;
                  return (
                    <Link
                      key={sub._id}
                      href={`/category/${sub.slug}`}
                      className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-xs transition-all hover:bg-gray-50 hover:text-black"
                    >
                      <div className="flex items-center gap-2">
                        {subImageUrl ? (
                          <img
                            src={subImageUrl}
                            alt={sub.name}
                            className="h-7 w-7 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-[9px] text-gray-400">
                            No
                          </div>
                        )}
                        <span className="truncate">{sub.name}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-400">→</span>
                    </Link>
                  );
                })}

                {/* VIEW ALL BUTTON (নন স্টাইল পেজে রিডাইরেক্ট করবে) */}
                <Link
                  href={`/category/${category.slug}`}
                  className="flex items-center justify-center w-full rounded-xl bg-black px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-gray-800 mt-2"
                >
                  View All ({category.children?.length || 0}) →
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
