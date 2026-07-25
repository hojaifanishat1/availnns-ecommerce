"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  notFound,
} from "next/navigation";

import {
  getProductById,
  getRelatedProducts,
  getNewArrivalProducts,
  getBestSellerProducts,
} from "@/services/product.service";

import {
  Product,
} from "@/types/product";

import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductSection from "@/components/product/ProductSection";

export default function ProductDetailsPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const [product, setProduct] =
    useState<Product | null>(null);

  const [related, setRelated] =
    useState<Product[]>([]);

  const [recent, setRecent] =
    useState<Product[]>([]);

  const [bestSeller, setBestSeller] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const { id } = await params;

        const [
          productRes,
          relatedRes,
          newRes,
          bestRes,
        ] = await Promise.all([
          getProductById(id),
          getRelatedProducts(id),
          getNewArrivalProducts(),
          getBestSellerProducts(),
        ]);

        const currentProduct =
          productRes.product;

        if (!currentProduct) {
          notFound();
          return;
        }

        setProduct(currentProduct);

        setRelated(
          relatedRes
            .filter(
              (item: Product) =>
                item._id !== id
            )
            .slice(0, 4)
        );

        setRecent(
          newRes
            .filter(
              (item: Product) =>
                item._id !== id
            )
            .slice(0, 4)
        );

        setBestSeller(
          bestRes
            .filter(
              (item: Product) =>
                item._id !== id
            )
            .slice(0, 4)
        );
      } catch (error) {
        console.log(
          "Product details error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params]);

  if (loading) {
    return (
      <div
        className="
        min-h-screen
        flex
        items-center
        justify-center
      "
      >
        Loading product...
      </div>
    );
  }

  if (!product) {
    return null;
  }

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
        <div
          className="
          mb-8
          text-sm
          text-gray-500
        "
        >
          Home
          <span className="mx-2">
            /
          </span>
          Shop
          <span className="mx-2">
            /
          </span>
          <span className="text-black">
            {product.name}
          </span>
        </div>

        <section
          className="
          grid
          gap-12
          lg:grid-cols-2
        "
        >
          <ProductGallery
            product={product}
          />

          <ProductInfo
            product={product}
          />
        </section>

        {related.length > 0 && (
          <ProductSection
            title="Related Products"
            products={related}
          />
        )}

        {bestSeller.length > 0 && (
          <ProductSection
            title="Best Sellers"
            products={bestSeller}
          />
        )}

        {recent.length > 0 && (
          <ProductSection
            title="New Arrivals"
            products={recent}
          />
        )}
      </div>
    </main>
  );
}