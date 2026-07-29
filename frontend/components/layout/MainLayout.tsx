"use client";

import { usePathname } from "next/navigation";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AddressPinBar from "@/components/common/AddressPinBar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isHomePage = pathname === "/";

  return (
    <div className="flex min-h-screen flex-col">
      {!isAdmin && <Header />}

      {isHomePage && !isAdmin && <AddressPinBar />}

      <main className="flex-1 pb-28 sm:pb-32">{children}</main>

      {!isAdmin && <Footer />}
    </div>
  );
}
