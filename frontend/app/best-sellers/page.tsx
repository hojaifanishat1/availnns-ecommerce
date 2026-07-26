"use client";

import { useEffect } from "react";

import ProductCard from "@/components/product/ProductCard";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";

import { fetchBestSellerProducts } from "@/store/slices/productSlice";

export default function BestSellersPage() {
  const dispatch = useAppDispatch();

  const products = useAppSelector(
    (state) => state.products.bestSellers || []
  );

  const loading = useAppSelector(
    (state) => state.products.loading
  );

  useEffect(() => {
    dispatch(fetchBestSellerProducts());
  }, [dispatch]);

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            Best Sellers
          </h1>

          <p className="mt-2 text-gray-500">
            {products.length} Products Found
          </p>
        </div>

        {loading && (
          <div
            className="
            grid
            grid-cols-2
            gap-5
            sm:grid-cols-3
            xl:grid-cols-4
            "
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="
                h-96
                rounded-3xl
                bg-white
                animate-pulse
                "
              />
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div
            className="
            rounded-3xl
            bg-white
            p-10
            text-center
            "
          >
            <h2 className="text-xl font-bold">
              No Best Seller Products Found
            </h2>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div
            className="
            grid
            grid-cols-2
            gap-5
            sm:grid-cols-3
            xl:grid-cols-4
            "
          >
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}