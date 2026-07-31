"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/product/ProductCard";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchDealProducts } from "@/store/slices/productSlice";

export default function DealsPage() {
  const dispatch = useAppDispatch();

  const allDealProducts = useAppSelector(
    (state) => state.products.deals || []
  );

  const loading = useAppSelector(
    (state) => state.products.loading
  );

  const [activeTab, setActiveTab] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchDealProducts());
  }, [dispatch]);

  // Filters
  const megaDeals = allDealProducts.filter((p: any) => (p.discountPercentage || p.discount || 0) >= 25);
  const specialOffers = allDealProducts.filter((p: any) => {
    const d = p.discountPercentage || p.discount || 0;
    return d >= 15 && d < 25;
  });
  const hotDiscounts = allDealProducts.filter((p: any) => {
    const d = p.discountPercentage || p.discount || 0;
    return d >= 5 && d < 14;
  });

  const getDisplayProducts = () => {
    if (activeTab === "mega") return megaDeals;
    if (activeTab === "special") return specialOffers;
    if (activeTab === "hot") return hotDiscounts;
    return [];
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10 pb-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">
              {activeTab === "mega" && "🔥 Mega Deals"}
              {activeTab === "special" && "⚡ Special Offers"}
              {activeTab === "hot" && "✨ Hot Discounts"}
              {!activeTab && "All Deals & Offers"}
            </h1>
          </div>

          {activeTab && (
            <button
              onClick={() => setActiveTab(null)}
              className="rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-medium transition hover:bg-black hover:text-white"
            >
              ← Back to All
            </button>
          )}
        </div>

        {/* LOADING */}
        {loading && (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-96 rounded-3xl bg-white animate-pulse" />
            ))}
          </div>
        )}

        {/* CONTENT */}
        {!loading && allDealProducts.length > 0 && (
          <>
            {!activeTab ? (
              <div className="space-y-16">
                {/* 1. MEGA DEALS */}
                {megaDeals.length > 0 && (
                  <div>
                    <div className="mb-6 flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900">🔥 Mega Deals</h2>
                      <button
                        onClick={() => setActiveTab("mega")}
                        className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium transition hover:bg-black hover:text-white"
                      >
                        View All
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4">
                      {megaDeals.slice(0, 4).map((product: any) => (
                        <ProductCard key={product._id} product={product} />
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. SPECIAL OFFERS */}
                {specialOffers.length > 0 && (
                  <div>
                    <div className="mb-6 flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900">⚡ Special Offers</h2>
                      <button
                        onClick={() => setActiveTab("special")}
                        className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium transition hover:bg-black hover:text-white"
                      >
                        View All
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4">
                      {specialOffers.slice(0, 4).map((product: any) => (
                        <ProductCard key={product._id} product={product} />
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. HOT DISCOUNTS */}
                {hotDiscounts.length > 0 && (
                  <div>
                    <div className="mb-6 flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900">✨ Hot Discounts</h2>
                      <button
                        onClick={() => setActiveTab("hot")}
                        className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium transition hover:bg-black hover:text-white"
                      >
                        View All
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4">
                      {hotDiscounts.slice(0, 4).map((product: any) => (
                        <ProductCard key={product._id} product={product} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4">
                {getDisplayProducts().map((product: any) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
