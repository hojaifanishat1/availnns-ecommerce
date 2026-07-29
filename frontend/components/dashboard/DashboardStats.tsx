"use client";

import {
  ShoppingBag,
  Clock,
  CheckCircle,
  Wallet
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

interface Props {
  stats: {
    totalOrders: number;
    pendingOrders: number;
    deliveredOrders: number;
    totalSpent: number;
  };
}

export default function DashboardStats({
  stats
}: Props) {
  const { formatPrice } = useCurrency();

  const cards = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: <ShoppingBag size={24} />
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: <Clock size={24} />
    },
    {
      title: "Delivered",
      value: stats.deliveredOrders,
      icon: <CheckCircle size={24} />
    },
    {
      title: "Total Spent",
      value: formatPrice(stats.totalSpent),
      icon: <Wallet size={24} />
    },
  ];

  return (
    <div
      className="
      grid
      grid-cols-1
      sm:grid-cols-2
      xl:grid-cols-4
      gap-5
      mb-6
      "
    >
      {
        cards.map((card) => (
          <div
            key={card.title}
            className="
            bg-white
            rounded-2xl
            p-6
            shadow-sm
            flex
            justify-between
            items-center
            "
          >
            <div>
              <p
                className="
                text-gray-500
                text-sm
                "
              >
                {card.title}
              </p>
              <h2
                className="
                text-3xl
                font-bold
                mt-2
                "
              >
                {card.value}
              </h2>
            </div>
            <div
              className="
              w-12
              h-12
              rounded-xl
              bg-black
              text-white
              flex
              items-center
              justify-center
              "
            >
              {card.icon}
            </div>
          </div>
        ))
      }
    </div>
  );
}
