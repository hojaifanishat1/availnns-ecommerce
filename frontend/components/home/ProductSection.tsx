"use client";

import Link from "next/link";
import { Product } from "@/types/product";
import ProductCard from "@/components/product/ProductCard";

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  loading: boolean;
  viewAllHref?: string;
}

export default function ProductSection({
  title,
  subtitle,
  products,
  loading,
  viewAllHref = "/shop",
}: ProductSectionProps) {
  if (loading) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold md:text-3xl text-gray-900">{title}</h2>
          <p className="mt-5 text-sm text-gray-500">Loading...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header with Title, Subtitle, and View All */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl text-gray-900">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
            ) : (
              <p className="mt-1 text-sm text-gray-500">{products.length} Products</p>
            )}
          </div>

          <Link
            href={viewAllHref}
            className="flex-shrink-0 rounded-full border border-gray-300 px-5 py-2 text-sm font-medium transition hover:bg-black hover:text-white"
          >
            View All
          </Link>
        </div>

        {/* Products Scroll Container or Empty State */}
        {products.length === 0 ? (
          <div className="rounded-3xl bg-gray-50 p-10 text-center text-gray-500">
            No products found.
          </div>
        ) : (
          <div className="relative w-full overflow-hidden">
            <div 
              className="flex flex-nowrap gap-4 overflow-x-auto pb-4 pt-1 scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {products.map((product, index) => (
                <div
                  key={product._id}
                  className="w-[240px] sm:w-[260px] flex-shrink-0 animate-in fade-in duration-500"
                  style={{
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
