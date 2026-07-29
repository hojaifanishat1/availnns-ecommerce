"use client";

import { useEffect, useState } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { getCategoryTree } from "@/services/category.service";

interface CategoryItem {
  _id: string;
  name: string;
  slug?: string;
  children?: CategoryItem[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  category: string;
  setCategory: (value: string) => void;
  minPrice: string;
  setMinPrice: (value: string) => void;
  maxPrice: string;
  setMaxPrice: (value: string) => void;
  rating: number;
  setRating: (value: number) => void;
  stockOnly: boolean;
  setStockOnly: (value: boolean) => void;
  clearFilter: () => void;
}

// রিকার্সিভ ক্যাটেগরি নোড
function CategoryNode({
  cat,
  category,
  setCategory,
  level = 0,
}: {
  cat: CategoryItem;
  category: string;
  setCategory: (value: string) => void;
  level?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = cat.children && cat.children.length > 0;
  const isSelected = category === cat._id;

  return (
    <div className="space-y-1">
      <div
        className={`group flex items-center justify-between rounded-xl px-3 py-2 transition-all cursor-pointer ${
          isSelected
            ? "bg-black text-white font-medium shadow-sm"
            : "hover:bg-gray-100 text-gray-700"
        }`}
        onClick={() => setCategory(cat._id)}
      >
        <span className={`text-sm ${level > 0 ? "pl-3 text-xs" : ""}`}>
          {cat.name}
        </span>

        {hasChildren && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className={`p-1 rounded-lg transition-colors ${
              isSelected ? "text-white hover:bg-gray-800" : "text-gray-400 hover:text-black hover:bg-gray-200"
            }`}
          >
            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>

      {hasChildren && isOpen && (
        <div className="ml-3 space-y-1 border-l-2 border-gray-200 pl-2 pt-1">
          {cat.children?.map((sub) => (
            <CategoryNode
              key={sub._id}
              cat={sub}
              category={category}
              setCategory={setCategory}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ShopSidebar({
  open,
  onClose,
  category,
  setCategory,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  rating,
  setRating,
  stockOnly,
  setStockOnly,
  clearFilter,
}: Props) {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTreeCategories = async () => {
      try {
        setLoading(true);
        const data = await getCategoryTree();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load category tree:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTreeCategories();
  }, []);

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-full w-80 overflow-y-auto bg-white p-6 shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:h-fit lg:w-full lg:rounded-2xl lg:border lg:border-gray-100 lg:shadow-xs ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* HEADER */}
        <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
          <h2 className="text-lg font-bold tracking-tight text-gray-900">Filters</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* CATEGORY SECTION */}
        <div className="border-b border-gray-100 pb-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Categories
          </h3>
          <div className="space-y-1">
            <div
              className={`flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-all cursor-pointer ${
                category === "all"
                  ? "bg-black text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setCategory("all")}
            >
              All Products
            </div>

            {loading ? (
              <div className="space-y-2 py-3">
                <div className="h-8 w-full animate-pulse rounded-xl bg-gray-100" />
                <div className="h-8 w-3/4 animate-pulse rounded-xl bg-gray-100" />
              </div>
            ) : (
              <div className="mt-1 space-y-1">
                {categories.map((cat) => (
                  <CategoryNode
                    key={cat._id}
                    cat={cat}
                    category={category}
                    setCategory={setCategory}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* PRICE SECTION */}
        <div className="mt-6 border-b border-gray-100 pb-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Price Range ($)
          </h3>
          <div className="flex items-center gap-3">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm outline-none transition-all focus:border-black focus:ring-1 focus:ring-black"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm outline-none transition-all focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>
        </div>

        {/* STOCK SECTION */}
        <div className="mt-6">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl px-1 py-1 text-sm text-gray-700 hover:text-black">
            <input
              type="checkbox"
              checked={stockOnly}
              onChange={(e) => setStockOnly(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-black accent-black focus:ring-black"
            />
            <span className="font-medium">In Stock Only</span>
          </label>
        </div>

        {/* CLEAR FILTER BUTTON */}
        <button
          onClick={clearFilter}
          className="mt-8 w-full rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-800 shadow-xs transition-all hover:bg-black hover:text-white hover:border-black"
        >
          Clear All Filters
        </button>
      </aside>
    </>
  );
}
