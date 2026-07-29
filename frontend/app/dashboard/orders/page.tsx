"use client";

import {
  useEffect,
  useState
} from "react";

import Link from "next/link";

import {
  Eye,
  Package,
  Truck
} from "lucide-react";

import {
  getMyOrders
} from "@/services/order.service";

import {
  useCurrency
} from "@/context/CurrencyContext";

export default function MyOrdersPage(){
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(()=>{
    loadOrders();
  },[]);

  const loadOrders = async()=>{
    try{
      const data = await getMyOrders();
      setOrders(data);
    }catch(error){
      console.log(
        "Orders error",
        error
      );
    }finally{
      setLoading(false);
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
        Loading orders...
      </div>
    );
  }

  return (
    <div className="
    min-h-screen
    bg-gray-50
    p-4
    md:p-8
    ">
      <h1 className="
      text-3xl
      font-bold
      mb-6
      ">
        My Orders
      </h1>

      {
        orders.length===0 ?
        (
          <div className="
          bg-white
          rounded-2xl
          p-10
          text-center
          shadow-sm
          ">
            <Package
              size={45}
              className="
              mx-auto
              mb-4
              "
            />
            <h2 className="
            text-xl
            font-bold
            ">
              No Orders Yet
            </h2>
            <p className="
            text-gray-500
            mt-2
            ">
              You have not placed any order
            </p>
          </div>
        )
        :
        (
          <div className="
          space-y-5
          ">
            {
              orders.map(
                (order)=>(
                  <div
                    key={order._id}
                    className="
                    bg-white
                    rounded-2xl
                    p-5
                    shadow-sm
                    hover:shadow-md
                    transition
                    "
                  >
                    <div className="
                    flex
                    flex-col
                    md:flex-row
                    md:items-center
                    md:justify-between
                    gap-4
                    ">
                      <div>
                        <p className="
                        text-sm
                        text-gray-500
                        ">
                          Order ID
                        </p>
                        <h2 className="
                        font-bold
                        ">
                          #{order._id.slice(-8)}
                        </h2>
                      </div>

                      <div>
                        <p className="
                        text-sm
                        text-gray-500
                        ">
                          Date
                        </p>
                        <p className="
                        font-medium
                        ">
                          {
                            new Date(
                              order.createdAt
                            )
                            .toLocaleDateString()
                          }
                        </p>
                      </div>

                      <div>
                        <p className="
                        text-sm
                        text-gray-500
                        ">
                          Status
                        </p>
                        <span
                          className={`
                          inline-block
                          px-3
                          py-1
                          rounded-full
                          text-xs
                          font-semibold
                          ${
                            order.orderStatus==="delivered"
                            ?
                            "bg-green-100 text-green-700"
                            :
                            order.orderStatus==="cancelled"
                            ?
                            "bg-red-100 text-red-700"
                            :
                            "bg-yellow-100 text-yellow-700"
                          }
                          `}
                        >
                          {order.orderStatus}
                        </span>
                      </div>

                      <div>
                        <p className="
                        text-sm
                        text-gray-500
                        ">
                          Amount
                        </p>
                        <p className="
                        font-bold
                        ">
                          {formatPrice(order.totalPrice)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/orders/${order._id}`}
                          className="
                          flex
                          items-center
                          justify-center
                          gap-2
                          bg-black
                          text-white
                          px-4
                          py-2
                          rounded-xl
                          text-sm
                          "
                        >
                          <Eye size={16}/>
                          View
                        </Link>

                        <Link
                          href={`/dashboard/orders/track/${order._id}`}
                          className="
                          flex
                          items-center
                          justify-center
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
                          Track
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              )
            }
          </div>
        )
      }
    </div>
  );
}
