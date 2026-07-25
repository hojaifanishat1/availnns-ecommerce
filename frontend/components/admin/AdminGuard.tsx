"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Jodi current page login page hoy, tahole guard check korar dorkar nei
    if (pathname === "/admin/login") {
      setChecking(false);
      return;
    }

    try {
      const user = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (!user || !token) {
        setChecking(false);
        router.replace("/admin/login");
        return;
      }

      const data = JSON.parse(user);

      if (data.role !== "admin") {
        localStorage.clear();
        setChecking(false);
        router.replace("/admin/login");
        return;
      }

      setChecking(false);
    } catch (err) {
      localStorage.clear();
      setChecking(false);
      router.replace("/admin/login");
    }
  }, [router, pathname]);

  // Jodi login page hoy, tahole shudhu children render korbe (guard bypass kore)
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100">
        <div className="flex items-center gap-3 text-gray-600">
          <div className="h-6 w-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
          <span>Checking Admin Access...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 flex">
      <AdminSidebar />
      <div className="flex-1 lg:ml-72">
        <AdminHeader />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
