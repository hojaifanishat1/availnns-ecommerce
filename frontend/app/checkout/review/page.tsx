"use client";

import {
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import {
  useRouter,
} from "next/navigation";
import {
  Loader2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import CheckoutHeader 
from "@/components/checkout/CheckoutHeader";
import CheckoutStepper 
from "@/components/checkout/CheckoutStepper";
import useCart 
from "@/hooks/useCart";
import {
  useCurrency,
} from "@/context/CurrencyContext";

export default function ReviewPage() {
  const router = useRouter();

  const {
    cart,
  } = useCart();

  const {
    formatPrice
  } = useCurrency();

  const [
    checkout,
    setCheckout
  ] = useState<any>(null);

  const items = useMemo(() => {
    return cart?.items || [];
  }, [cart]);

  // =======================
  // LOAD CHECKOUT DATA
  // =======================
  useEffect(() => {
    const data = sessionStorage.getItem("checkoutData");

    if (!data) {
      router.replace("/checkout");
      return;
    }

    setCheckout(JSON.parse(data));
  }, [router]);

  // =======================
  // PRICE CALCULATION
  // =======================
  const subtotal = useMemo(() => {
    return items.reduce(
      (sum: number, item: any) => {
        const price = Number(
          item.product?.discountPrice ||
          item.product?.price ||
          item.price ||
          0
        );
        return sum + (price * item.quantity);
      },
      0
    );
  }, [items]);

  const shipping = checkout?.deliveryFee || 0;
  const tax = subtotal * 0.05;
  const discount = checkout?.discount || 0;

  const total = Math.max(
    0,
    subtotal + shipping + tax - discount
  );

  // =======================
  // LOADING
  // =======================
  if (!checkout) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-900" />
      </div>
    );
  }

  // =======================
  // PROCEED TO VERIFY
  // =======================
  const handleProceedToVerify = () => {
    const oldData = JSON.parse(
      sessionStorage.getItem("checkoutData") || "{}"
    );

    sessionStorage.setItem(
      "checkoutData",
      JSON.stringify({
        ...oldData,
        subtotal,
        shipping,
        tax,
        discount,
        total,
      })
    );

    router.push("/checkout/verify");
  };

  return (
    <main className="min-h-screen bg-zinc-50/50 py-10 pb-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <CheckoutHeader />
        
        <div className="mt-6">
          <CheckoutStepper currentStep={4} />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* LEFT SIDE */}
          <div className="space-y-6 lg:col-span-2">
            {/* ORDER ITEMS */}
            <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="mb-5 text-base font-bold text-zinc-900">
                Order Items
              </h2>

              <div className="space-y-5">
                {items.map((item: any) => (
                  <div
                    key={item._id}
                    className="flex gap-4 border-b border-zinc-100 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-zinc-100 border border-zinc-100">
                      <img
                        src={
                          item?.product?.images?.[0]?.url ||
                          item?.product?.images?.[0] ||
                          "/placeholder.png"
                        }
                        alt={
                          item?.product?.name || "Product"
                        }
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                      <h3 className="font-bold text-xs text-zinc-900">
                        {item.product?.name}
                      </h3>

                      <p className="text-xs text-zinc-500 mt-0.5">
                        Quantity: {item.quantity}
                      </p>

                      <p className="mt-2 font-bold text-xs text-zinc-900">
                        {formatPrice(
                          (
                            item.product?.discountPrice ||
                            item.product?.price ||
                            item.price
                          ) * item.quantity
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DELIVERY INFO */}
            <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="mb-5 text-base font-bold text-zinc-900">
                Delivery Information
              </h2>

              <div className="grid gap-3 text-xs sm:grid-cols-2">
                <div className="bg-zinc-50/60 p-3 rounded-xl border border-zinc-100">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">Customer Name</p>
                  <p className="font-semibold text-zinc-900 mt-0.5">{checkout.name}</p>
                </div>

                <div className="bg-zinc-50/60 p-3 rounded-xl border border-zinc-100">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">Phone Number</p>
                  <p className="font-semibold text-zinc-900 mt-0.5">{checkout.phone}</p>
                </div>

                <div className="bg-zinc-50/60 p-3 rounded-xl border border-zinc-100 sm:col-span-2">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">Delivery Address</p>
                  <p className="font-semibold text-zinc-900 mt-0.5">{checkout.location?.formattedAddress}</p>
                </div>

                <div className="bg-zinc-50/60 p-3 rounded-xl border border-zinc-100">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">Payment Method</p>
                  <p className="font-semibold text-zinc-900 mt-0.5">{checkout.paymentMethod}</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="lg:sticky lg:top-6 h-fit space-y-4">
            <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="mb-5 text-base font-bold text-zinc-900">
                Order Summary
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-zinc-900">{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between text-zinc-600">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-zinc-900">{formatPrice(shipping)}</span>
                </div>

                <div className="flex justify-between text-zinc-600">
                  <span>Estimated Tax (5%)</span>
                  <span className="font-semibold text-zinc-900">{formatPrice(tax)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}

                <div className="border-t border-zinc-100 pt-3 mt-3">
                  <div className="flex justify-between text-sm font-black text-zinc-900">
                    <span>Total Amount</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleProceedToVerify}
                className="mt-6 w-full rounded-2xl bg-zinc-900 py-4 text-xs font-bold text-white shadow-sm transition-all hover:bg-zinc-800 active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <span>Proceed to Verification</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => router.push("/checkout/payment")}
                className="mt-3 w-full rounded-2xl border border-zinc-200 bg-white py-4 text-xs font-bold text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} />
                <span>Back to Payment</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-center text-[11px] font-medium text-zinc-400">
              <ShieldCheck size={14} />
              <span>Verified and Secure Checkout Process</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
