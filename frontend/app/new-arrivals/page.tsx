"use client";

import { useEffect } from "react";

import ProductCard from "@/components/product/ProductCard";

import {
  useAppDispatch,
  useAppSelector,
} from "@/hooks/redux";

import {
  fetchNewArrivalProducts,
} from "@/store/slices/productSlice";

export default function NewArrivalsPage() {
  const dispatch =
    useAppDispatch();

  const products =
    useAppSelector(
      (state) =>
        state.products.newArrivals || []
    );

  const loading =
    useAppSelector(
      (state) =>
        state.products.loading
    );

  useEffect(() => {
    dispatch(
      fetchNewArrivalProducts()
    );
  }, [dispatch]);

  return (
    <main
      className="
      min-h-screen
      bg-gray-50
      py-10
      "
    >
      <div
        className="
        mx-auto
        max-w-7xl
        px-6
        "
      >
        {/* HEADER */}

        <div className="mb-8">
          <h1
            className="
            text-4xl
            font-bold
            "
          >
            New Arrivals
          </h1>

          <p
            className="
            mt-2
            text-gray-500
            "
          >
            {products.length} Products
            Found
          </p>
        </div>

        {/* LOADING */}

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
            {Array.from({
              length: 8,
            }).map((_, i) => (
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

        {/* EMPTY STATE */}

        {!loading &&
          products.length ===
            0 && (
            <div
              className="
              rounded-3xl
              bg-white
              p-10
              text-center
              "
            >
              <h2
                className="
                text-2xl
                font-bold
                "
              >
                No New Arrivals
                Found
              </h2>

              <p
                className="
                mt-2
                text-gray-500
                "
              >
                Please check
                again later.
              </p>
            </div>
          )}

        {/* PRODUCTS */}

        {!loading &&
          products.length >
            0 && (
            <div
              className="
              grid
              grid-cols-2
              gap-5
              sm:grid-cols-3
              xl:grid-cols-4
              "
            >
              {products.map(
                (product: any) => (
                  <ProductCard
                    key={
                      product._id
                    }
                    product={
                      product
                    }
                  />
                )
              )}
            </div>
          )}
      </div>
    </main>
  );
}