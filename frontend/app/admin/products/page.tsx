"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Edit, Trash2, Plus, Package, Star, TrendingUp, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getAdminProducts, removeProduct } from "@/services/product.service";
import { Product } from "@/types/product";
import { useCurrency } from "@/context/CurrencyContext"; // 1. useCurrency import kora holo

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // 2. formatPrice function extract kora holo
  const { formatPrice } = useCurrency();

  const loadProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const data = await getAdminProducts(token);
      setProducts(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const deleteProduct = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      await removeProduct(id, token);
      setProducts((prev) => prev.filter((item) => item._id !== id));
      toast.success("Product deleted successfully");
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  if (loading) {
    return (
      <div className="grid md:grid-cols-3 gap-6 p-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-80 rounded-3xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Products</h1>
          <p className="text-gray-500">Manage your store inventory efficiently.</p>
        </div>
        <Link
          href="/admin/products/add"
          className="flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 text-white font-semibold hover:bg-gray-800 transition-all"
        >
          <Plus size={18} /> Add New Product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Products" value={products.length} icon={Package} />
        <StatCard title="Featured" value={products.filter((p) => p.isFeatured).length} icon={Star} />
        <StatCard title="Best Sellers" value={products.filter((p) => p.isBestSeller).length} icon={TrendingUp} />
        <StatCard title="Low Stock" value={products.filter((p) => p.stock < 10).length} icon={AlertTriangle} className="text-red-500" />
      </div>

      {/* Search */}
      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by product name..."
          className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-12 pr-5 outline-none focus:ring-2 focus:ring-black transition-all"
        />
      </div>

      {/* Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
          <Package size={50} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold">No Products Found</h2>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product._id} 
              product={product} 
              onDelete={() => deleteProduct(product._id)} 
              formatPrice={formatPrice} // 3. formatPrice prop hishabe pass kora holo
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Sub-components for better maintainability
function ProductCard({ product, onDelete, formatPrice }: { product: Product; onDelete: () => void; formatPrice: (price: number) => string }) {
  const activePrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const originalPrice = product.price;

  return (
    <div className="group rounded-3xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-xl transition-all">
      <div className="relative h-60 overflow-hidden rounded-2xl bg-gray-100">
        <Image src={product.images?.[0]?.url || "/placeholder.png"} alt={product.name} fill className="object-cover transition group-hover:scale-105" />
        {product.discountPrice > 0 && <span className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs text-white font-bold">SALE</span>}
      </div>

      <h2 className="mt-4 truncate text-lg font-bold">{product.name}</h2>
      <p className="text-sm text-gray-500">{typeof product.category === "object" ? product.category.name : "Uncategorized"}</p>

      {/* 4. formatPrice use kora holo */}
      <div className="mt-3 flex items-center gap-3">
        <span className="text-xl font-black">{formatPrice(activePrice)}</span>
        {product.discountPrice > 0 && <span className="line-through text-gray-400 text-sm">{formatPrice(originalPrice)}</span>}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm font-medium">Stock: <span className={product.stock < 10 ? "text-red-500 font-bold" : "text-green-600 font-bold"}>{product.stock}</span></p>
        <div className="flex gap-2">
          <Link href={`/admin/products/edit/${product._id}`} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"><Edit size={16} /></Link>
          <button onClick={onDelete} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><Trash2 size={16} /></button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, className }: any) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
      <div className={`rounded-xl bg-black p-3 text-white w-fit ${className}`}> <Icon size={22} /> </div>
      <p className="mt-4 text-sm text-gray-500">{title}</p>
      <h3 className="text-3xl font-black">{value}</h3>
    </div>
  );
}
