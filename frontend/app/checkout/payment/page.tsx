"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CheckoutHeader from "@/components/checkout/CheckoutHeader";
import CheckoutStepper from "@/components/checkout/CheckoutStepper";
import PaymentMethods from "@/components/checkout/PaymentMethods";
import { ShieldCheck, Lock, ArrowLeft, ArrowRight } from "lucide-react";

export default function PaymentPage() {
  const router = useRouter();

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [transactionId, setTransactionId] = useState("");
  const [error, setError] = useState("");

  // =====================
  // LOAD CHECKOUT DATA
  // =====================
  useEffect(() => {
    const data = sessionStorage.getItem("checkoutData");

    if (!data) {
      router.replace("/checkout");
      return;
    }

    const checkout = JSON.parse(data);

    if (checkout.paymentMethod) {
      setPaymentMethod(checkout.paymentMethod);
    }

    if (checkout.transactionId) {
      setTransactionId(checkout.transactionId);
    }
  }, [router]);

  // =====================
  // PAYMENT SELECT
  // =====================
  const selectPayment = (method: string) => {
    setPaymentMethod(method);
  };

  // =====================
  // CONTINUE REVIEW
  // =====================
  const continueReview = () => {
    setError("");

    if (paymentMethod === "BKASH" || paymentMethod === "NAGAD") {
      if (!transactionId.trim()) {
        setError("Please enter your transaction ID to proceed.");
        return;
      }
    }

    const oldData = JSON.parse(
      sessionStorage.getItem("checkoutData") || "{}"
    );

    sessionStorage.setItem(
      "checkoutData",
      JSON.stringify({
        ...oldData,
        paymentMethod,
        transactionId,
      })
    );

    router.push("/checkout/review");
  };

  return (
    <main className="min-h-screen bg-zinc-50/50 pb-16 pt-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <CheckoutHeader />

        <div className="mt-6">
          <CheckoutStepper currentStep={3} />
        </div>

        <div className="mt-8 grid gap-8">
          {/* Main Card Container */}
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 pb-5 gap-2">
              <div>
                <h1 className="text-lg font-bold text-zinc-900">Payment Gateway</h1>
                <p className="text-xs text-zinc-500 mt-0.5">Select your preferred payment method to complete the order.</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full w-fit">
                <ShieldCheck size={15} />
                <span>Secure Checkout</span>
              </div>
            </div>

            {/* PAYMENT METHODS COMPONENT */}
            <PaymentMethods
              paymentMethod={paymentMethod}
              transactionId={transactionId}
              selectPayment={selectPayment}
              handleChange={(e: any) => setTransactionId(e.target.value)}
            />

            {/* ERROR ALERT */}
            {error && (
              <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-xs font-semibold text-red-600 animate-fadeIn flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-600 shrink-0" />
                {error}
              </div>
            )}
          </div>

          {/* Action Buttons Footer */}
          <div className="flex items-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => router.push("/checkout")}
              className="flex-1 sm:flex-initial sm:w-40 inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white py-4 text-xs font-bold text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 active:scale-[0.99]"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={continueReview}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-4 text-xs font-bold text-white shadow-sm transition-all hover:bg-zinc-800 active:scale-[0.99]"
            >
              <span>Continue Review</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Encryption Badge */}
          <div className="flex items-center justify-center gap-2 text-center text-[11px] font-medium text-zinc-400 pt-2">
            <Lock size={13} />
            <span>All transactions are encrypted and secured safely.</span>
          </div>

        </div>
      </div>
    </main>
  );
}
