"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Users,
  FolderTree,
  ShoppingCart,
  DollarSign,
  Star,
  Flame,
  AlertTriangle,
  Plus,
  ListOrdered,
  Tags,
  Bell,
  Zap, // Deal আইকন ইমপোর্ট করা হলো
} from "lucide-react";

import useAdminAuth from "@/hooks/useAdminAuth";
import { getDashboardStats } from "@/services/dashboard.service";
import OrderChart from "@/components/admin/OrderChart";
import SalesChart from "@/components/admin/SalesChart";
import TopProducts from "@/components/admin/TopProducts";

type Stats = {
  totalProducts: number;
  totalUsers: number;
  totalCategories: number;
  totalOrders: number;
  totalRevenue: number;
  featuredProducts: number;
  bestSellerProducts: number;
  lowStockProducts: number;
  dealProducts?: number; // Deal স্ট্যাটস টাইপ যোগ করা হলো
};

export default function AdminDashboardPage() {
  const { loading: authLoading } = useAdminAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Unauthorized");
          return;
        }
        const data = await getDashboardStats(token);
        setStats(data);
      } catch (err: any) {
        setError(err.message || "Dashboard failed");
      }
    };

    if (!authLoading) {
      loadDashboard();
    }
  }, [authLoading]);

  if (authLoading || !stats) {
    return (
      <div className="flex h-screen items-center justify-center font-semibold">
        Loading Dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-100 p-5 text-red-600">{error}</div>
    );
  }

  const cards = [
    { title: "Products", value: stats.totalProducts, icon: <Package /> },
    { title: "Customers", value: stats.totalUsers, icon: <Users /> },
    { title: "Categories", value: stats.totalCategories, icon: <FolderTree /> },
    { title: "Orders", value: stats.totalOrders, icon: <ShoppingCart /> },
    { title: "Revenue", value: `$${stats.totalRevenue}`, icon: <DollarSign /> },
    { title: "Featured", value: stats.featuredProducts, icon: <Star /> },
    { title: "Best Sellers", value: stats.bestSellerProducts, icon: <Flame /> },
    { title: "Deals", value: stats.dealProducts || 0, icon: <Zap /> }, // ডিল প্রোডাক্ট কার্ড যোগ করা হলো
    { title: "Low Stock", value: stats.lowStockProducts, icon: <AlertTriangle /> },
  ];

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-black">Admin Dashboard</h1>
        <p className="mt-2 text-gray-500">Manage your ecommerce business</p>
      </div>

      {/* QUICK ACTION */}
      <div className="grid gap-5 md:grid-cols-4">
        <Link href="/admin/products/add" className="flex items-center gap-3 rounded-3xl bg-black p-5 text-white transition hover:scale-[1.02]">
          <Plus /> Add Product
        </Link>
        <Link href="/admin/products" className="flex items-center gap-3 rounded-3xl border bg-white p-5 hover:shadow-lg">
          <ListOrdered /> Products
        </Link>
        <Link href="/admin/categories" className="flex items-center gap-3 rounded-3xl border bg-white p-5 hover:shadow-lg">
          <Tags /> Categories
        </Link>
        <Link href="/admin/notifications" className="flex items-center gap-3 rounded-3xl border bg-white p-5 hover:shadow-lg text-blue-600 font-semibold">
          <Bell /> Notifications
        </Link>
      </div>

      {/* STATS */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, index) => (
          <div key={index} className="rounded-3xl border bg-white p-6 shadow-sm transition hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <h2 className="mt-3 text-3xl font-black">{card.value}</h2>
              </div>
              <div className="rounded-2xl bg-gray-100 p-4">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* LOW STOCK */}
      {stats.lowStockProducts > 0 && (
        <div className="flex items-center gap-4 rounded-3xl border bg-red-50 p-6">
          <AlertTriangle className="text-red-600" />
          <div>
            <h3 className="text-lg font-bold">Inventory Alert</h3>
            <p className="text-gray-600">{stats.lowStockProducts} products need restocking</p>
          </div>
        </div>
      )}

      {/* CHARTS */}
      <div className="grid gap-6 xl:grid-cols-2">
        <OrderChart />
        <SalesChart />
      </div>

      {/* TOP PRODUCTS */}
      <TopProducts />
    </div>
  );
}
