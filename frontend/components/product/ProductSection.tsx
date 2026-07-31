import Link from "next/link";
import { Product } from "@/types/product";
import ProductCard from "./ProductCard";

export default function ProductSection({
  title,
  products,
  viewAll = false,
  href = "/shop"
}: {
  title: string;
  products: Product[];
  viewAll?: boolean;
  href?: string;
}) {
  return (
    <section className="mt-12 px-4 md:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold md:text-3xl text-gray-900">{title}</h2>
          <p className="mt-1 text-sm text-gray-500">{products.length} Products</p>
        </div>

        {viewAll && (
          <Link
            href={href}
            className="flex-shrink-0 rounded-full border border-gray-300 px-5 py-2 text-sm font-medium transition hover:bg-black hover:text-white"
          >
            View All
          </Link>
        )}
      </div>

      {/* Empty State */}
      {products.length === 0 && (
        <div className="rounded-3xl bg-gray-50 p-10 text-center text-gray-500">
          No products found
        </div>
      )}

      {/* Product Side Scroll Container */}
      {products.length > 0 && (
        <div className="relative w-full overflow-hidden">
          <div 
            className="flex gap-4 overflow-x-auto pb-4 pt-1 scroll-smooth"
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
    </section>
  );
}
