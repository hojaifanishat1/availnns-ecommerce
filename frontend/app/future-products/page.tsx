"use client";

import { useEffect } from "react";

import ProductCard from "@/components/product/ProductCard";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";

import { fetchFutureProducts } from "@/store/slices/productSlice";

export default function FutureProductsPage() {
  const dispatch = useAppDispatch();

  const products = useAppSelector((state) => state.products.futureProducts || []);
  const loading = useAppSelector((state) => state.products.loading);

  useEffect(() => {
    dispatch(fetchFutureProducts());
  }, [dispatch]);

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Future Products</h1>
          <p className="mt-2 text-gray-500">{products.length} Products Found</p>
        </div>

        {loading && (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-96 rounded-3xl bg-white animate-pulse"
              />
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="rounded-3xl bg-white p-10 text-center">
            <h2 className="text-2xl font-bold">No Future Products Found</h2>
            <p className="mt-2 text-gray-500">Check back later for upcoming launches.</p>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
