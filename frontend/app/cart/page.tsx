"use client";

import Link from "next/link";
import {
  ArrowRight,
  ShoppingBag,
  Trash2,
  Sparkles,
  Flame,
} from "lucide-react";
import useCart from "@/hooks/useCart";
import CartItem from "@/components/cart/CartItem";
import { useCurrency } from "@/context/CurrencyContext";
import { useState, useEffect } from "react";
import { getDeliveryZones } from "@/services/deliveryZone.service";
import { getRelatedProducts } from "@/services/product.service";
import { Product } from "@/types/product";
import {
  useAppDispatch,
  useAppSelector,
} from "@/hooks/redux";
import { fetchDealProducts } from "@/store/slices/productSlice";
import ProductCard from "@/components/product/ProductCard";

export default function CartPage() {
  const dispatch = useAppDispatch();
  const cartContext = useCart() as any;
  const { cart, loading: cartLoading, totalItems, clearCart } = cartContext;
  const { formatPrice } = useCurrency();

  const [currentZone, setCurrentZone] = useState<any>(null);
  
  // Redux থেকে হট ডিলস প্রোডাক্টগুলো নিয়ে আসা
  const dealProducts = useAppSelector(
    (state: any) => state.products.deals || []
  );
  
  const productsLoading = useAppSelector(
    (state: any) => state.products.loading
  );

  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);

  // কম্পোনেন্ট লোড হওয়ার সময় ডিল প্রোডাক্টস ফেচ করা
  useEffect(() => {
    dispatch(fetchDealProducts());
  }, [dispatch]);

  // কার্টের প্রোডাক্টগুলোর উপর ভিত্তি করে রিলেটেড প্রোডাক্ট এবং ডেলিভারি জোন ফেচ করা
  useEffect(() => {
    const fetchCartRelatedData = async () => {
      try {
        const zonesDataPromise = getDeliveryZones().catch(() => []);
        
        let relatedPromise: Promise<any> = Promise.resolve([]);
        if (cart?.items && cart.items.length > 0) {
          const firstItem = cart.items[0];
          const firstProductId = firstItem.product?._id?.toString() || firstItem.product?.toString();
          if (firstProductId) {
            relatedPromise = getRelatedProducts(firstProductId).catch(() => []);
          }
        }

        const [zonesData, relatedProds] = await Promise.all([
          zonesDataPromise,
          relatedPromise,
        ]);

        if (Array.isArray(zonesData) && zonesData.length > 0) {
          const activeZones = zonesData.filter((z: any) => z.active);
          setCurrentZone(activeZones[0] || zonesData[0]);
        }

        setRecommendedProducts(Array.isArray(relatedProds) ? relatedProds.slice(0, 4) : []);
      } catch (error) {
        console.error("Failed to load cart recommendations:", error);
      }
    };

    if (!cartLoading) {
      fetchCartRelatedData();
    }
  }, [cart, cartLoading]);

  if (cartLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="space-y-4 text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
          <p className="font-medium text-gray-500">Loading your cart...</p>
        </div>
      </main>
    );
  }

  if (!cart?.items?.length) {
    return (
      <main className="flex min-h-[80vh] items-center justify-center bg-gray-50 px-6">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-white shadow-md">
            <ShoppingBag size={55} className="text-gray-400" />
          </div>
          <h1 className="mt-8 text-3xl font-black tracking-tight">Your cart is empty</h1>
          <p className="mt-3 text-gray-500">Discover amazing products and add them to your cart to get started.</p>
          <Link
            href="/shop"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-black px-8 py-4 font-semibold text-white transition-all hover:bg-zinc-800 hover:shadow-lg"
          >
            Start Shopping <ArrowRight size={18} />
          </Link>
        </div>
      </main>
    );
  }

  const subtotal = Number(cart.total || 0);

  return (
    <main className="min-h-screen bg-gray-50 pb-32 pt-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Shopping Cart</h1>
            <p className="mt-1 text-gray-500 text-sm">{totalItems} products currently in your cart</p>
          </div>
          <button
            onClick={() => clearCart && clearCart()}
            className="inline-flex items-center gap-2 self-start rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 sm:self-auto"
          >
            <Trash2 size={16} /> Clear Cart
          </button>
        </div>

        {/* Cart Products List Section */}
        <section className="space-y-4">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between border-b pb-4">
              <h2 className="text-xl font-bold">Cart Items</h2>
              <span className="rounded-full bg-gray-100 px-4 py-1 text-sm font-semibold text-gray-700">
                {totalItems} {totalItems === 1 ? "Item" : "Items"}
              </span>
            </div>
            <div className="space-y-4">
              {cart.items.map((item: any, index: number) => {
                const itemId = item.product?._id?.toString() || item.product?.toString() || index;
                return <CartItem key={itemId} item={item} />;
              })}
            </div>
          </div>
        </section>

        {/* 1. Hot Deals Section (Using ProductCard) */}
        <section className="mt-12">
          <div className="flex items-center gap-2 mb-6">
            <Flame className="text-orange-500" size={22} />
            <h2 className="text-2xl font-black tracking-tight">Hot Deals</h2>
          </div>

          {productsLoading && dealProducts.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-64 rounded-2xl bg-white animate-pulse" />
              ))}
            </div>
          ) : dealProducts.length === 0 ? (
            <p className="text-sm text-gray-500">No active deals right now.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {dealProducts.slice(0, 4).map((prod: any) => (
                <ProductCard key={prod._id?.toString()} product={prod} />
              ))}
            </div>
          )}
        </section>

        {/* 2. You May Also Like (Related Products - Using ProductCard) */}
        <section className="mt-12">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="text-amber-500" size={22} />
            <h2 className="text-2xl font-black tracking-tight">You May Also Like (Related Products)</h2>
          </div>

          {recommendedProducts.length === 0 ? (
            <p className="text-sm text-gray-500">No related products available right now.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {recommendedProducts.map((prod: any) => (
                <ProductCard key={prod._id?.toString()} product={prod} />
              ))}
            </div>
          )}
        </section>

      </div>

      {/* Fixed Footer Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-md shadow-lg py-4 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-start">
            <div>
              <p className="text-xs text-gray-500 font-medium">Subtotal ({totalItems} items)</p>
              <p className="text-2xl font-black text-gray-900">{formatPrice(subtotal)}</p>
            </div>
            <div className="hidden sm:block h-8 w-px bg-gray-200"></div>
            <div className="hidden sm:block">
              <p className="text-xs text-emerald-600 font-bold">✓ Shipping & Tax Calculated at Checkout</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/shop"
              className="flex-1 sm:flex-none text-center rounded-xl border border-gray-300 bg-white px-6 py-3.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
            >
              Continue Shopping
            </Link>
            <Link
              href="/checkout"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-black px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-zinc-800 hover:shadow-lg"
            >
              Proceed To Checkout <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
