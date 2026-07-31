"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/product/ProductCard";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchBestSellerProducts } from "@/store/slices/productSlice";

export default function BestSeller() {
  const dispatch = useAppDispatch();

  const products = useAppSelector(
    (state) => state.products.bestSellers || []
  );

  const loading = useAppSelector(
    (state) => state.products.loading
  );

  // Deals page er moto activeTab state use kora
  const [activeTab, setActiveTab] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchBestSellerProducts());
  }, [dispatch]);

  if (loading) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold">Best Sellers</h2>
          <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-96 rounded-3xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl text-gray-900">
              {activeTab === "all-best" ? "🔥 All Best Sellers" : "Best Sellers"}
            </h2>
          </div>

          {!activeTab ? (
            <button
              onClick={() => setActiveTab("all-best")}
              className="flex-shrink-0 rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-medium transition hover:bg-black hover:text-white"
            >
              View All
            </button>
          ) : (
            <button
              onClick={() => setActiveTab(null)}
              className="rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-medium transition hover:bg-black hover:text-white"
            >
              ← Back to Home
            </button>
          )}
        </div>

        {/* EMPTY STATE */}
        {products.length === 0 ? (
          <div className="rounded-3xl bg-gray-50 p-10 text-center text-gray-500 border border-gray-100">
            No products found
          </div>
        ) : (
          <>
            {!activeTab ? (
              // Scroll Container for Homepage View
              <div className="relative w-full overflow-hidden">
                <div 
                  className="flex flex-nowrap gap-4 overflow-x-auto pb-4 pt-1 scroll-smooth"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {products.map((product: any) => (
                    <div
                      key={product._id}
                      className="w-[240px] sm:w-[260px] flex-shrink-0"
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Full Grid View when 'View All' is clicked (Deals page er moto)
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4">
                {products.map((product: any) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
