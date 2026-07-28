"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CheckoutHeader from "@/components/checkout/CheckoutHeader";
import CheckoutStepper from "@/components/checkout/CheckoutStepper";
import { ShieldCheck, Lock, ArrowLeft, ArrowRight, Phone, CheckCircle2, Loader2 } from "lucide-react";
import { createOrder } from "@/services/order.service";
import { initiatePayment } from "@/services/payment.service";
import useCart from "@/hooks/useCart";

export default function PhoneVerificationPage() {
  const router = useRouter();
  const { clearCart } = useCart();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
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

    if (checkout.phone) {
      setPhone(checkout.phone);
    }
  }, [router]);

  // =====================
  // SEND OTP HANDLER
  // =====================
  const handleSendOtp = async () => {
    setError("");

    if (!phone.trim() || phone.length < 11) {
      setError("Please enter a valid 11-digit phone number.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("https://miniature-telegram-xrwrwxwvw79xfvj6-5000.app.github.dev/api/phone-otp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, purpose: "register" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send OTP");
      }

      setIsOtpSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // =====================
  // VERIFY OTP HANDLER
  // =====================
  const handleVerifyOtp = async () => {
    setError("");

    if (!otp.trim() || otp.length < 4) {
      setError("Please enter a valid verification code.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("https://miniature-telegram-xrwrwxwvw79xfvj6-5000.app.github.dev/api/phone-otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, otp, purpose: "register" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid or expired OTP");
      }

      setIsVerified(true);
    } catch (err: any) {
      setError(err.message || "Verification failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // =====================
  // COMPLETE ORDER
  // =====================
  const handleCompleteOrder = async () => {
    setError("");

    if (!isVerified) {
      setError("Please verify your phone number before continuing.");
      return;
    }

    try {
      setLoading(true);

      const checkout = JSON.parse(
        sessionStorage.getItem("checkoutData") || "{}"
      );

      const orderData = {
        shippingAddress: {
          fullName: checkout.name,
          phone: phone,
          country: checkout.country || "Bangladesh",
          address: checkout.location?.formattedAddress || "",
          location: checkout.location,
        },
        deliveryZone: checkout.deliveryZone,
        deliveryFee: checkout.shipping || 0,
        paymentMethod: checkout.paymentMethod,
        transactionId: checkout.transactionId || null,
        couponCode: checkout.couponCode || null,
        discount: checkout.discount || 0,
        phoneVerified: true,
      };

      const res = await createOrder(orderData);
      const orderId = res.order._id;

      if (
        checkout.paymentMethod === "CARD" ||
        checkout.paymentMethod === "SSLCOMMERZ"
      ) {
        const payment = await initiatePayment({
          orderId,
          amount: checkout.total,
          customerName: checkout.name,
          phone: phone,
          address: checkout.location?.formattedAddress || "",
        });

        if (payment?.payment?.GatewayPageURL) {
          router.push(
            `/checkout/payment-redirect?url=${encodeURIComponent(
              payment.payment.GatewayPageURL
            )}`
          );
        } else {
          throw new Error("Payment gateway failed");
        }
      } else {
        await clearCart();
        sessionStorage.removeItem("checkoutData");
        router.push(`/checkout/success?order=${orderId}`);
      }

    } catch (err: any) {
      setError(err?.message || "Order submission failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50/50 pb-16 pt-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <CheckoutHeader />

        <div className="mt-6">
          <CheckoutStepper currentStep={4} />
        </div>

        <div className="mt-8 grid gap-8">
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 pb-5 gap-2">
              <div>
                <h1 className="text-lg font-bold text-zinc-900">Phone Verification</h1>
                <p className="text-xs text-zinc-500 mt-0.5">Please verify your phone number to complete your order.</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full w-fit">
                <ShieldCheck size={15} />
                <span>Secure Authentication</span>
              </div>
            </div>

            <div className="space-y-4 max-w-lg mx-auto py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Phone Number</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-zinc-400">
                    <Phone size={16} />
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isOtpSent || isVerified}
                    placeholder="017xxxxxxxx"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-3.5 pl-10 pr-4 text-xs font-medium text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all disabled:opacity-60"
                  />
                </div>
              </div>

              {!isOtpSent && !isVerified && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full rounded-xl bg-zinc-900 py-3 text-xs font-bold text-white transition-all hover:bg-zinc-800 disabled:opacity-50 shadow-sm flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  <span>{loading ? "Sending Code..." : "Send Verification Code"}</span>
                </button>
              )}

              {isOtpSent && !isVerified && (
                <div className="space-y-4 animate-fadeIn pt-2">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Enter OTP Code</label>
                      <button 
                        type="button" 
                        onClick={() => setIsOtpSent(false)} 
                        className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-900"
                      >
                        Change Number
                      </button>
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter OTP"
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-3.5 text-center text-sm font-bold tracking-widest text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={loading}
                    className="w-full rounded-xl bg-zinc-900 py-3 text-xs font-bold text-white transition-all hover:bg-zinc-800 disabled:opacity-50 shadow-sm flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 size={14} className="animate-spin" />}
                    <span>{loading ? "Verifying..." : "Verify Code"}</span>
                  </button>
                </div>
              )}

              {isVerified && (
                <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 border border-emerald-100 animate-fadeIn">
                  <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-900">Phone Verified Successfully!</p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">Your phone number {phone} has been confirmed.</p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-xs font-semibold text-red-600 animate-fadeIn flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-600 shrink-0" />
                {error}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => router.push("/checkout/review")}
              className="flex-1 sm:flex-initial sm:w-40 inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white py-4 text-xs font-bold text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 active:scale-[0.99]"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleCompleteOrder}
              disabled={!isVerified || loading}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-4 text-xs font-bold text-white shadow-sm transition-all hover:bg-zinc-800 disabled:opacity-50 active:scale-[0.99]"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              <span>{loading ? "Processing Order..." : "Complete Order"}</span>
              {!loading && <ArrowRight size={16} />}
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-center text-[11px] font-medium text-zinc-400 pt-2">
            <Lock size={13} />
            <span>Your personal information is kept secure and confidential.</span>
          </div>
        </div>
      </div>
    </main>
  );
}
