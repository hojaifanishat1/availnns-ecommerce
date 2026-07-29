import { Product } from "@/types/product";
import ProductCard from "./ProductCard";

interface Props {
  products: Product[];
  loading?: boolean;
}

export default function ProductGrid({
  products,
  loading = false,
}: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col bg-white rounded-3xl border border-zinc-100 overflow-hidden shadow-xs animate-pulse"
          >
            {/* Image Placeholder */}
            <div className="w-full h-48 sm:h-64 bg-zinc-200" />
            
            {/* Content Placeholder */}
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="h-3 bg-zinc-200 rounded-full w-1/3" />
                <div className="h-4 bg-zinc-200 rounded-full w-4/5" />
                <div className="h-4 bg-zinc-200 rounded-full w-2/3" />
              </div>
              <div className="pt-2 flex items-center justify-between">
                <div className="h-5 bg-zinc-200 rounded-full w-1/4" />
                <div className="h-9 w-9 bg-zinc-200 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl bg-white border border-zinc-100 p-12 text-center shadow-xs my-8">
        <div className="h-16 w-16 bg-zinc-100 rounded-full flex items-center justify-center text-2xl mb-4">
          📦
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight">
          No Products Found
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-zinc-500 max-w-sm">
          We couldn't find any products matching your selection. Try changing your filters or search keywords.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product, index) => (
        <div
          key={product._id}
          className="animate-in fade-in zoom-in-95 duration-500"
          style={{
            animationDelay: `${index * 40}ms`,
          }}
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
