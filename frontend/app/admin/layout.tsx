"use client";

import { ReactNode, useState } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { CurrencyProvider } from "@/context/CurrencyContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <CurrencyProvider>
      <AdminGuard>
        <div className="min-h-screen bg-gray-50 flex">
          {/* Sidebar */}
          <AdminSidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col lg:pl-72">
            {/* Header - এটি লেআউটে একবারই থাকবে */}
            <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

            <main className="flex-1 p-4 sm:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </AdminGuard>
    </CurrencyProvider>
  );
}
