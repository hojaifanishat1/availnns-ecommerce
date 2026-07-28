"use client";

import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Sparkles,
  Tag,
  Trash2,
} from "lucide-react";
import useCart from "@/hooks/useCart";
import CartItem from "@/components/cart/CartItem";
import { useCurrency } from "@/context/CurrencyContext";
import { useState } from "react";

export default function CartPage() {
  const { cart, loading, totalItems, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  // Loading State with Modern Skeleton
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="space-y-4 text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
          <p className="font-medium text-gray-500">Loading your cart...</p>
        </div>
      </main>
    );
  }

  // Empty Cart State
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

  // Price Calculations
  const subtotal = Number(cart.total || 0);
  const shipping = subtotal >= 100 || subtotal === 0 ? 0 : 10;
  const tax = subtotal * 0.05;
  const total = subtotal + shipping + tax - discount;
  const progress = Math.min((subtotal / 100) * 100, 100);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (coupon.toUpperCase() === "DISCOUNT10") {
      setDiscount(10);
    } else {
      alert("Invalid Coupon Code");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Shopping Cart</h1>
            <p className="mt-2 text-gray-500">{totalItems} products currently in your cart</p>
          </div>
          <button
            onClick={() => clearCart && clearCart()}
            className="inline-flex items-center gap-2 self-start rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 sm:self-auto"
          >
            <Trash2 size={16} /> Clear Cart
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Products Section */}
          <section className="space-y-5 lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between border-b pb-4">
                <h2 className="text-xl font-bold">Cart Items</h2>
                <span className="rounded-full bg-gray-100 px-4 py-1 text-sm font-semibold text-gray-700">
                  {totalItems} {totalItems === 1 ? "Item" : "Items"}
                </span>
              </div>
              <div className="space-y-4">
                {cart.items.map((item: any, index: number) => {
                  const itemId =
                    item.product?._id?.toString() ||
                    item.product?.toString() ||
                    index;

                  return <CartItem key={itemId} item={item} />;
                })}
              </div>
            </div>

            {/* Benefits Grid */}
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: Truck, title: "Fast Delivery", desc: "2-5 business days delivery" },
                { icon: ShieldCheck, title: "Secure Payment", desc: "100% protected checkout" },
                { icon: Sparkles, title: "Premium Quality", desc: "Hand-verified products" },
              ].map((b, i) => (
                <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                  <b.icon size={24} className="text-black" />
                  <h3 className="mt-3 font-bold text-gray-900">{b.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{b.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Order Summary Aside */}
          <aside className="h-fit lg:sticky lg:top-24">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-black tracking-tight">Order Summary</h2>

              {/* Free Shipping Progress */}
              <div className="mb-6 rounded-xl bg-gray-50 p-4 border border-gray-100">
                <div className="flex justify-between text-sm font-medium">
                  <span>Free Shipping Goal</span>
                  <span>{formatPrice(subtotal)} / {formatPrice(100)}</span>
                </div>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-gray-200">
                  <div className="h-full bg-black transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                {subtotal < 100 ? (
                  <p className="mt-2.5 text-xs text-gray-500">
                    Add <span className="font-semibold text-black">{formatPrice(100 - subtotal)}</span> more to unlock free shipping!
                  </p>
                ) : (
                  <p className="mt-2.5 text-xs font-bold text-green-600">🎉 Free shipping unlocked successfully!</p>
                )}
              </div>

              {/* Coupon Code Section */}
              <form onSubmit={handleApplyCoupon} className="mb-6 flex gap-2">
                <div className="relative flex-1">
                  <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Coupon code"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm focus:border-black focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
                >
                  Apply
                </button>
              </form>

              {/* Price Details */}
              <div className="space-y-3.5 text-sm text-gray-600 border-b pb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold text-gray-900">
                    {shipping === 0 ? <span className="text-green-600 font-bold">FREE</span> : formatPrice(shipping)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount Applied</span>
                    <span className="font-semibold">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Tax (5%)</span>
                  <span className="font-semibold text-gray-900">{formatPrice(tax)}</span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">Total Amount</span>
                <span className="text-3xl font-black text-gray-900">{formatPrice(total)}</span>
              </div>

              {/* Actions */}
              <Link
                href="/checkout"
                className="mt-7 flex items-center justify-center gap-2 rounded-xl bg-black py-4 font-bold text-white transition-all hover:bg-zinc-800 hover:shadow-lg"
              >
                Proceed To Checkout <ArrowRight size={18} />
              </Link>
              <Link
                href="/shop"
                className="mt-3 flex items-center justify-center rounded-xl border border-gray-200 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Continue Shopping
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
