import Link from "next/link";
import { Product } from "@/types/product";
import ProductCard from "./ProductCard";
import { ArrowRight } from "lucide-react";

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
    <section className="mt-16 px-4 md:px-8">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">
            {title}
          </h2>
        </div>

        {viewAll && (
          <Link
            href={href}
            className="group inline-flex items-center gap-2 rounded-2xl bg-zinc-100 hover:bg-zinc-900 text-zinc-800 hover:text-white px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-300 border border-zinc-200/80 shadow-2xs hover:shadow-md cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        )}
      </div>

      {/* Empty State */}
      {products.length === 0 && (
        <div className="rounded-[2.5rem] bg-zinc-50/80 border border-zinc-200/80 p-12 text-center shadow-xs">
          <p className="text-zinc-500 text-sm font-medium">No products found</p>
        </div>
      )}

      {/* Product Side Scroll Container */}
      {products.length > 0 && (
        <div className="relative w-full overflow-hidden">
          <div 
            className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 pt-2 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products.map((product, index) => (
              <div
                key={product._id}
                className="w-[240px] sm:w-[280px] flex-shrink-0 animate-in fade-in zoom-in-95 duration-700 fill-mode-both"
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
