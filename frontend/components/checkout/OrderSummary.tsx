"use client";

import {
  ShoppingBag,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext"; // কারেন্সি কনটেক্সট ইম্পোর্ট করা হলো

interface Props {
  items: any[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  loading: boolean;
}

export default function OrderSummary({
  items,
  subtotal,
  shipping,
  tax,
  discount,
  total,
  loading,
}: Props) {
  const { formatPrice } = useCurrency(); // formatPrice ফাংশনটি আনা হলো

  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm sticky top-5">
      <h2 className="mb-6 flex items-center gap-2 text-xl font-bold">
        <ShoppingBag size={24} />
        Order Summary
      </h2>

      {/* ITEMS LIST */}
      <div className="space-y-5 max-h-[420px] overflow-y-auto">
        {items.map((item: any) => {
          // কার্ট আইটেমের মতো শক্তিশালী ফলব্যাক দিয়ে সাইজ ও কালার এক্সট্রাক্ট করা
          const product = typeof item?.product === "object" && item?.product !== null ? item.product : {};
          
          const selectedSize = 
            item?.selectedSize || 
            item?.size || 
            item?.variantSize || 
            product?.selectedSize || 
            product?.size || 
            product?.capacity || 
            product?.storage ||
            "";

          const selectedColor = 
            item?.selectedColor || 
            item?.color || 
            item?.variantColor || 
            product?.selectedColor || 
            product?.color || 
            "";

          return (
            <div key={item._id || item.product} className="flex gap-4 border-b pb-4">
              <div className="h-16 w-16 overflow-hidden rounded-xl bg-zinc-100 shrink-0">
                {item.product?.images?.[0]?.url && (
                  <img
                    src={item.product.images[0].url}
                    alt={item.product.name}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold line-clamp-2">
                  {item.product?.name || item.name}
                </h3>

                {/* সিলেক্ট করা ভ্যারিয়েন্ট (সাইজ ও কালার) */}
                {(selectedSize || selectedColor) && (
                  <div className="flex items-center gap-2.5 text-[11px] text-zinc-500 font-medium mt-1">
                    {selectedSize && (
                      <span>
                        Size: <strong className="text-zinc-800">{selectedSize}</strong>
                      </span>
                    )}
                    {selectedColor && (
                      <span>
                        Color: <strong className="text-zinc-800 capitalize">{selectedColor}</strong>
                      </span>
                    )}
                  </div>
                )}

                <p className="mt-1 text-xs text-zinc-500">
                  Qty: {item.quantity}
                </p>
              </div>

              {/* প্রতিটি আইটেমের মোট প্রাইস */}
              <div className="font-semibold text-sm shrink-0">
                {formatPrice(item.price * item.quantity)}
              </div>
            </div>
          );
        })}
      </div>

      {/* PRICE BREAKDOWN */}
      <div className="my-6 border-t pt-5 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Shipping</span>
          <span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Tax</span>
          <span>{formatPrice(tax)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}

        <div className="mt-4 flex justify-between border-t pt-4 text-xl font-bold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      <div className="mb-5 flex items-center gap-2 rounded-xl bg-green-50 p-4 text-sm text-green-700">
        <ShieldCheck size={18} />
        Secure & Protected Checkout
      </div>

      <button
        disabled={loading}
        className="w-full rounded-2xl bg-black py-4 font-bold text-white transition hover:bg-zinc-800 disabled:opacity-50 cursor-pointer"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" />
            Processing...
          </div>
        ) : (
          "Place Order"
        )}
      </button>
    </div>
  );
}
