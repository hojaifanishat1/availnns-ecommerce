"use client";

import {
  useEffect,
  useState
} from "react";

import {
  useParams,
  useRouter
} from "next/navigation";

import {
  ArrowLeft,
  CreditCard,
  Package,
  Truck
} from "lucide-react";

import Link from "next/link";

import {
  getOrderById,
  cancelOrder
} from "@/services/order.service";

import OrderTimeline
from "@/components/dashboard/OrderTimeline";

import ShippingCard
from "@/components/dashboard/ShippingCard";

import {
  useCurrency
} from "@/context/CurrencyContext";

export const dynamic = "force-dynamic";

export default function OrderDetailsPage(){
  const params = useParams<{ id?: string | string[] }>();
  const router = useRouter();
  const rawId = params?.id;
  const id = typeof rawId === "string" ? rawId : Array.isArray(rawId) ? rawId[0] : undefined;
  const { formatPrice } = useCurrency();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(()=>{
    loadOrder();
  },[id]);

  const loadOrder = async()=>{
    try{
      const data = await getOrderById(id);
      setOrder(data);
    }catch(error){
      console.log(
        "Order details error",
        error
      );
    }finally{
      setLoading(false);
    }
  };

  const handleCancel = async()=>{
    try{
      setCancelling(true);
      await cancelOrder(id);
      await loadOrder();
    }catch(error){
      console.log(error);
    }finally{
      setCancelling(false);
    }
  };

  if(loading){
    return (
      <div className="
      min-h-screen
      flex
      items-center
      justify-center
      ">
        Loading order...
      </div>
    );
  }

  if(!order){
    return (
      <div className="
      min-h-screen
      flex
      items-center
      justify-center
      text-red-500
      ">
        Order not found
      </div>
    );
  }

  return (
    <div className="
    min-h-screen
    bg-gray-50
    p-4
    md:p-8
    space-y-6
    ">
      {/* Header */}
      <div className="
      flex
      items-center
      justify-between
      ">
        <Link
          href="/dashboard/orders"
          className="
          flex
          items-center
          gap-2
          text-gray-600
          "
        >
          <ArrowLeft size={18}/>
          Back
        </Link>

        <div>
          <h1 className="
          text-3xl
          font-bold
          ">
            Order Details
          </h1>
          <p className="
          text-gray-500
          ">
            #{order._id.slice(-8)}
          </p>
        </div>
      </div>

      {/* Status & Track Button */}
      <div className="
      bg-white
      rounded-2xl
      p-6
      shadow-sm
      space-y-6
      ">
        <div className="
        flex
        items-center
        justify-between
        ">
          <h2 className="
          text-xl
          font-bold
          ">
            Order Status
          </h2>

          <Link
            href={`/dashboard/orders/track/${order._id}`}
            className="
            flex
            items-center
            gap-2
            bg-gray-100
            hover:bg-gray-200
            text-gray-800
            px-4
            py-2
            rounded-xl
            text-sm
            font-medium
            transition
            "
          >
            <Truck size={16}/>
            Track Order
          </Link>
        </div>

        <OrderTimeline
          status={order.orderStatus}
        />
      </div>

      {/* Shipping */}
      <ShippingCard
        address={order.shippingAddress}
      />

      {/* Items */}
      <div className="
      bg-white
      rounded-2xl
      p-6
      shadow-sm
      ">
        <div className="
        flex
        items-center
        gap-3
        mb-5
        ">
          <Package/>
          <h2 className="
          text-xl
          font-bold
          ">
            Products
          </h2>
        </div>

        <div className="
        space-y-4
        ">
          {
            order.items?.map(
              (item:any)=>(
                <div
                  key={item._id}
                  className="
                  flex
                  justify-between
                  border-b
                  pb-4
                  "
                >
                  <div>
                    <p className="
                    font-semibold
                    ">
                      {item.name}
                    </p>
                    <p className="
                    text-sm
                    text-gray-500
                    ">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <p className="
                  font-bold
                  ">
                    {formatPrice(item.price)}
                  </p>
                </div>
              )
            )
          }
        </div>
      </div>

      {/* Payment Summary */}
      <div className="
      bg-white
      rounded-2xl
      p-6
      shadow-sm
      ">
        <div className="
        flex
        items-center
        gap-3
        mb-5
        ">
          <CreditCard/>
          <h2 className="
          text-xl
          font-bold
          ">
            Payment
          </h2>
        </div>

        <div className="
        space-y-2
        text-gray-600
        ">
          <p>
            Method:
            <b>
              {" "}
              {order.paymentMethod}
            </b>
          </p>

          <p>
            Status:
            <b>
              {" "}
              {order.paymentStatus}
            </b>
          </p>

          <p className="
          text-xl
          font-bold
          text-black
          mt-4
          ">
            Total: {formatPrice(order.totalPrice)}
          </p>
        </div>
      </div>

      {/* Cancel Button */}
      {
        order.orderStatus==="pending" &&
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="
          bg-red-500
          text-white
          px-6
          py-3
          rounded-xl
          hover:bg-red-600
          disabled:opacity-50
          "
        >
          {
            cancelling
            ?
            "Canceling..."
            :
            "Cancel Order"
          }
        </button>
      }
    </div>
  );
}
