"use client";

import { ReactNode } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { CurrencyProvider } from "@/context/CurrencyContext";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <CurrencyProvider>
      <AdminGuard>
        {children}
      </AdminGuard>
    </CurrencyProvider>
  );
}
