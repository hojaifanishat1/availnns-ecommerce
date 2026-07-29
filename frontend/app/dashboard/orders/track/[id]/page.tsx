"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, Package, Truck } from "lucide-react";
import { getMyOrders } from "@/services/order.service";
import { useCurrency } from "@/context/CurrencyContext";

export default function TrackOrderPage() {
  const params = useParams();
  const id = params?.id as string;
  const { formatPrice } = useCurrency();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const orders = await getMyOrders();
        const found = orders.find((o: any) => o._id === id);
        setOrder(found || null);
      } catch (error) {
        console.error("Failed to load order:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading tracking info...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Order Not Found</h2>
        <p className="text-sm text-gray-500">We couldn't find the order you are looking for.</p>
        <Link
          href="/dashboard/orders"
          className="inline-block bg-black text-white px-5 py-2 rounded-xl text-sm font-medium"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const statusSteps = ["pending", "processing", "shipped", "delivered"];
  const currentStatusIndex = statusSteps.indexOf(order.orderStatus?.toLowerCase() || "pending");

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-sans pb-10">
      {/* Back Button & Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/orders"
          className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Track Order</h1>
          <p className="text-xs text-gray-500">Order ID: #{order._id.slice(-8)}</p>
        </div>
      </div>

      {/* Order Status Card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <p className="text-xs text-gray-500">Total Amount</p>
            <p className="text-lg font-bold">{formatPrice(order.totalPrice)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 text-right">Order Date</p>
            <p className="text-sm font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-6 relative before:absolute before:inset-0 before:left-4 before:h-full before:w-0.5 before:bg-gray-100">
          <div className="flex items-center gap-4 relative">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${currentStatusIndex >= 0 ? "bg-black text-white" : "bg-gray-100 text-gray-400"}`}>
              <Clock size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Order Placed</p>
              <p className="text-xs text-gray-500">Your order has been received successfully.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 relative">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${currentStatusIndex >= 1 ? "bg-black text-white" : "bg-gray-100 text-gray-400"}`}>
              <Package size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Processing</p>
              <p className="text-xs text-gray-500">Seller is processing your order.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 relative">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${currentStatusIndex >= 2 ? "bg-black text-white" : "bg-gray-100 text-gray-400"}`}>
              <Truck size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Shipped / On the Way</p>
              <p className="text-xs text-gray-500">Your order is out for delivery.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 relative">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${currentStatusIndex >= 3 ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-400"}`}>
              <CheckCircle2 size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Delivered</p>
              <p className="text-xs text-gray-500">Package has been delivered.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
